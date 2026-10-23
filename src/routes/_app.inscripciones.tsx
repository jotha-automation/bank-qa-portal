import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { FilePlus2, FileSearch, ClipboardCheck, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_app/inscripciones")({
  component: InscripcionesLayout,
});

const TABS = [
  { to: "/inscripciones/crear", label: "Crear Inscripción", icon: FilePlus2 },
  { to: "/inscripciones/validar", label: "Validar", icon: ClipboardCheck },
  { to: "/inscripciones/actualizar", label: "Actualizar", icon: RefreshCw },
  { to: "/inscripciones", label: "Listado", icon: FileSearch, exact: true },
];

function InscripcionesLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inscripciones</h1>
        <p className="text-sm text-muted-foreground">
          Gestione procesos de inscripción de cuentas y servicios destino (ACH / Davivienda).
        </p>
      </div>

      <Card className="p-1 inline-flex flex-wrap gap-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to as any}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </Link>
          );
        })}
      </Card>

      <Outlet />
    </div>
  );
}
