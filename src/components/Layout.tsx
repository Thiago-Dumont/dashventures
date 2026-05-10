import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, MessagesSquare, Kanban, BarChart3, Calendar, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/conversas", label: "Conversas", icon: MessagesSquare },
  { to: "/kanban", label: "Kanban", icon: Kanban },
  { to: "/metricas", label: "Métricas", icon: BarChart3 },
  { to: "/agenda", label: "Agenda via n8n", icon: Calendar },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar (mobile) */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500" />
          <span className="font-semibold">Dara Venture</span>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-md hover:bg-accent"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-screen md:sticky md:top-0 border-r border-border bg-card/40 p-4 gap-1">
          <div className="flex items-center gap-2 px-2 py-3 mb-4">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500" />
            <div>
              <div className="font-semibold leading-tight">Dara Venture</div>
              <div className="text-xs text-muted-foreground">Dashboard</div>
            </div>
          </div>
          {NAV.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </aside>

        {/* Mobile dropdown menu */}
        {open && (
          <div className="md:hidden fixed inset-x-0 top-14 z-30 bg-card border-b border-border p-3 flex flex-col gap-1 shadow-lg">
            {NAV.map((n) => (
              <NavItem key={n.to} {...n} onClick={() => setOpen(false)} />
            ))}
          </div>
        )}

        <main className="flex-1 min-w-0 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  onClick,
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
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
          isActive
            ? "bg-primary text-primary-foreground font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}
