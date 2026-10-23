import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { MOCK_DESTINOS } from "@/lib/mock-data";
import { getInscripciones, getSession, getTransacciones, saveTransaccion, type Inscripcion, type Transaccion } from "@/lib/store";

export const Route = createFileRoute("/_app/transferencias")({
  head: () => ({ meta: [{ title: "Transferencias ACH" }] }),
  component: TransferenciasPage,
});

function TransferenciasPage() {
  const [tx, setTx] = useState<Transaccion[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [cuentaOrigen, setCuentaOrigen] = useState("CTA-001-DAVIVIENDA");
  const [destinoId, setDestinoId] = useState(MOCK_DESTINOS[0].id);
  const [valor, setValor] = useState<number>(500000);
  const [usaInscripcion, setUsaInscripcion] = useState<string>("none");
  const [transferError, setTransferError] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => { setTx(getTransacciones()); setInscripciones(getInscripciones()); };
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const destino = MOCK_DESTINOS.find((d) => d.id === destinoId)!;

  function submit() {
    if (valor <= 0) {
      setTransferError("El valor debe ser mayor a cero.");
      return;
    }
    if (destino.banco !== "DAVIVIENDA" && usaInscripcion === "none") {
      setTransferError("Debe asociar una inscripción para transferencias ACH a otros bancos.");
      return;
    }
    setTransferError(null);
    const session = getSession();
    const t: Transaccion = {
      id: `TX-${Date.now()}`,
      tipo: destino.banco === "DAVIVIENDA" ? "Transferencia interna" : "ACH",
      servicio: "Transferencia a Cuenta",
      cuentaOrigen,
      cuentaDestino: destino.numCuenta,
      banco: destino.banco,
      valor,
      estado: destino.banco === "DAVIVIENDA" ? "Procesada" : "Pendiente",
      fecha: new Date().toISOString(),
      numProcesoInscripcion: usaInscripcion === "none" ? undefined : usaInscripcion,
      createdBy: session?.user.numDocumento ?? "anonimo",
    };
    saveTransaccion(t);
    setValor(0);
    setTx(getTransacciones());
  }

  return (
    <div className="space-y-6" data-testid="transferencias-page">
      <div>
        <h1 className="text-2xl font-bold">Transferencias</h1>
        <p className="text-sm text-muted-foreground">Movimientos ACH y transferencias internas Davivienda (mock).</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold">Nueva transferencia</h2>
          <div className="space-y-1.5">
            <Label>Cuenta origen</Label>
            <Select value={cuentaOrigen} onValueChange={setCuentaOrigen}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CTA-001-DAVIVIENDA">CTA-001-DAVIVIENDA · Ahorro</SelectItem>
                <SelectItem value="CTA-002-DAVIVIENDA">CTA-002-DAVIVIENDA · Corriente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Destino inscrito</Label>
            <Select value={destinoId} onValueChange={setDestinoId}>
              <SelectTrigger data-testid="transferencia-destino"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MOCK_DESTINOS.map((d, idx) => (
                  <SelectItem
                    key={d.id}
                    value={d.id}
                    // Unique testid on the first BBVA option only (strict-mode safe).
                    data-testid={
                      d.banco === "BBVA" && MOCK_DESTINOS.findIndex((x) => x.banco === "BBVA") === idx
                        ? "transferencia-destino-bbva"
                        : undefined
                    }
                  >
                    {d.banco} · {d.tipoCuenta} · {d.numCuenta} — {d.titular}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Asociar a inscripción</Label>
            <Select value={usaInscripcion} onValueChange={setUsaInscripcion}>
              <SelectTrigger data-testid="transferencia-inscripcion"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin asociar</SelectItem>
                {inscripciones.map((i) => (
                  <SelectItem key={i.numProceso} value={i.numProceso}>{i.numProceso} · {i.nombreProceso}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Valor (COP)</Label>
            <Input
              type="number"
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
              data-testid="transferencia-valor"
            />
          </div>
          {transferError ? (
            <div className="text-sm text-destructive" data-testid="transferencia-error" role="alert">
              {transferError}
            </div>
          ) : null}
          <Button onClick={submit} data-testid="procesar-transferencia">Procesar transferencia</Button>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-3">Resumen destino</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-xs text-muted-foreground">Titular</div><div className="font-medium">{destino.titular}</div></div>
            <div><div className="text-xs text-muted-foreground">Banco</div><div className="font-medium">{destino.banco}</div></div>
            <div><div className="text-xs text-muted-foreground">Tipo cuenta</div><div className="font-medium">{destino.tipoCuenta}</div></div>
            <div><div className="text-xs text-muted-foreground">N° cuenta</div><div className="font-mono">{destino.numCuenta}</div></div>
            <div><div className="text-xs text-muted-foreground">{destino.tipoId}</div><div className="font-mono">{destino.numIdentificacion}</div></div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold mb-3">Historial de transacciones</h2>
        {tx.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">Aún no hay movimientos registrados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground border-b">
              <tr>
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Tipo</th>
                <th className="py-2 pr-3">Origen → Destino</th>
                <th className="py-2 pr-3">Inscripción</th>
                <th className="py-2 pr-3 text-right">Valor</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2 pr-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tx.map((t) => (
                <tr key={t.id}>
                  <td className="py-2 pr-3 font-mono text-xs">{t.id}</td>
                  <td className="py-2 pr-3">{t.tipo}</td>
                  <td className="py-2 pr-3 text-xs">{t.cuentaOrigen} → {t.cuentaDestino} ({t.banco})</td>
                  <td className="py-2 pr-3 font-mono text-xs">{t.numProcesoInscripcion || "—"}</td>
                  <td className="py-2 pr-3 text-right font-mono">${t.valor.toLocaleString("es-CO")}</td>
                  <td className="py-2 pr-3">{t.estado}</td>
                  <td className="py-2 pr-3 text-xs">{new Date(t.fecha).toLocaleString("es-CO")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
