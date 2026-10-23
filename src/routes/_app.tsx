import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Search,
  ArrowLeftRight,
  Wallet,
  LogOut,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { logout, resetDemoData } from "@/lib/store";
import { DEMO_REQ } from "@/lib/demo-config";
import { toast } from "sonner";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const NAV = [
  { to: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { to: "/inscripciones", label: "Inscripciones", icon: FileText },
  { to: "/consultas", label: "Consultas", icon: Search },
  { to: "/transferencias", label: "Transferencias", icon: ArrowLeftRight },
  { to: "/pagos", label: "Pagos", icon: Wallet },
] as const;

function AppLayout() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && !session) navigate({ to: "/login" });
  }, [ready, session, navigate]);

  if (!ready || !session) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Cargando...</div>;
  }

  const crumbs = pathname.split("/").filter(Boolean);

  return (
    <div className="min-h-screen flex bg-muted/30" data-testid="app-shell">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="brand-bar" />
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-white/15 grid place-items-center font-bold">D</div>
            <div>
              <div className="font-semibold leading-tight">Banco</div>
              <div className="text-xs opacity-80">Portal Empresarial</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-sidebar-border text-xs opacity-90 space-y-1">
          <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Mock APTP · {DEMO_REQ.id}</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b border-border">
          <div className="brand-bar" />
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Portal</span>
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-2">
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className={i === crumbs.length - 1 ? "text-foreground font-medium" : ""}>
                    {decodeURIComponent(c)}
                  </span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                data-testid="reset-demo-data"
                onClick={() => {
                  resetDemoData();
                  toast.success("Datos de demo reiniciados", {
                    description: "Inscripciones y pagos eliminados. La sesión se mantiene.",
                  });
                }}
              >
                <RotateCcw className="h-4 w-4 mr-1" /> Reiniciar demo
              </Button>
              <div className="text-right">
                <div className="text-sm font-medium">{session.user.nombre}</div>
                <div className="text-xs text-muted-foreground">
                  Cliente {session.user.cliente} · {session.user.empresa}
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" /> Salir
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
