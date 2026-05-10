import { useEffect, useState, useCallback } from "react";
import { supabase, type Conversation } from "@/lib/supabase";

export function useConversations() {
  const [data, setData] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      setData((data ?? []) as Conversation[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);

    const channel = supabase
      .channel("conversations-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => fetchAll()
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  return { data, loading, error, refresh: fetchAll };
}
