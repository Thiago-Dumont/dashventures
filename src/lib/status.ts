export type StatusKey =
  | "novo"
  | "em_andamento"
  | "aguardando_humano"
  | "agendado"
  | "encerrado"
  | "cancelado";

export const STATUS_LABEL: Record<StatusKey, string> = {
  novo: "Novo",
  em_andamento: "Em andamento",
  aguardando_humano: "Aguardando humano",
  agendado: "Agendado",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
};

export const STATUS_ORDER: StatusKey[] = [
  "novo",
  "em_andamento",
  "aguardando_humano",
  "agendado",
  "encerrado",
  "cancelado",
];

export function mapStatus(raw: string | null | undefined): StatusKey {
  const s = (raw ?? "").trim().toLowerCase();
  if (!s) return "novo";
  if (s === "ativo") return "em_andamento";
  if (s === "aguardando_humano") return "aguardando_humano";
  if (s === "agendado") return "agendado";
  if (s === "encerrado") return "encerrado";
  if (s === "cancelado") return "cancelado";
  return "novo";
}

export const STATUS_COLOR: Record<StatusKey, string> = {
  novo: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  em_andamento: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  aguardando_humano: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  agendado: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  encerrado: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  cancelado: "bg-rose-500/20 text-rose-300 border-rose-500/40",
};
