import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to get the Supabase user ID (UUID format) from the current session.
 * This is different from Clerk's user ID and is required for database queries.
 */
export function useSupabaseUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUserId(session?.user?.id || null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    userId,
    isLoading,
    isAuthenticated: !!userId,
  };
}
