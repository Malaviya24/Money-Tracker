import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

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

export function useNotifications() {
  const { userId, isLoading: userLoading } = useSupabaseUser();
  const queryClient = useQueryClient();

  // Use React Query for efficient caching and deduplication
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      return (data || []) as Notification[];
    },
    enabled: !!userId,
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
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    }
  }, [userId, queryClient]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    }
  }, [userId, queryClient]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    }
  }, [userId, queryClient]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
  }, [userId, queryClient]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-changes-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  return {
    notifications,
    unreadCount,
    isLoading: userLoading || isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  };
}
