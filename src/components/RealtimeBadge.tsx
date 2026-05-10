import { useConversations } from "@/hooks/use-conversations";

const LABEL = {
  connected: "Realtime conectado",
  connecting: "Conectando…",
  disconnected: "Sem conexão",
} as const;

const COLOR = {
  connected: "bg-emerald-400",
  connecting: "bg-amber-400",
  disconnected: "bg-rose-400",
} as const;

export default function RealtimeBadge() {
  const { realtime } = useConversations();
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground">
      <span className="relative flex h-2 w-2">
        {realtime === "connected" && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 animate-ping" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${COLOR[realtime]}`} />
      </span>
      {LABEL[realtime]}
    </div>
  );
}
