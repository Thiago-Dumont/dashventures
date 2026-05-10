import { useMemo } from "react";
import { useConversations } from "@/hooks/use-conversations";
import { mapStatus, STATUS_LABEL, STATUS_ORDER, STATUS_COLOR } from "@/lib/status";
import { scoreConversation } from "@/lib/lead-score";

export default function KanbanPage() {
  const { data, loading } = useConversations();

  const cols = useMemo(() => {
    const map: Record<string, typeof data> = {};
    STATUS_ORDER.forEach((s) => (map[s] = []));
    for (const c of data) map[mapStatus(c.status)].push(c);
    return map;
  }, [data]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Kanban</h1>
        <p className="text-sm text-muted-foreground">Conversas agrupadas por status.</p>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Carregando…</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {STATUS_ORDER.map((s) => (
          <div key={s} className="rounded-xl border border-border bg-card flex flex-col min-h-[200px]">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${STATUS_COLOR[s].split(" ")[0]}`} />
                <span className="text-sm font-medium">{STATUS_LABEL[s]}</span>
              </div>
              <span className="text-xs text-muted-foreground">{cols[s].length}</span>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto max-h-[70vh]">
              {cols[s].map((c) => {
                const lead = scoreConversation(c, data);
                return (
                  <div key={String(c.id)} className="rounded-md border border-border/60 bg-background/60 p-3 text-sm">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium truncate">{c.number ?? "—"}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${lead.color}`}>
                        {lead.score}
                      </span>
                    </div>
                    {c.intent && (
                      <div className="text-xs text-muted-foreground mt-0.5">{c.intent}</div>
                    )}
                    <div className="mt-1 text-xs line-clamp-2 text-foreground/80">
                      {c.user_message ?? "—"}
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      {c.created_at ? new Date(c.created_at).toLocaleString("pt-BR") : ""}
                    </div>
                  </div>
                );
              })}
              {cols[s].length === 0 && (
                <div className="text-xs text-muted-foreground p-3 text-center">Vazio</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
