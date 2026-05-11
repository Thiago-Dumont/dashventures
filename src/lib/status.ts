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

// Detecta se o cliente está pedindo para falar com um humano/atendente.
// Cobre variações com/sem acento, gírias e formas curtas ("humano!", "atendente pf").
const HUMAN_TARGETS =
  "(humano|humana|atendente|pessoa|gente|algu[eé]m|respons[aá]vel|consultor|consultora|vendedor|vendedora|operador|operadora|gerente|suporte|atendimento|recepcionista|secret[aá]ria|secret[aá]rio)";

const HUMAN_REQUEST_PATTERNS: RegExp[] = [
  // "falar com humano", "falar com um atendente", "falar c/ alguém"
  new RegExp(`\\bfalar\\s+(com|c\\/?)\\s+(um|uma|o|a)?\\s*${HUMAN_TARGETS}\\b`, "i"),
  // "quero/preciso/posso/gostaria/poderia falar com humano"
  new RegExp(
    `\\b(quero|queria|preciso|posso|poderia|gostaria(\\s+de)?|me\\s+passa|me\\s+passe|me\\s+transfere|me\\s+transfira|chamar?|chama)\\s+.{0,20}?${HUMAN_TARGETS}\\b`,
    "i"
  ),
  // "atendimento humano", "suporte humano"
  /\b(atendimento|suporte)\s+humano\b/i,
  // "transferir/passar/chamar para humano/atendente"
  new RegExp(
    `\\b(transferir|transfere|transfira|passar?|passa|encaminhar|encaminha|chamar?|chama)\\s+(para|pra|pro|p\\/?)\\s+(um|uma|o|a)?\\s*${HUMAN_TARGETS}\\b`,
    "i"
  ),
  // recusa explícita ao bot/IA
  /\bn[aã]o\s+(quero|gosto|aguento|aguent[oõ])\s+(falar\s+com\s+)?(rob[oô]|bot|ia|m[aá]quina|chatbot)\b/i,
  /\b(rob[oô]|bot|chatbot|ia)\s+n[aã]o\s+(resolve|ajuda|entende|funciona)\b/i,
  /\bsai(r)?\s+do\s+(rob[oô]|bot|chatbot)\b/i,
  // formas curtas com pontuação: "humano!", "atendente pfv", "humano por favor"
  new RegExp(`(^|[\\s,.;:!?])${HUMAN_TARGETS}\\s*(,|\\.|!|\\?|\\s)*\\s*(por\\s+favor|pf|pfv|please|urgente|agora)\\b`, "i"),
  // pedido direto isolado: a mensagem é praticamente só "humano" / "atendente"
  new RegExp(`^\\s*${HUMAN_TARGETS}\\s*[!.?]*\\s*$`, "i"),
];

export function wantsHuman(text: string | null | undefined): boolean {
  const t = (text ?? "").trim();
  if (!t) return false;
  return HUMAN_REQUEST_PATTERNS.some((re) => re.test(t));
}

// Detecta se a IA já sinalizou transferência para humano na resposta.
const AI_HANDOFF_PATTERNS: RegExp[] = [
  /\bvou\s+(te\s+)?(transferir|encaminhar|passar)\b/i,
  /\b(transferindo|encaminhando|passando)\s+(voc[eê]\s+)?(para|pra|pro)\s+(um|uma)?\s*(atendente|humano|consultor|respons[aá]vel|suporte)\b/i,
  /\b(um|uma)\s+(atendente|humano|consultor|respons[aá]vel)\s+(ir[aá]|vai|entrar[aá]|entra)\s+(em\s+)?contato\b/i,
  /\baguarde\s+.{0,30}?(atendente|humano|consultor|respons[aá]vel)\b/i,
];

function aiSignalsHandoff(text: string | null | undefined): boolean {
  const t = (text ?? "").trim();
  if (!t) return false;
  return AI_HANDOFF_PATTERNS.some((re) => re.test(t));
}

// Intents salvos no banco que indicam handoff humano (variações comuns).
const HUMAN_INTENT_VALUES = new Set([
  "humano",
  "atendente",
  "atendimento_humano",
  "atendimento humano",
  "falar_humano",
  "falar_com_humano",
  "falar com humano",
  "handoff",
  "human_handoff",
  "transferir",
  "transferencia",
  "transferência",
  "suporte",
  "suporte_humano",
  "escalonar",
  "escalonamento",
]);

function intentSignalsHuman(intent: string | null | undefined): boolean {
  const v = (intent ?? "").trim().toLowerCase();
  if (!v) return false;
  if (HUMAN_INTENT_VALUES.has(v)) return true;
  // heurística: qualquer intent contendo "humano" ou "handoff"/"atendente"
  return /\b(humano|handoff|atendente|escalon)/.test(v);
}

export function resolveStatus(c: {
  status?: string | null;
  user_message?: string | null;
  ai_response?: string | null;
  intent?: string | null;
}): StatusKey {
  const base = mapStatus(c.status);
  // Estados terminais/finais não devem ser sobrescritos.
  if (base === "encerrado" || base === "cancelado" || base === "agendado") return base;
  if (
    intentSignalsHuman(c.intent) ||
    wantsHuman(c.user_message) ||
    aiSignalsHandoff(c.ai_response)
  ) {
    return "aguardando_humano";
  }
  return base;
}


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
