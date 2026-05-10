import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, MessagesSquare, Kanban, BarChart3, Calendar, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import RealtimeBadge from "./RealtimeBadge";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/conversas", label: "Conversas", icon: MessagesSquare },
  { to: "/kanban", label: "Kanban", icon: Kanban },
  { to: "/metricas", label: "Métricas", icon: BarChart3 },
  { to: "/agenda", label: "Agenda via n8n", icon: Calendar },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-9 w-9 rounded-xl bg-brand-gradient shadow-glow grid place-items-center text-primary-foreground font-bold">
        D
      </div>
      <div className="leading-tight">
        <div className="font-semibold">Dara Venture</div>
        <div className="text-[11px] text-muted-foreground">WhatsApp AI Dashboard</div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen text-foreground">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/70 backdrop-blur-xl px-4 h-14">
        <Brand />
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-screen md:sticky md:top-0 border-r border-border bg-card/40 backdrop-blur-xl p-4 gap-1">
          <div className="px-1 py-3 mb-2"><Brand /></div>
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => <NavItem key={n.to} {...n} />)}
          </nav>
          <div className="mt-auto pt-4 border-t border-border space-y-3">
            <RealtimeBadge />
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
            <p className="text-[11px] text-muted-foreground px-1">
              © {new Date().getFullYear()} Dara Venture
            </p>
          </div>
        </aside>

        {/* Mobile dropdown menu */}
        {open && (
          <div className="md:hidden fixed inset-x-3 top-16 z-50 rounded-2xl bg-card border border-border p-3 shadow-elegant animate-fade-in-up">
            <nav className="flex flex-col gap-1">
              {NAV.map((n) => (
                <NavItem key={n.to} {...n} onClick={() => setOpen(false)} />
              ))}
            </nav>
            <div className="mt-3 pt-3 border-t border-border space-y-2">
              <RealtimeBadge />
              <button
                onClick={() => { setOpen(false); supabase.auth.signOut(); }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({
  to, label, icon: Icon, end, onClick,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
          isActive
            ? "bg-brand-gradient text-primary-foreground font-medium shadow-glow"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}
