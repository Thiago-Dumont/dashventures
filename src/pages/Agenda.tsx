import { useMemo, useState } from "react";
import { useConversations } from "@/hooks/use-conversations";
import { Send, AlertTriangle, CheckCircle2 } from "lucide-react";

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
      setFeedback({
        id: String(c.id),
        ok: res.ok,
        msg: res.ok ? "Enviado para o n8n" : `Falhou (${res.status})`,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      setFeedback({ id: String(c.id), ok: false, msg });
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Agenda via n8n</h1>
        <p className="text-sm text-muted-foreground">Integração futura com Google Agenda via n8n.</p>
      </div>

      {!webhook && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            Webhook do n8n não configurado. Defina <code className="px-1 py-0.5 rounded bg-background/60">VITE_N8N_WEBHOOK_CREATE_EVENT</code> no
            arquivo <code className="px-1 py-0.5 rounded bg-background/60">.env</code> para habilitar o envio.
          </div>
        </div>
      )}

      {loading && <div className="text-sm text-muted-foreground">Carregando…</div>}

      <div className="space-y-2">
        {items.length === 0 && !loading && (
          <div className="text-sm text-muted-foreground p-6 rounded-md border border-border bg-card text-center">
            Nenhuma conversa com intent AGENDAR, REAGENDAR ou CONFIRMAR.
          </div>
        )}
        {items.map((c) => {
          const fb = feedback?.id === String(c.id) ? feedback : null;
          return (
            <div key={String(c.id)} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{c.number ?? "—"}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                      {c.intent}
                    </span>
                  </div>
                  <div className="mt-1 text-sm">{c.user_message ?? "—"}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {c.created_at ? new Date(c.created_at).toLocaleString("pt-BR") : ""}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => send(c)}
                    disabled={!webhook || sending === String(c.id)}
                    className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
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
