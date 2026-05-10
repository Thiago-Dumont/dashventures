import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type RealtimeStatus = "connecting" | "connected" | "disconnected";

export function useRealtimeStatus(): RealtimeStatus {
  const [status, setStatus] = useState<RealtimeStatus>("connecting");

  useEffect(() => {
    const channel = supabase
      .channel(`rt-status-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {})
      .subscribe((s) => {
        if (s === "SUBSCRIBED") setStatus("connected");
        else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT" || s === "CLOSED") setStatus("disconnected");
        else setStatus("connecting");
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return status;
}
