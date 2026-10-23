import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import {
  advanceBusinessDays,
  getDemoConfig,
  getEffectiveNow,
  getInscripciones,
  resetSimulatedNow,
  saveInscripcion,
  seedEnviadoOtroBanco,
  setDemoConfig,
  simulateWeekend,
  triggerBusinessDayRejections,
  type Inscripcion,
  type InscripcionEstado,
} from "@/lib/store";
import { DEMO_REQ } from "@/lib/demo-config";
import { validateConsultasFilters } from "@/lib/consultas-validation";
import { SERVICIOS_DESTINO } from "@/lib/mock-data";
import { EstadoBadge } from "./_app.dashboard";
import { AlertTriangle, Calendar, Printer, Search as SearchIcon } from "lucide-react";

const ESTADOS: (InscripcionEstado | "Todos")[] = [
  "Todos", "Creada", "Validada", "Actualizada", "Enviada a otro banco", "Aceptada", "Rechazada", "Pagado Parcial",
];

export const Route = createFileRoute("/_app/consultas")({
  head: () => ({ meta: [{ title: "Consultas · Procesos de Inscripción" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    proceso: (s.proceso as string) || "",
    servicio: (s.servicio as string) || "",
  }),
  component: Consultas,
});

function Consultas() {
  const search = Route.useSearch();
  const [items, setItems] = useState<Inscripcion[]>([]);
  const [nombre, setNombre] = useState("");
  const [servicioDestino, setServicioDestino] = useState(search.servicio || "");
  const [estado, setEstado] = useState<string>("Todos");
  const [numProceso, setNumProceso] = useState(search.proceso || "");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [selected, setSelected] = useState<Inscripcion | null>(null);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [businessDays, setBusinessDays] = useState(getDemoConfig().businessDaysParam);
  const [advanceDays, setAdvanceDays] = useState(1);
  const [simulatedLabel, setSimulatedLabel] = useState("");

  useEffect(() => {
    const refresh = () => {
      setItems(getInscripciones());
      const cfg = getDemoConfig();
      setSimulatedLabel(cfg.simulatedNow ? new Date(cfg.simulatedNow).toLocaleString("es-CO") : "");
    };
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  useEffect(() => {
    if (search.proceso) {
      setNumProceso(search.proceso);
      setSearched(true);
      const match = getInscripciones().find((i) => i.numProceso === search.proceso);
      if (match) setSelected(match);
    }
  }, [search.proceso]);

  const filtered = useMemo(() => {
    if (!searched) return [];
    return items.filter((i) => {
      if (nombre && !i.nombreProceso.toLowerCase().includes(nombre.toLowerCase())) return false;
      if (servicioDestino && i.servicioDestino !== servicioDestino) return false;
      if (estado !== "Todos" && i.estado !== estado) return false;
      if (numProceso && !i.numProceso.includes(numProceso)) return false;
      if (desde && new Date(i.fechaCreacion) < new Date(desde)) return false;
      if (hasta && new Date(i.fechaCreacion) > new Date(hasta + "T23:59:59")) return false;
      return true;
    });
  }, [items, nombre, servicioDestino, estado, numProceso, desde, hasta, searched]);

  function buscar() {
    const validationError = validateConsultasFilters(numProceso);
    if (validationError) {
      setSearchError(validationError);
      setSearched(false);
      setSelected(null);
      return;
    }
    setSearchError(null);
    setSearched(true);
    setItems(getInscripciones());
  }

  function simulateRechazo(i: Inscripcion) {
    const updated: Inscripcion = {
      ...i,
      estado: "Rechazada",
      motivoRechazo: DEMO_REQ.rejectionReason,
      fechaActualizacion: new Date().toISOString(),
    };
    saveInscripcion(updated);
    setSelected(updated);
    setItems(getInscripciones());
  }

  function simulateAceptado(i: Inscripcion) {
    const updated: Inscripcion = { ...i, estado: "Aceptada", motivoRechazo: undefined, fechaActualizacion: new Date().toISOString() };
    saveInscripcion(updated);
    setSelected(updated);
    setItems(getInscripciones());
  }

  function applyBusinessDaysParam() {
    setDemoConfig({ businessDaysParam: businessDays });
    setItems(getInscripciones());
    buscar();
  }

  function handleSimulateWeekend() {
    simulateWeekend();
    setItems(getInscripciones());
    setSimulatedLabel(getEffectiveNow().toLocaleString("es-CO"));
  }

  function handleAdvanceBusinessDays() {
    advanceBusinessDays(advanceDays);
    setItems(getInscripciones());
    setSimulatedLabel(getEffectiveNow().toLocaleString("es-CO"));
  }

  function handleResetSimulatedNow() {
    resetSimulatedNow();
    setItems(getInscripciones());
    setSimulatedLabel("");
  }

  function handleSeedEnviadoOtroBanco() {
    const seeded = seedEnviadoOtroBanco(businessDays);
    setNumProceso(seeded.numProceso);
    setSearched(true);
    setSelected(seeded);
    setItems(getInscripciones());
  }

  function handleTriggerRejection() {
    triggerBusinessDayRejections();
    setItems(getInscripciones());
    if (selected) {
      const updated = getInscripciones().find((i) => i.numProceso === selected.numProceso);
      if (updated) setSelected(updated);
    }
    buscar();
  }

  function printProceso(i: Inscripcion) {
    const w = window.open("", "_blank", "width=800,height=600");
    if (!w) return;
    const rows = i.detalles
      .map(
        (d) =>
          `<tr><td>${d.numId}</td><td>${d.nombres} ${d.apellidos}</td><td>${d.valorMax}</td><td>${d.email}</td><td>${i.motivoRechazo || ""}</td></tr>`,
      )
      .join("");
    w.document.write(`
      <html><head><title>Proceso ${i.numProceso}</title></head><body>
      <h1>Consulta Procesos de Inscripción</h1>
      <p><strong>N° Proceso:</strong> ${i.numProceso}</p>
      <p><strong>Estado:</strong> ${i.estado}</p>
      <p><strong>Motivo Rechazo:</strong> ${i.motivoRechazo || "—"}</p>
      <table border="1" cellpadding="6"><thead><tr><th>Nit Cliente</th><th>Nombre</th><th>Valor Máximo</th><th>e-mail</th><th>Motivo Rechazo</th></tr></thead><tbody>${rows}</tbody></table>
      </body></html>`);
    w.document.close();
    w.print();
  }

  return (
    <div className="space-y-6" data-testid="consultas-page">
      <div>
        <h1 className="text-2xl font-bold">Consultas</h1>
        <p className="text-sm text-muted-foreground">
          Procesos de Inscripción · {DEMO_REQ.id} · Filtro de búsqueda
        </p>
      </div>

      <Card className="p-5 border-dashed" data-testid="qa-controls-panel">
        <h3 className="text-sm font-medium mb-2">Controles QA (demo APTP)</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Simular calendario y auto-rechazo sin esperar días reales. Fecha simulada:{" "}
          <span data-testid="simulated-now-label">{simulatedLabel || "— (reloj real)"}</span>
        </p>
        <div className="flex gap-2 items-end flex-wrap">
          <Button size="sm" variant="outline" onClick={handleSimulateWeekend} data-testid="simulate-weekend">
            Simular fin de semana
          </Button>
          <div className="space-y-1">
            <Label className="text-xs">Avanzar días hábiles</Label>
            <Input
              type="number"
              min={1}
              max={10}
              className="w-20 h-8"
              value={advanceDays}
              onChange={(e) => setAdvanceDays(Number(e.target.value) || 1)}
              data-testid="advance-business-days-input"
            />
          </div>
          <Button size="sm" variant="outline" onClick={handleAdvanceBusinessDays} data-testid="advance-business-days">
            Avanzar calendario
          </Button>
          <Button size="sm" variant="ghost" onClick={handleResetSimulatedNow} data-testid="reset-simulated-now">
            Restablecer reloj
          </Button>
          <Button size="sm" variant="secondary" onClick={handleSeedEnviadoOtroBanco} data-testid="seed-enviado-otro-banco">
            Sembrar Enviada a otro banco
          </Button>
          <Button size="sm" variant="destructive" onClick={handleTriggerRejection} data-testid="trigger-business-day-rejection">
            Aplicar auto-rechazo
          </Button>
        </div>
      </Card>

      <Card className="p-5 border-dashed">
        <h3 className="text-sm font-medium mb-2">Parámetro días hábiles (demo)</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Inscripciones en estado &quot;Enviada a otro banco&quot; se rechazan automáticamente tras N días hábiles
          sin respuesta con motivo: &quot;{DEMO_REQ.rejectionReason}&quot;.
        </p>
        <div className="flex gap-2 items-end flex-wrap">
          <div className="space-y-1">
            <Label className="text-xs">Días hábiles</Label>
            <Select value={String(businessDays)} onValueChange={(v) => setBusinessDays(Number(v))}>
              <SelectTrigger className="w-32" data-testid="business-days-param">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 día</SelectItem>
                <SelectItem value="2">2 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" variant="outline" onClick={applyBusinessDaysParam} data-testid="apply-business-days">
            Aplicar parámetro
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><SearchIcon className="h-4 w-4" /> Buscar Procesos de Inscripciones</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Servicio Destino</Label>
            <Select value={servicioDestino || "all"} onValueChange={(v) => setServicioDestino(v === "all" ? "" : v)}>
              <SelectTrigger data-testid="filter-servicio"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {SERVICIOS_DESTINO.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Nombre Proceso</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Contiene..." data-testid="filter-nombre" />
          </div>
          <div className="space-y-1.5">
            <Label>N° Proceso</Label>
            <Input value={numProceso} onChange={(e) => setNumProceso(e.target.value)} data-testid="filter-proceso" />
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger data-testid="filter-estado"><SelectValue /></SelectTrigger>
              <SelectContent>{ESTADOS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Entre</Label>
            <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} data-testid="filter-desde" />
          </div>
          <div className="space-y-1.5">
            <Label>y el</Label>
            <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} data-testid="filter-hasta" />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={buscar} data-testid="buscar-procesos">Buscar Procesos</Button>
        </div>
        {searchError ? (
          <div className="mt-3 text-sm text-destructive" data-testid="consultas-validation-error" role="alert">
            {searchError}
          </div>
        ) : null}
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Resultados ({filtered.length})</h2>
        </div>
        {!searched ? (
          <div className="text-sm text-muted-foreground text-center py-10">Use los filtros y pulse Buscar Procesos.</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-10" data-testid="consultas-empty">No hay procesos que coincidan con los filtros.</div>
        ) : (
          <div className="overflow-x-auto" data-testid="consultas-results">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                <tr>
                  <th className="py-2 pr-3">N° Proceso</th>
                  <th className="py-2 pr-3">Nombre</th>
                  <th className="py-2 pr-3">Servicio</th>
                  <th className="py-2 pr-3">Fecha creación</th>
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2 pr-3">Motivo</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((i) => (
                  <tr key={i.numProceso} className="hover:bg-muted/40 cursor-pointer" onClick={() => setSelected(i)} data-testid={`consulta-row-${i.numProceso}`}>
                    <td className="py-3 pr-3 font-mono text-xs">{i.numProceso}</td>
                    <td className="py-3 pr-3">{i.nombreProceso}</td>
                    <td className="py-3 pr-3">{i.servicioDestino}</td>
                    <td className="py-3 pr-3 text-xs">{new Date(i.fechaCreacion).toLocaleString("es-CO")}</td>
                    <td className="py-3 pr-3"><EstadoBadge estado={i.estado} /></td>
                    <td className="py-3 pr-3 text-xs text-muted-foreground">{i.motivoRechazo || "—"}</td>
                    <td className="py-3 pr-3 text-right">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelected(i); }}>Detalle</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <Card className="p-5" data-testid="consulta-detalle">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Detalle proceso {selected.numProceso}</h2>
            <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Cerrar</Button>
          </div>
          <div className="grid md:grid-cols-4 gap-4 text-sm mb-4">
            <Info label="Nombre" value={selected.nombreProceso} />
            <Info label="Servicio destino" value={selected.servicioDestino} />
            <Info label="Origen" value={selected.origen} />
            <Info label="Estado actual" value={selected.estado} />
          </div>
          {selected.motivoRechazo && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive flex gap-2 mb-4" data-testid="motivo-rechazo">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <div><strong>Motivo del rechazo:</strong> {selected.motivoRechazo}</div>
            </div>
          )}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="py-2 pr-3">Nit Cliente</th>
                  <th className="py-2 pr-3">Nombre</th>
                  <th className="py-2 pr-3">Valor máx.</th>
                  <th className="py-2 pr-3">e-mail</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selected.detalles.map((d, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-3 font-mono">{d.numId}</td>
                    <td className="py-2 pr-3">{d.nombres} {d.apellidos}</td>
                    <td className="py-2 pr-3 text-right font-mono">${d.valorMax.toLocaleString("es-CO")}</td>
                    <td className="py-2 pr-3">{d.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button size="sm" variant="outline" onClick={() => printProceso(selected)} data-testid="imprimir-proceso">
              <Printer className="h-4 w-4 mr-1" /> Imprimir Proceso
            </Button>
            <div className="text-xs text-muted-foreground mr-auto self-center">
              Simulación manual ({DEMO_REQ.id}):
            </div>
            <Button size="sm" variant="outline" onClick={() => simulateAceptado(selected)} data-testid="marcar-aceptada">Marcar Aceptada</Button>
            <Button size="sm" variant="destructive" onClick={() => simulateRechazo(selected)} data-testid="marcar-rechazada">
              Marcar Rechazada (Error de Comunicación)
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
