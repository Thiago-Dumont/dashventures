import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogIn, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setErr("E-mail ou senha inválidos.");
  }

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-background text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="h-9 w-9 rounded-xl bg-brand-gradient shadow-glow grid place-items-center text-primary-foreground font-bold">
            D
          </div>
          <div className="leading-tight">
            <div className="font-semibold">Dara Venture</div>
            <div className="text-[11px] text-muted-foreground">WhatsApp AI Dashboard</div>
          </div>
        </div>

        <h1 className="text-lg font-semibold mb-1">Entrar</h1>
        <p className="text-sm text-muted-foreground mb-4">Acesse com seu e-mail e senha.</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">E-mail</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Senha</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {err && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>{err}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gradient text-primary-foreground font-medium py-2.5 text-sm shadow-glow disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
