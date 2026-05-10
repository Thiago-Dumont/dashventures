import { useMemo } from "react";
import { useConversations } from "@/hooks/use-conversations";
import { mapStatus, STATUS_LABEL, STATUS_ORDER } from "@/lib/status";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import PageHeader from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "oklch(0.78 0.16 165)",
  "oklch(0.72 0.15 230)",
  "oklch(0.78 0.17 75)",
  "oklch(0.70 0.20 305)",
  "oklch(0.70 0.22 20)",
  "oklch(0.75 0.10 200)",
];

const tooltipStyle = {
  background: "oklch(0.21 0.025 260)",
  border: "1px solid oklch(1 0 0 / 0.1)",
  borderRadius: 12,
  fontSize: 12,
};

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
    return STATUS_ORDER.map((s) => ({ name: STATUS_LABEL[s], value: counts[s] })).filter((x) => x.value > 0);
  }, [data]);

  const byIntent = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of data) {
      const i = (c.intent ?? "—").trim() || "—";
      counts[i] = (counts[i] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Métricas" subtitle="Indicadores agregados das conversas." />

      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <h2 className="text-base font-semibold mb-3">Conversas nos últimos 7 dias</h2>
        {loading ? <Skeleton className="h-64 w-full" /> : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7} margin={{ left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 165)" />
                    <stop offset="100%" stopColor="oklch(0.72 0.15 230)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="label" stroke="oklch(0.72 0.025 250)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.025 250)" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="total" stroke="url(#lineGrad)" strokeWidth={2.5} dot={{ r: 3, fill: "oklch(0.78 0.16 165)" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <h2 className="text-base font-semibold mb-3">Distribuição por status</h2>
          {loading ? <Skeleton className="h-64 w-full" /> : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="oklch(0.21 0.025 260)" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <h2 className="text-base font-semibold mb-3">Intents mais frequentes</h2>
          {loading ? <Skeleton className="h-64 w-full" /> : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byIntent} margin={{ left: -10, right: 10 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.78 0.16 165)" />
                      <stop offset="100%" stopColor="oklch(0.72 0.15 230)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                  <XAxis dataKey="name" stroke="oklch(0.72 0.025 250)" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis stroke="oklch(0.72 0.025 250)" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(1 0 0 / 0.04)" }} />
                  <Bar dataKey="value" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
