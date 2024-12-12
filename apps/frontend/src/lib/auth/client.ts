"use client";

import { IdToken, User } from '@/types/user';
import { jwtDecode } from "jwt-decode";
import { getSiteURL } from "../get-site-url";

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, "0")).join("");
}

export interface SignInWithOAuthParams {
  provider: "google" | "discord" | "cognito";
  accessToken: string | undefined;
  idToken?: string | undefined;
}

class AuthClient {
  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    if (!_.accessToken) return { error: "Not token" };
    localStorage.setItem("custom-auth-token", _.accessToken ?? "");
    localStorage.setItem("custom-provider", "cognito");
    localStorage.setItem("custom-auth-idToken", _.idToken ?? "");
    return {};
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    try {
      const token = localStorage.getItem("custom-auth-token");
      const idToken = localStorage.getItem("custom-auth-idToken");

      if (!token || !idToken) {
        return { data: null };
      }

      // Decodifica el token
      const decodedToken: IdToken = jwtDecode(idToken);

      const user: User = {
        id: decodedToken.event_id,
        email: decodedToken.email,
        name: decodedToken["cognito:username"],
      };

      return { data: user };
    } catch (error) {
      console.error("Error decoding token:", error);
      return { error: "Failed to decode ID token." };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    const signOutRedirect = () => {
      const clientId = "1dgddk7rc0bir0mt3g403kojcc";
      const logoutUri = getSiteURL().concat("auth/sign-in");
      const cognitoDomain =
       getSiteURL("auth");
      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
        logoutUri
      )}`;
    };

    localStorage.removeItem("custom-auth-token");

    if (
      localStorage.getItem("custom-provider") &&
      localStorage.getItem("custom-provider") == "cognito"
    ) {
      localStorage.removeItem("custom-provider");
      localStorage.removeItem("custom-auth-idToken");
      signOutRedirect();
    }

    return {};
  }
}

export const authClient = new AuthClient();
