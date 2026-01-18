import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  space_id: string | null;
  created_at: string;
}

// Get the Supabase user ID (UUID format) from the current session
async function getSupabaseUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

export function useNotifications() {
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get and cache the Supabase user ID
  useEffect(() => {
    getSupabaseUserId().then(setSupabaseUserId);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
      const userId = await getSupabaseUserId();
      setSupabaseUserId(userId);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Use React Query for efficient caching and deduplication
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", supabaseUserId],
    queryFn: async () => {
      if (!supabaseUserId) return [];
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", supabaseUserId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      return (data || []) as Notification[];
    },
    enabled: !!supabaseUserId,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 60000, // Keep in cache for 1 minute
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["notifications", supabaseUserId] });
    }
  }, [supabaseUserId, queryClient]);

  const markAllAsRead = useCallback(async () => {
    if (!supabaseUserId) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", supabaseUserId)
      .eq("read", false);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["notifications", supabaseUserId] });
    }
  }, [supabaseUserId, queryClient]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["notifications", supabaseUserId] });
    }
  }, [supabaseUserId, queryClient]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications", supabaseUserId] });
  }, [supabaseUserId, queryClient]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!supabaseUserId) return;

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${supabaseUserId}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseUserId, refetch]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  };
}
