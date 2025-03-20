import NextAuth, { NextAuthOptions, Session, Account } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID || "",
      clientSecret: process.env.COGNITO_CLIENT_SECRET || "",
      issuer: process.env.COGNITO_ISSUER,
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (account) {
        const expires_in = account.expires_in? account.expires_in: 0;
        return {
          ...token,
          access_token: account.access_token,
          expires_at: Date.now() + Number(expires_in) * 1000, // Store expires_at in milliseconds
          refresh_token: account.refresh_token,
        };
      }

      if (token.expires_at && Date.now() < token.expires_at) {
        return token; // Access token is still valid
      }

      if (!token.refresh_token) {
        console.error("Missing refresh token");
        return { ...token, error: "RefreshTokenError", message: "Missing refresh token" };
      }

      try {
        const response = await fetch(`${process.env.COGNITO_TOKEN_ENDPOINT}`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.COGNITO_CLIENT_ID ?? "",            
            grant_type: "refresh_token",
            refresh_token: token.refresh_token,
          }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
          console.error("Failed to refresh token", refreshedTokens);
          throw refreshedTokens;
        }

        return {
          ...token,
          access_token: refreshedTokens.access_token,
          expires_at: Date.now() + refreshedTokens.expires_in * 1000, // Convert seconds to milliseconds
          refresh_token: refreshedTokens.refresh_token || token.refresh_token, // Preserve if Cognito doesn't return a new one,
          message:refreshedTokens
        };
      } catch (error) {
        console.error("Error refreshing access token", error);
        return { ...token, error: "RefreshTokenError", message: error };
      }
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      return {
        ...session,
        accessToken: token.access_token,
        error: token.error,
        expires_at:token.expires_at,
        message: token.message
      };
    },
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Extend NextAuth types for TypeScript support
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    expires_at?:number;
    error?: "RefreshTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    expires_at?: number;
    refresh_token?: string;
    error?: "RefreshTokenError";
  }
}
