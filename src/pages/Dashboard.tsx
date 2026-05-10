import { useMemo } from "react";
import { useConversations } from "@/hooks/use-conversations";
import { mapStatus } from "@/lib/status";
import { MessageSquare, Users, Calendar as CalIcon, UserCheck, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`p-2 rounded-md ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error, refresh } = useConversations();

  const stats = useMemo(() => {
    const today = new Date();
    const sameDay = (iso: string) => {
      const d = new Date(iso);
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    };
    const numbers = new Set<string>();
    let todayCount = 0;
    let waiting = 0;
    let closed = 0;
    let canceled = 0;
    for (const c of data) {
      if (c.number) numbers.add(c.number);
      if (c.created_at && sameDay(c.created_at)) todayCount++;
      const s = mapStatus(c.status);
      if (s === "aguardando_humano") waiting++;
      if (s === "encerrado") closed++;
      if (s === "cancelado") canceled++;
    }
    return {
      total: data.length,
      uniqueNumbers: numbers.size,
      today: todayCount,
      waiting,
      closed,
      canceled,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral das conversas em tempo real.</p>
        </div>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" /> Atualizar
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
          Erro ao carregar dados: {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        <StatCard icon={MessageSquare} label="Total de conversas" value={loading ? "…" : stats.total} accent="bg-blue-500/15 text-blue-300" />
        <StatCard icon={Users} label="Números únicos" value={loading ? "…" : stats.uniqueNumbers} accent="bg-emerald-500/15 text-emerald-300" />
        <StatCard icon={CalIcon} label="Conversas hoje" value={loading ? "…" : stats.today} accent="bg-violet-500/15 text-violet-300" />
        <StatCard icon={UserCheck} label="Aguardando humano" value={loading ? "…" : stats.waiting} accent="bg-amber-500/15 text-amber-300" />
        <StatCard icon={CheckCircle2} label="Encerradas" value={loading ? "…" : stats.closed} accent="bg-teal-500/15 text-teal-300" />
        <StatCard icon={XCircle} label="Cancelamentos" value={loading ? "…" : stats.canceled} accent="bg-rose-500/15 text-rose-300" />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <h2 className="text-base font-semibold mb-3">Últimas conversas</h2>
        <div className="space-y-2">
          {loading && <div className="text-sm text-muted-foreground">Carregando…</div>}
          {!loading && data.slice(0, 8).map((c) => (
            <div key={String(c.id)} className="flex items-start gap-3 p-3 rounded-md border border-border/60 hover:bg-accent/30">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{c.number ?? "—"}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{c.intent ?? "sem intent"}</span>
                </div>
                <div className="mt-1 text-sm truncate">{c.user_message ?? "—"}</div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {c.created_at ? new Date(c.created_at).toLocaleString("pt-BR") : ""}
              </div>
            </div>
          ))}
          {!loading && data.length === 0 && (
            <div className="text-sm text-muted-foreground">Nenhuma conversa encontrada.</div>
          )}
        </div>
      </div>
    </div>
  );
}
