import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";

export function useAuth() {
  const { isLoaded, isSignedIn, signOut: clerkSignOut } = useClerkAuth();
  const { user } = useUser();

  const signOut = async () => {
    await clerkSignOut();
  };

  return {
    user: user ? { 
      id: user.id, 
      email: user.primaryEmailAddress?.emailAddress || "",
      user_metadata: {
        full_name: user.fullName || user.firstName || "",
      }
    } : null,
    session: isSignedIn ? { user } : null,
    loading: !isLoaded,
    signUp: async () => ({ error: null }), // Handled by Clerk UI
    signIn: async () => ({ error: null, data: null }), // Handled by Clerk UI
    signOut,
  };
}
