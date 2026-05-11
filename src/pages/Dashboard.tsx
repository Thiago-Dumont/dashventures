import { useMemo } from "react";
import { useConversations } from "@/hooks/use-conversations";
import { mapStatus, resolveStatus, STATUS_LABEL, STATUS_COLOR, type StatusKey } from "@/lib/status";
import { scoreConversation } from "@/lib/lead-score";
import {
  MessageSquare, Users, Calendar as CalIcon, UserCheck,
  CheckCircle2, XCircle, RefreshCw, Flame, AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
  icon: Icon, label, value, accent, loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  accent: string;
  loading?: boolean;
}) {
  return (
    <div className="group rounded-xl border border-border bg-card p-4 md:p-5 h-[112px] flex flex-col justify-between transition-all duration-200 hover:border-primary/40 hover:shadow-elegant hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-xs md:text-sm text-muted-foreground">{label}</span>
        <div className={`p-2 rounded-lg ${accent} transition-transform group-hover:scale-110`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <div className="text-2xl md:text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error, refresh } = useConversations();

  const stats = useMemo(() => {
    const today = new Date();
    const sameDay = (iso: string) => {
      const d = new Date(iso);
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
    };
    const numbers = new Set<string>();
    let todayCount = 0, waiting = 0, closed = 0, canceled = 0;
    for (const c of data) {
      if (c.number) numbers.add(c.number);
      if (c.created_at && sameDay(c.created_at)) todayCount++;
      const s = resolveStatus(c);
      if (s === "aguardando_humano") waiting++;
      if (s === "encerrado") closed++;
      if (s === "cancelado") canceled++;
    }
    return { total: data.length, uniqueNumbers: numbers.size, today: todayCount, waiting, closed, canceled };
  }, [data]);

  const hotLeads = useMemo(
    () => data.map((c) => ({ c, lead: scoreConversation(c, data) }))
      .filter((x) => x.lead.tier === "quente")
      .slice(0, 5),
    [data]
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral das conversas em tempo real."
        actions={
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Atualizar
          </button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <div>Erro ao carregar dados: {error}</div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        <StatCard loading={loading} icon={MessageSquare} label="Total de conversas" value={stats.total} accent="bg-blue-500/15 text-blue-300" />
        <StatCard loading={loading} icon={Users} label="Números únicos" value={stats.uniqueNumbers} accent="bg-emerald-500/15 text-emerald-300" />
        <StatCard loading={loading} icon={CalIcon} label="Conversas hoje" value={stats.today} accent="bg-violet-500/15 text-violet-300" />
        <StatCard loading={loading} icon={UserCheck} label="Aguardando humano" value={stats.waiting} accent="bg-amber-500/15 text-amber-300" />
        <StatCard loading={loading} icon={CheckCircle2} label="Encerradas" value={stats.closed} accent="bg-teal-500/15 text-teal-300" />
        <StatCard loading={loading} icon={XCircle} label="Cancelamentos" value={stats.canceled} accent="bg-rose-500/15 text-rose-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Últimas conversas</h2>
            <span className="text-xs text-muted-foreground">Atualizado em tempo real</span>
          </div>
          <div className="space-y-2">
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
            {!loading && data.length === 0 && <EmptyState description="Aguardando a primeira conversa do agente." />}
            {!loading && data.slice(0, 8).map((c) => {
              const s = resolveStatus(c) as StatusKey;
              return (
                <div key={String(c.id)} className="p-3 rounded-lg border border-border/60 bg-background/40 hover:bg-accent/40 transition-colors animate-fade-in-up">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-sm flex-wrap min-w-0">
                      <span className="font-medium truncate">{c.number ?? "—"}</span>
                      {c.intent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                          {c.intent}
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLOR[s]}`}>
                        {STATUS_LABEL[s]}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {c.created_at ? new Date(c.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}
                    </div>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <div className="rounded-md bg-background/60 border border-border/60 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Cliente</div>
                      <div className="text-sm text-foreground whitespace-pre-wrap break-words line-clamp-3">{c.user_message ?? "—"}</div>
                    </div>
                    <div className="rounded-md bg-primary/5 border border-primary/20 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-primary/80 mb-0.5">IA</div>
                      <div className="text-xs text-foreground/80 whitespace-pre-wrap break-words line-clamp-2">{c.ai_response ?? "—"}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4 text-rose-400" />
            <h2 className="text-base font-semibold">Leads quentes</h2>
          </div>
          <div className="space-y-2">
            {loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            {!loading && hotLeads.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhum lead quente no momento.</p>
            )}
            {hotLeads.map(({ c, lead }) => (
              <div key={String(c.id)} className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 animate-fade-in-up">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{c.number ?? "—"}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${lead.color}`}>{lead.score}</span>
                </div>
                {c.intent && <div className="text-[11px] text-muted-foreground mt-0.5">{c.intent}</div>}
                <div className="text-xs text-foreground/80 mt-1 line-clamp-2">{c.user_message ?? "—"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
