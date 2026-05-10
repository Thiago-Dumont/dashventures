import { useMemo } from "react";
import { useConversations } from "@/hooks/use-conversations";
import { mapStatus, STATUS_LABEL, STATUS_ORDER, STATUS_COLOR, type StatusKey } from "@/lib/status";
import { scoreConversation } from "@/lib/lead-score";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

const COL_ACCENT: Record<StatusKey, string> = {
  novo: "border-t-slate-400/60",
  em_andamento: "border-t-blue-400/70",
  aguardando_humano: "border-t-amber-400/80",
  agendado: "border-t-violet-400/70",
  encerrado: "border-t-emerald-400/70",
  cancelado: "border-t-rose-400/70",
};

export default function KanbanPage() {
  const { data, loading } = useConversations();

  const cols = useMemo(() => {
    const map: Record<StatusKey, typeof data> = {
      novo: [], em_andamento: [], aguardando_humano: [], agendado: [], encerrado: [], cancelado: [],
    };
    for (const c of data) map[mapStatus(c.status)].push(c);
    return map;
  }, [data]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Kanban" subtitle="Conversas agrupadas por status." />

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      )}

      {!loading && data.length === 0 && <EmptyState description="Sem conversas para organizar ainda." />}

      {!loading && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {STATUS_ORDER.map((s) => (
            <div
              key={s}
              className={`rounded-xl border border-t-2 border-border bg-card flex flex-col min-h-[220px] shadow-elegant ${COL_ACCENT[s]}`}
            >
              <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 bg-card rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{STATUS_LABEL[s]}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-background/60 rounded-full px-2 py-0.5 tabular-nums">
                  {cols[s].length}
                </span>
              </div>
              <div className="p-2 space-y-2 overflow-y-auto max-h-[68vh] scrollbar-thin">
                {cols[s].map((c) => {
                  const lead = scoreConversation(c, data);
                  const isHot = lead.tier === "quente";
                  const isWaiting = s === "aguardando_humano";
                  return (
                    <div
                      key={String(c.id)}
                      className={`rounded-lg border p-3 text-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant animate-fade-in-up ${
                        isHot
                          ? "border-rose-500/40 bg-rose-500/5"
                          : isWaiting
                          ? "border-amber-500/40 bg-amber-500/5"
                          : "border-border/60 bg-background/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium truncate">{c.number ?? "—"}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${lead.color} tabular-nums`}>
                          {lead.score}
                        </span>
                      </div>
                      {c.intent && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">{c.intent}</div>
                      )}
                      <div className="mt-1 text-xs line-clamp-2 text-foreground/80">
                        {c.user_message ?? "—"}
                      </div>
                      <div className="mt-1.5 text-[10px] text-muted-foreground">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
                          : ""}
                      </div>
                    </div>
                  );
                })}
                {cols[s].length === 0 && (
                  <div className="text-xs text-muted-foreground p-4 text-center opacity-60">Vazio</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
