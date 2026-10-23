import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { getInscripciones, saveInscripcion, type Inscripcion } from "@/lib/store";
import { EstadoBadge } from "./_app.dashboard";
import { Info } from "lucide-react";

export const Route = createFileRoute("/_app/inscripciones/actualizar")({
  head: () => ({ meta: [{ title: "Actualizar Inscripción" }] }),
  component: ActualizarInscripcion,
});

function ActualizarInscripcion() {
  const [items, setItems] = useState<Inscripcion[]>([]);
  const [q, setQ] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setItems(getInscripciones());
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const filtered = useMemo(
    () => items.filter((i) => i.estado === "Validada")
            .filter((i) => !q || i.numProceso.includes(q) || i.nombreProceso.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );

  function doUpdate(i: Inscripcion) {
    const hasOtroBanco = i.detalles.some((d) => d.bancoDestino !== "DAVIVIENDA" && d.bancoDestino !== "DAVIPLATA");
    const nuevoEstado: Inscripcion["estado"] = hasOtroBanco ? "Enviada a otro banco" : "Aceptada";
    const now = new Date().toISOString();
    saveInscripcion({ ...i, estado: "Actualizada", fechaActualizacion: now });
    const updated: Inscripcion = { ...i, estado: nuevoEstado, fechaActualizacion: now };
    saveInscripcion(updated);
    setFeedback(
      "Las cuentas Davivienda y Daviplata tendrán resultado de inmediato. Las cuentas de otros bancos: la entidad destino debe aceptarlas primero. Si requiere hacer su pago ahora, en Crear Pago seleccione 'Válida Inscripción' = No.",
    );
  }

  return (
    <div className="space-y-4" data-testid="actualizar-page">
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-semibold">Actualizar Inscripción</h2>
            <p className="text-xs text-muted-foreground">Procesos previamente validados, listos para actualizar.</p>
          </div>
          <Input placeholder="Filtrar..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        </div>
      </Card>

      {feedback && (
        <Card className="p-4 border-warning/40 bg-warning/10 flex items-start gap-3" data-testid="actualizar-feedback">
          <Info className="h-5 w-5 mt-0.5 text-warning-foreground" />
          <div className="text-sm text-warning-foreground">{feedback}</div>
        </Card>
      )}

      <Card className="p-5">
        {filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8" data-testid="actualizar-empty">
            No hay procesos pendientes de actualizar.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground border-b">
              <tr>
                <th className="py-2 pr-3">N° Proceso</th>
                <th className="py-2 pr-3">Nombre</th>
                <th className="py-2 pr-3">Servicio</th>
                <th className="py-2 pr-3">Cant.</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((i) => (
                <tr key={i.numProceso}>
                  <td className="py-3 pr-3 font-mono text-xs">{i.numProceso}</td>
                  <td className="py-3 pr-3">{i.nombreProceso}</td>
                  <td className="py-3 pr-3">{i.servicioDestino}</td>
                  <td className="py-3 pr-3">{i.cantidad}</td>
                  <td className="py-3 pr-3"><EstadoBadge estado={i.estado} /></td>
                  <td className="py-3 pr-3 text-right">
                    <Button size="sm" onClick={() => doUpdate(i)} data-testid={`actualizar-${i.numProceso}`}>Actualizar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
