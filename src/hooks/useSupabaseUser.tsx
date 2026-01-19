import { useUser } from "@clerk/clerk-react";

/**
 * Hook to get the User ID from Clerk.
 * Originally designed for Supabase Auth, but now adapted for Clerk.
 */
export function useSupabaseUser() {
  const { user, isLoaded } = useUser();

  return {
    userId: user?.id || null,
    isLoading: !isLoaded,
    isAuthenticated: !!user,
  };
}
