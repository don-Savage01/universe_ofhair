"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function useProductUpdates(onProductUpdate: (product: any) => void) {
  const channelRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Create new channel
    const channel = supabase.channel("products-realtime").on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "products",
      },
      (payload) => {
        // Only process if component is still mounted
        if (!isMountedRef.current) return;

        if (payload.new) {
          onProductUpdate(payload.new);
        } else if (payload.eventType === "DELETE") {
          onProductUpdate(null);
        }
      },
    );

    // Store channel in ref
    channelRef.current = channel;

    // Subscribe
    channel.subscribe();

    // CLEANUP FUNCTION - SIMPLIFIED
    return () => {
      isMountedRef.current = false;

      // Get the current channel
      const currentChannel = channelRef.current;

      if (currentChannel) {
        try {
          // Just unsubscribe - don't try to remove the channel
          currentChannel.unsubscribe();
        } catch (error) {
          // Silently handle cleanup errors
        } finally {
          channelRef.current = null;
        }
      }
    };
  }, [onProductUpdate]); // Keep onProductUpdate in dependencies
}
