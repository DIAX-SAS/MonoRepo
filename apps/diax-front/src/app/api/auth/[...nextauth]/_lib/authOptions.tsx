import { NextAuthOptions } from "next-auth";
import Cognito from "next-auth/providers/cognito";
import crypto from "crypto";
import { JWT } from "next-auth/jwt";

async function refreshAccessToken(token: JWT) {
  try {
    const url = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/token`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.COGNITO_CLIENT_ID || '',
        refresh_token: token.refreshToken || '',
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: refreshedTokens.id_token,
      expiresAt: Date.now() + (Number(refreshedTokens.expires_in ?? 0) * 1000), 
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  debug: !!process.env.AUTH_DEBUG,
  providers: [
    Cognito({
      clientId: process.env.COGNITO_CLIENT_ID || '',
      clientSecret: '',
      issuer: `${process.env.COGNITO_URI}/${process.env.COGNITO_USER_POOL_ID}`,
      client: {
        token_endpoint_auth_method: "none"
      },
      authorization: {
        params: {
          response_type: "code",
          scope: "openid profile email phone",
          nonce: crypto.randomBytes(16).toString("base64")
        }
      },
      checks: ["nonce", "state"]
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, user, trigger }) {
     
      if (account) {
        return {
          accessToken: account.access_token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt: Date.now() + (Number(account.expires_in) * 1000),
          ...user
        };
      }
      if (!token.expiresAt || Date.now() > token.expiresAt) {
        return await refreshAccessToken(token);
      }   

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.error = token.error;
      session.expiresTokenAt = token.expiresAt;     
      return session;
    }
  }
};

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    idToken?: string;
    error?: string;
    expiresTokenAt?:number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  }
}