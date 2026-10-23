import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { SERVICIOS_DESTINO } from "@/lib/mock-data";
import { getInscripciones, getSession, getTransacciones, markPagadoParcial, saveTransaccion, type Inscripcion, type Transaccion } from "@/lib/store";

export const Route = createFileRoute("/_app/pagos")({
  head: () => ({ meta: [{ title: "Pagos" }] }),
  component: PagosPage,
});

function PagosPage() {
  const [tx, setTx] = useState<Transaccion[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [procesoId, setProcesoId] = useState<string>("");
  const [servicio, setServicio] = useState(SERVICIOS_DESTINO[0]);
  const [valor, setValor] = useState<number>(1000000);
  const [validaInscripcion, setValidaInscripcion] = useState<"Si" | "No">("Si");

  useEffect(() => {
    const refresh = () => { setTx(getTransacciones()); setInscripciones(getInscripciones()); };
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const insc = inscripciones.find((i) => i.numProceso === procesoId);

  function submit() {
    if (!insc) return;
    const session = getSession();
    const det = insc.detalles[0];
    const estado: Transaccion["estado"] =
      validaInscripcion === "Si" && insc.estado !== "Aceptada" ? "Rechazada" : "Procesada";
    const t: Transaccion = {
      id: `PAY-${Date.now()}`,
      tipo: det?.bancoDestino === "DAVIVIENDA" ? "Transferencia interna" : "ACH",
      servicio,
      cuentaOrigen: "CTA-001-DAVIVIENDA",
      cuentaDestino: det?.numProducto ?? "N/A",
      banco: det?.bancoDestino ?? "DAVIVIENDA",
      valor,
      estado,
      fecha: new Date().toISOString(),
      numProcesoInscripcion: insc.numProceso,
      createdBy: session?.user.numDocumento ?? "anonimo",
    };
    saveTransaccion(t);
    if (validaInscripcion === "No" && estado === "Procesada" && insc.estado === "Aceptada") {
      markPagadoParcial(insc.numProceso);
    }
    setTx(getTransacciones());
    setInscripciones(getInscripciones());
  }

  return (
    <div className="space-y-6" data-testid="pagos-page">
      <div>
        <h1 className="text-2xl font-bold">Pagos</h1>
        <p className="text-sm text-muted-foreground">Genere pagos asociados a un proceso de inscripción.</p>
      </div>

      <Card className="p-6 space-y-4 max-w-3xl">
        <h2 className="font-semibold">Crear pago</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Proceso de inscripción</Label>
            <Select value={procesoId} onValueChange={setProcesoId}>
              <SelectTrigger data-testid="pagos-select-proceso"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
              <SelectContent>
                {inscripciones.length === 0 && <SelectItem value="none" disabled>No hay inscripciones</SelectItem>}
                {inscripciones.map((i) => (
                  <SelectItem key={i.numProceso} value={i.numProceso}>{i.numProceso} · {i.nombreProceso}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Servicio</Label>
            <Select value={servicio} onValueChange={setServicio}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SERVICIOS_DESTINO.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Valor (COP)</Label>
            <Input type="number" value={valor} onChange={(e) => setValor(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Válida Inscripción</Label>
            <Select value={validaInscripcion} onValueChange={(v) => setValidaInscripcion(v as "Si" | "No")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Si">Sí</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {insc && (
          <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
            Estado actual de la inscripción: <span className="font-medium text-foreground">{insc.estado}</span>.
            {validaInscripcion === "Si" && insc.estado !== "Aceptada" && (
              <span className="ml-2 text-destructive" data-testid="pago-warning-rechazo">
                El pago será rechazado porque la inscripción no está Aceptada.
              </span>
            )}
          </div>
        )}
        <Button onClick={submit} disabled={!insc || valor <= 0} data-testid="procesar-pago">Procesar pago</Button>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold mb-3">Pagos realizados</h2>
        {tx.filter((t) => t.id.startsWith("PAY-")).length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">No se han realizado pagos.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground border-b">
              <tr>
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Servicio</th>
                <th className="py-2 pr-3">Inscripción</th>
                <th className="py-2 pr-3">Destino</th>
                <th className="py-2 pr-3 text-right">Valor</th>
                <th className="py-2 pr-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tx.filter((t) => t.id.startsWith("PAY-")).map((t) => (
                <tr key={t.id} data-testid={`pago-row-${t.id}`}>
                  <td className="py-2 pr-3 font-mono text-xs">{t.id}</td>
                  <td className="py-2 pr-3">{t.servicio}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{t.numProcesoInscripcion}</td>
                  <td className="py-2 pr-3 text-xs">{t.cuentaDestino} ({t.banco})</td>
                  <td className="py-2 pr-3 text-right font-mono">${t.valor.toLocaleString("es-CO")}</td>
                  <td
                    className="py-2 pr-3"
                    data-testid={t.estado === "Rechazada" ? "pago-estado-rechazada" : `pago-estado-${t.id}`}
                    data-estado={t.estado}
                  >
                    {t.estado}
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
