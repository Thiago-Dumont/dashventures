import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, type Conversation } from "@/lib/supabase";

export type RealtimeStatus = "connecting" | "connected" | "disconnected";

export function useConversations() {
  const [data, setData] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtime, setRealtime] = useState<RealtimeStatus>("connecting");
  const mounted = useRef(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (!mounted.current) return;
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      setData((data ?? []) as Conversation[]);
    }
    setLoading(false);
  }, []);

  // Aplica um INSERT/UPDATE/DELETE recebido via realtime no estado local
  // sem precisar refazer toda a query, garantindo aparecer instantaneamente.
  const applyRealtimeChange = useCallback(
    (payload: {
      eventType: "INSERT" | "UPDATE" | "DELETE";
      new: Partial<Conversation> | null;
      old: Partial<Conversation> | null;
    }) => {
      setData((prev) => {
        if (payload.eventType === "INSERT" && payload.new) {
          const incoming = payload.new as Conversation;
          if (prev.some((c) => String(c.id) === String(incoming.id))) return prev;
          return [incoming, ...prev];
        }
        if (payload.eventType === "UPDATE" && payload.new) {
          const incoming = payload.new as Conversation;
          const idx = prev.findIndex((c) => String(c.id) === String(incoming.id));
          if (idx === -1) return [incoming, ...prev];
          const next = prev.slice();
          next[idx] = { ...next[idx], ...incoming };
          return next;
        }
        if (payload.eventType === "DELETE" && payload.old) {
          return prev.filter((c) => String(c.id) !== String((payload.old as Conversation).id));
        }
        return prev;
      });
    },
    []
  );

  const subscribe = useCallback(() => {
    // Limpa canal antigo antes de criar novo (evita duplicação após reconexão)
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`conversations-rt-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversations" },
        (payload) => {
          applyRealtimeChange({
            eventType: "INSERT",
            new: payload.new as Partial<Conversation>,
            old: null,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversations" },
        (payload) => {
          applyRealtimeChange({
            eventType: "UPDATE",
            new: payload.new as Partial<Conversation>,
            old: payload.old as Partial<Conversation>,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "conversations" },
        (payload) => {
          applyRealtimeChange({
            eventType: "DELETE",
            new: null,
            old: payload.old as Partial<Conversation>,
          });
        }
      )
      .subscribe((status) => {
        if (!mounted.current) return;
        if (status === "SUBSCRIBED") {
          setRealtime("connected");
          // Sincroniza ao (re)conectar para não perder eventos da janela offline.
          fetchAll();
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setRealtime("disconnected");
        } else {
          setRealtime("connecting");
        }
      });

    channelRef.current = channel;
  }, [applyRealtimeChange, fetchAll]);

  useEffect(() => {
    mounted.current = true;
    fetchAll();
    subscribe();

    // Polling de segurança (caso o realtime esteja indisponível na publicação).
    const interval = setInterval(() => {
      if (mounted.current) fetchAll();
    }, 10000);

    // Quando a aba volta a ficar visível, força sincronização imediata
    // e tenta reabrir o canal se ele caiu enquanto estava em background.
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchAll();
        if (channelRef.current?.state !== "joined") {
          subscribe();
        }
      }
    };
    const onFocus = () => fetchAll();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);

    return () => {
      mounted.current = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchAll, subscribe]);

  return { data, loading, error, realtime, refresh: fetchAll };
}
