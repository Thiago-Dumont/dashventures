import { useMemo, useState } from "react";
import { useConversations } from "@/hooks/use-conversations";
import { Send, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

const TARGET_INTENTS = ["AGENDAR", "REAGENDAR", "CONFIRMAR"];

export default function Agenda() {
  const { data, loading } = useConversations();
  const webhook = (import.meta.env.VITE_N8N_WEBHOOK_CREATE_EVENT as string) || "";
  const [sending, setSending] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; ok: boolean; msg: string } | null>(null);

  const items = useMemo(
    () => data.filter((c) => TARGET_INTENTS.includes((c.intent ?? "").toUpperCase())),
    [data]
  );

  const send = async (c: (typeof items)[number]) => {
    if (!webhook) return;
    setSending(String(c.id));
    setFeedback(null);
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      setFeedback({ id: String(c.id), ok: res.ok, msg: res.ok ? "Enviado para o n8n" : `Falhou (${res.status})` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      setFeedback({ id: String(c.id), ok: false, msg });
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Agenda via n8n" subtitle="Conversas com intenção de agendamento prontas para envio." />

      {!webhook && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            Webhook do n8n não configurado. Defina <code className="px-1 py-0.5 rounded bg-background/60">VITE_N8N_WEBHOOK_CREATE_EVENT</code> no
            arquivo <code className="px-1 py-0.5 rounded bg-background/60">.env</code> para habilitar o envio.
          </div>
        </div>
      )}

      {loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}

      {!loading && items.length === 0 && (
        <EmptyState
          icon={<Calendar className="h-5 w-5" />}
          title="Nenhuma conversa para agendar"
          description="Conversas com intent AGENDAR, REAGENDAR ou CONFIRMAR aparecem aqui."
        />
      )}

      <div className="space-y-2">
        {items.map((c) => {
          const fb = feedback?.id === String(c.id) ? feedback : null;
          return (
            <div key={String(c.id)} className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-elegant animate-fade-in-up">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{c.number ?? "—"}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-300">
                      {c.intent}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-foreground/90">{c.user_message ?? "—"}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {c.created_at ? new Date(c.created_at).toLocaleString("pt-BR") : ""}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => send(c)}
                    disabled={!webhook || sending === String(c.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-glow"
                  >
                    <Send className="h-4 w-4" />
                    {sending === String(c.id) ? "Enviando…" : "Enviar para n8n"}
                  </button>
                  {fb && (
                    <span className={`text-xs flex items-center gap-1 ${fb.ok ? "text-emerald-300" : "text-rose-300"}`}>
                      {fb.ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {fb.msg}
                    </span>
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
