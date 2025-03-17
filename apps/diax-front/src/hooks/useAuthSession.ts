import { handleSignOut } from '../components/layout/user-popover';
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useAuthSession() {
  const { data: session, status, update } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!session?.accessToken || !session.expires_at) return;

    const refreshTime = session.expires_at - Date.now() - 60000; // Refresh 1 min before expiry

    if (refreshTime > 0) {
      const timeout = setTimeout(async () => {
        setIsRefreshing(true);
        try {
          await update(); // This will trigger NextAuth's `jwt` callback
        } catch (error) {
          console.error("Failed to refresh token:", error);
          handleSignOut();
        }
        setIsRefreshing(false);
      }, refreshTime);

      return () => clearTimeout(timeout); // Cleanup
    }
  }, [session, update]);

  return { session, status, isRefreshing };
}
