import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { getInscripciones, saveInscripcion, type Inscripcion } from "@/lib/store";
import { EstadoBadge } from "./_app.dashboard";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/inscripciones/validar")({
  head: () => ({ meta: [{ title: "Validar Inscripción" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ proceso: (s.proceso as string) || "" }),
  component: ValidarInscripcion,
});

function ValidarInscripcion() {
  const search = Route.useSearch();
  const [items, setItems] = useState<Inscripcion[]>([]);
  const [q, setQ] = useState(search.proceso || "");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setItems(getInscripciones());
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const filtered = useMemo(
    () => items.filter((i) => ["Creada", "Validada"].includes(i.estado))
            .filter((i) => !q || i.numProceso.includes(q) || i.nombreProceso.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );

  function doValidate(i: Inscripcion) {
    const updated: Inscripcion = { ...i, estado: "Validada", fechaActualizacion: new Date().toISOString() };
    saveInscripcion(updated);
    setFeedback(`El proceso ${i.numProceso} ha sido VALIDADO correctamente. Ahora requiere ser ACTUALIZADO para continuar con la inscripción.`);
  }

  return (
    <div className="space-y-4" data-testid="validar-page">
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-semibold">Validar Inscripción</h2>
            <p className="text-xs text-muted-foreground">Para continuar con la inscripción de clic en <em>Validar</em>.</p>
          </div>
          <Input placeholder="Filtrar por N° proceso o nombre" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        </div>
      </Card>

      {feedback && (
        <Card className="p-4 border-success/30 bg-success/5 text-success flex items-start gap-3" data-testid="validar-feedback">
          <CheckCircle2 className="h-5 w-5 mt-0.5" />
          <div className="text-sm">{feedback} <Link to="/inscripciones/actualizar" className="underline ml-1">Ir a actualizar</Link></div>
        </Card>
      )}

      <Card className="p-5">
        {filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8" data-testid="validar-empty">
            No hay procesos pendientes de validar.
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
                    <Button size="sm" onClick={() => doValidate(i)} disabled={i.estado === "Validada"} data-testid={`validar-${i.numProceso}`}>Validar</Button>
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
