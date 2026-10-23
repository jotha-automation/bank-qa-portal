import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getInscripciones, getTransacciones, type Inscripcion, type Transaccion } from "@/lib/store";
import { FilePlus2, ListChecks, ArrowLeftRight, Wallet, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Inicio · Portal Empresarial" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [insc, setInsc] = useState<Inscripcion[]>([]);
  const [tx, setTx] = useState<Transaccion[]>([]);
  useEffect(() => {
    const refresh = () => {
      setInsc(getInscripciones());
      setTx(getTransacciones());
    };
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const totalAceptadas = insc.filter((i) => i.estado === "Aceptada").length;
  const totalRechazadas = insc.filter((i) => i.estado === "Rechazada").length;
  const totalPendientes = insc.filter((i) => ["Creada", "Validada", "Actualizada", "Enviada a otro banco"].includes(i.estado)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resumen</h1>
        <p className="text-sm text-muted-foreground">Operación transaccional y estado de inscripciones.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Stat label="Inscripciones totales" value={insc.length} icon={FileText} />
        <Stat label="Aceptadas" value={totalAceptadas} tone="success" icon={ListChecks} />
        <Stat label="En proceso" value={totalPendientes} tone="warning" icon={ArrowLeftRight} />
        <Stat label="Rechazadas" value={totalRechazadas} tone="destructive" icon={Wallet} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <ShortcutCard
          to="/inscripciones/crear"
          title="Crear Inscripción"
          description="Digitar inscripciones o cargar archivo plano ACH."
          icon={FilePlus2}
        />
        <ShortcutCard
          to="/consultas"
          title="Procesos de Inscripción"
          description="Filtrar, validar, actualizar y consultar procesos."
          icon={ListChecks}
        />
        <ShortcutCard
          to="/transferencias"
          title="Transferencias ACH"
          description="Generar movimientos mock asociados a inscripciones."
          icon={ArrowLeftRight}
        />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Últimas inscripciones</h2>
          <Link to="/consultas" className="text-sm text-primary hover:underline">Ver todas</Link>
        </div>
        {insc.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            Aún no hay inscripciones registradas. Cree la primera desde el módulo de Inscripciones.
          </div>
        ) : (
          <div className="divide-y">
            {insc.slice(0, 6).map((i) => (
              <div key={i.numProceso} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-sm">{i.nombreProceso}</div>
                  <div className="text-xs text-muted-foreground">
                    {i.numProceso} · {i.servicioDestino} · {i.cantidad} inscripciones
                  </div>
                </div>
                <EstadoBadge estado={i.estado} />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold mb-3">Últimas transacciones</h2>
        {tx.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">Sin transacciones registradas.</div>
        ) : (
          <div className="divide-y">
            {tx.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{t.tipo} · {t.servicio}</div>
                  <div className="text-xs text-muted-foreground">{t.cuentaOrigen} → {t.cuentaDestino} ({t.banco})</div>
                </div>
                <div className="text-right">
                  <div className="font-mono">${t.valor.toLocaleString("es-CO")}</div>
                  <div className="text-xs text-muted-foreground">{t.estado}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: React.ElementType; tone?: "success" | "warning" | "destructive" }) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "destructive" ? "text-destructive" : "text-primary";
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className={`text-3xl font-bold mt-1 ${toneClass}`}>{value}</div>
        </div>
        <Icon className={`h-8 w-8 ${toneClass} opacity-60`} />
      </div>
    </Card>
  );
}

function ShortcutCard({ to, title, description, icon: Icon }: { to: string; title: string; description: string; icon: React.ElementType }) {
  return (
    <Link to={to as any}>
      <Card className="p-5 hover:border-primary transition-colors h-full">
        <Icon className="h-6 w-6 text-primary mb-3" />
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground mt-1">{description}</div>
      </Card>
    </Link>
  );
}

export function EstadoBadge({ estado }: { estado: Inscripcion["estado"] }) {
  const map: Record<string, string> = {
    Aceptada: "bg-success/15 text-success border-success/30",
    Rechazada: "bg-destructive/15 text-destructive border-destructive/30",
    Creada: "bg-muted text-muted-foreground border-border",
    Validada: "bg-warning/15 text-warning-foreground border-warning/40",
    Actualizada: "bg-warning/15 text-warning-foreground border-warning/40",
    "Enviada a otro banco": "bg-primary/10 text-primary border-primary/30",
    "Pagado Parcial": "bg-warning/15 text-warning-foreground border-warning/40",
  };
  return <Badge variant="outline" className={map[estado] || ""}>{estado}</Badge>;
}
