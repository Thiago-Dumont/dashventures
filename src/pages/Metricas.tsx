import { useMemo } from "react";
import { useConversations } from "@/hooks/use-conversations";
import { mapStatus, STATUS_LABEL, STATUS_ORDER } from "@/lib/status";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

const COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#2dd4bf", "#fb7185"];

export default function Metricas() {
  const { data, loading } = useConversations();

  const last7 = useMemo(() => {
    const days: { date: string; label: string; total: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        total: 0,
      });
    }
    const idx = new Map(days.map((d, i) => [d.date, i]));
    for (const c of data) {
      if (!c.created_at) continue;
      const k = new Date(c.created_at).toISOString().slice(0, 10);
      const i = idx.get(k);
      if (i !== undefined) days[i].total++;
    }
    return days;
  }, [data]);

  const byStatus = useMemo(() => {
    const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<string, number>;
    for (const c of data) counts[mapStatus(c.status)]++;
    return STATUS_ORDER.map((s) => ({ name: STATUS_LABEL[s], value: counts[s] }));
  }, [data]);

  const byIntent = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of data) {
      const i = (c.intent ?? "—").trim() || "—";
      counts[i] = (counts[i] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Métricas</h1>
        <p className="text-sm text-muted-foreground">Indicadores agregados das conversas.</p>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Carregando…</div>}

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-3">Conversas nos últimos 7 dias</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
              <Line type="monotone" dataKey="total" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-base font-semibold mb-3">Distribuição por status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                  {byStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-base font-semibold mb-3">Intents mais frequentes</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byIntent}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                <Bar dataKey="value" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
