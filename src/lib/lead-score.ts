import type { Conversation } from "./supabase";
import { resolveStatus } from "./status";

export type LeadTier = "quente" | "morno" | "frio" | "baixa";

export type LeadScore = {
  score: number;
  tier: LeadTier;
  label: string;
  color: string;
};

const TIER: Record<LeadTier, { label: string; color: string }> = {
  quente: { label: "Lead quente", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
  morno: { label: "Lead morno", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  frio: { label: "Lead frio", color: "bg-sky-500/20 text-sky-300 border-sky-500/40" },
  baixa: { label: "Baixa intenção", color: "bg-slate-500/20 text-slate-400 border-slate-500/40" },
};

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export function scoreConversation(c: Conversation, all: Conversation[]): LeadScore {
  const intent = (c.intent ?? "").trim().toUpperCase();
  let score = 0;
  if (intent === "AGENDAR" || intent === "CONFIRMAR") score += 40;
  if (intent === "REAGENDAR") score += 30;
  if (intent === "CANCELAR") score -= 20;

  const sameNumber = c.number ? all.filter((x) => x.number === c.number).length : 0;
  if (sameNumber > 1) score += 20;
  if (c.created_at && isToday(c.created_at)) score += 10;

  score = Math.max(0, Math.min(100, score));

  let tier: LeadTier = "baixa";
  if (score >= 80) tier = "quente";
  else if (score >= 50) tier = "morno";
  else if (score >= 20) tier = "frio";

  return { score, tier, ...TIER[tier] };
}
