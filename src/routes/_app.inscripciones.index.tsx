import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getInscripciones, type Inscripcion } from "@/lib/store";
import { EstadoBadge } from "./_app.dashboard";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/inscripciones/")({
  head: () => ({ meta: [{ title: "Inscripciones · Listado" }] }),
  component: ListadoInscripciones,
});

function ListadoInscripciones() {
  const [items, setItems] = useState<Inscripcion[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    const refresh = () => setItems(getInscripciones());
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const filtered = items.filter(
    (i) =>
      !q ||
      i.numProceso.toLowerCase().includes(q.toLowerCase()) ||
      i.nombreProceso.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="font-semibold">Procesos de inscripción</h2>
          <p className="text-xs text-muted-foreground">Listado de todos los procesos creados en esta sesión.</p>
        </div>
        <Input placeholder="Buscar por nombre o N° proceso..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      {filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-10">No hay inscripciones registradas.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground border-b">
              <tr>
                <th className="py-2 pr-3">N° Proceso</th>
                <th className="py-2 pr-3">Nombre</th>
                <th className="py-2 pr-3">Servicio destino</th>
                <th className="py-2 pr-3">Cant.</th>
                <th className="py-2 pr-3">Origen</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2 pr-3">Creado</th>
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
                  <td className="py-3 pr-3"><Badge variant="outline">{i.origen}</Badge></td>
                  <td className="py-3 pr-3"><EstadoBadge estado={i.estado} /></td>
                  <td className="py-3 pr-3 text-xs text-muted-foreground">{new Date(i.fechaCreacion).toLocaleString("es-CO")}</td>
                  <td className="py-3 pr-3">
                    <Link
                      to="/consultas"
                      search={{ proceso: i.numProceso }}
                      className="text-primary text-xs hover:underline"
                      data-testid={`ver-proceso-${i.numProceso}`}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
