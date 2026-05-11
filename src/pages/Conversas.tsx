import { useMemo, useState } from "react";
import { useConversations } from "@/hooks/use-conversations";
import { mapStatus, resolveStatus, STATUS_LABEL, STATUS_COLOR, STATUS_ORDER, type StatusKey } from "@/lib/status";
import { scoreConversation } from "@/lib/lead-score";
import { Search, Filter, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export default function Conversas() {
  const { data, loading } = useConversations();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [intent, setIntent] = useState("");
  const [number, setNumber] = useState("");
  const [date, setDate] = useState("");

  const intents = useMemo(() => {
    const set = new Set<string>();
    data.forEach((c) => c.intent && set.add(c.intent));
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((c) => {
      if (status && mapStatus(c.status) !== status) return false;
      if (intent && (c.intent ?? "") !== intent) return false;
      if (number && !(c.number ?? "").includes(number)) return false;
      if (date) {
        const d = c.created_at ? new Date(c.created_at).toISOString().slice(0, 10) : "";
        if (d !== date) return false;
      }
      if (q) {
        const needle = q.toLowerCase();
        const hay = [c.number, c.user_message, c.ai_response, c.intent, c.status]
          .map((x) => (x ?? "").toString().toLowerCase()).join(" ");
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [data, q, status, intent, number, date]);

  const hasFilters = q || status || intent || number || date;
  const clearAll = () => { setQ(""); setStatus(""); setIntent(""); setNumber(""); setDate(""); };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Conversas"
        subtitle={`${filtered.length} de ${data.length} conversas`}
      />

      <div className="rounded-xl border border-border bg-card p-3 md:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" /> Filtros
          </div>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" /> Limpar
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar palavra-chave…"
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Número"
            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Todos status</option>
            {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <select
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Todos intents</option>
            {intents.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <div className="space-y-2">
        {loading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        {!loading && filtered.length === 0 && (
          <EmptyState
            title="Nenhuma conversa encontrada"
            description={hasFilters ? "Tente ajustar ou limpar os filtros." : "Aguardando novas conversas."}
          />
        )}
        {filtered.map((c) => {
          const s = mapStatus(c.status) as StatusKey;
          const lead = scoreConversation(c, data);
          return (
            <div
              key={String(c.id)}
              className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-elegant animate-fade-in-up"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{c.number ?? "—"}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLOR[s]}`}>
                    {STATUS_LABEL[s]}
                  </span>
                  {c.intent && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                      {c.intent}
                    </span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${lead.color}`}>
                    {lead.label} · {lead.score}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {c.created_at ? new Date(c.created_at).toLocaleString("pt-BR") : ""}
                </div>
              </div>
              <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-background/60 border border-border/60 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Usuário</div>
                  {c.user_message && c.user_message.trim() !== "" ? (
                    <div className="whitespace-pre-wrap break-words">{c.user_message}</div>
                  ) : (
                    <div className="italic text-muted-foreground">Mensagem do cliente não registrada</div>
                  )}
                </div>
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-primary/80 mb-1">IA</div>
                  {c.ai_response && c.ai_response.trim() !== "" ? (
                    <div className="whitespace-pre-wrap break-words">{c.ai_response}</div>
                  ) : (
                    <div className="italic text-muted-foreground">Resposta da IA não registrada</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
