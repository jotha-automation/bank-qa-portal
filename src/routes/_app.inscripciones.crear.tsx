import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { SERVICIOS_DESTINO, TIPOS_CUENTA, TIPOS_ID, BANCOS } from "@/lib/mock-data";
import {
  nextProcesoNumber,
  saveInscripcion,
  type Inscripcion,
  type InscripcionDetalle,
  getSession,
} from "@/lib/store";
import { parsePlainFileContent } from "@/lib/plain-file-parser";
import { FileUp, Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/inscripciones/crear")({
  head: () => ({ meta: [{ title: "Crear Inscripción" }] }),
  component: CrearInscripcion,
});

type Step = "header" | "mode" | "digitar" | "archivo" | "confirm";

function CrearInscripcion() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("header");
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [servicio, setServicio] = useState(SERVICIOS_DESTINO[0]);
  const [detalles, setDetalles] = useState<InscripcionDetalle[]>([]);
  const [archivoTexto, setArchivoTexto] = useState("");
  const [archivoNombre, setArchivoNombre] = useState("");
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [archivoError, setArchivoError] = useState<string | null>(null);
  const [detalleError, setDetalleError] = useState<string | null>(null);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function emptyDet(): InscripcionDetalle {
    return {
      tipoId: TIPOS_ID[4], // NIT
      numId: "8006007002",
      nombres: "Servicios",
      apellidos: "Generales SAS",
      referencia: "REF-ACH-DEMO",
      tipoProducto: "CUENTAS CORRIENTES OTROS BANCOS",
      numProducto: "1082869975",
      bancoDestino: "BBVA",
      valorMax: 5000000,
      email: "finanzas@servicios.co",
      contacto: "Laura",
      cargo: "Mesa de pagos",
    };
  }

  function commit(origen: "Digitar" | "Archivo Plano", dets: InscripcionDetalle[]) {
    const session = getSession();
    const now = new Date().toISOString();
    const insc: Inscripcion = {
      numProceso: nextProcesoNumber(),
      nombreProceso: nombre || "Proceso sin nombre",
      cantidad: dets.length || cantidad,
      servicioDestino: servicio,
      origen,
      detalles: dets,
      estado: "Creada",
      fechaCreacion: now,
      fechaActualizacion: now,
      createdBy: session?.user.numDocumento ?? "anonimo",
    };
    saveInscripcion(insc);
    navigate({ to: "/inscripciones/validar", search: { proceso: insc.numProceso } as any });
  }

  return (
    <div className="space-y-4" data-testid="crear-inscripcion-page">
      <Stepper step={step} />

      {step === "header" && (
        <Card className="p-6 space-y-4 max-w-2xl">
          <h2 className="font-semibold">Ingrese Datos del Encabezado</h2>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Nombre Proceso Inscripción</Label>
              <Input
                data-testid="crear-nombre-proceso"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Nómina Junio 2026"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cantidad de Inscripciones</Label>
              <Input type="number" min={1} value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Servicio Destino</Label>
              <Select value={servicio} onValueChange={setServicio}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SERVICIOS_DESTINO.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {headerError ? (
            <div className="text-sm text-destructive" data-testid="crear-error" role="alert">
              {headerError}
            </div>
          ) : null}
          <div className="flex justify-end">
            <Button
              onClick={() => {
                if (!nombre.trim()) {
                  setHeaderError("Nombre Proceso Inscripción es obligatorio.");
                  return;
                }
                setHeaderError(null);
                setStep("mode");
              }}
              data-testid="crear-continuar-header"
            >
              Continuar
            </Button>
          </div>
        </Card>
      )}

      {step === "mode" && (
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold">Encabezado del Proceso Inscripción</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <Field label="Nombre" value={nombre} />
            <Field label="N° Proceso" value="(se genera al guardar)" />
            <Field label="Cantidad" value={String(cantidad)} />
            <Field label="Servicio Destino" value={servicio} />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="secondary" onClick={() => setStep("archivo")} data-testid="crear-importar-archivo"><FileUp className="h-4 w-4 mr-2" />Importar Archivo</Button>
            <Button onClick={() => { if (detalles.length === 0) setDetalles([emptyDet()]); setStep("digitar"); }} data-testid="crear-digitar"><Pencil className="h-4 w-4 mr-2" />Digitar Inscripciones</Button>
            <Button variant="ghost" onClick={() => setStep("header")}>Regresar</Button>
          </div>
        </Card>
      )}

      {step === "digitar" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Detalle de la Inscripción</h2>
            <Button size="sm" variant="outline" onClick={() => setDetalles([...detalles, emptyDet()])}>
              <Plus className="h-4 w-4 mr-1" /> Agregar fila
            </Button>
          </div>
          <div className="space-y-4">
            {detalles.map((d, idx) => (
              <DetailRow
                key={idx}
                value={d}
                onChange={(v) => setDetalles(detalles.map((x, i) => (i === idx ? v : x)))}
                onRemove={() => setDetalles(detalles.filter((_, i) => i !== idx))}
                index={idx}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setStep("mode")}>Regresar</Button>
            <Button variant="outline" onClick={() => setDetalles([emptyDet()])}>Limpiar</Button>
            {detalleError ? (
              <div className="flex-1 text-sm text-destructive self-center" data-testid="crear-detalle-error" role="alert">
                {detalleError}
              </div>
            ) : null}
            <Button
              onClick={() => {
                if (detalles.some((d) => !d.numId?.trim() || !d.numProducto?.trim())) {
                  setDetalleError("N° identificación y N° producto son obligatorios en cada fila.");
                  return;
                }
                const badEmail = detalles.find((d) => d.email?.trim() && !emailPattern.test(d.email.trim()));
                if (badEmail) {
                  setDetalleError("Formato de correo electrónico inválido.");
                  return;
                }
                setDetalleError(null);
                commit("Digitar", detalles);
              }}
              data-testid="crear-continuar-detalle"
            >
              Continuar
            </Button>
          </div>
        </Card>
      )}

      {step === "archivo" && (
        <Card className="p-6 space-y-4 max-w-3xl">
          <h2 className="font-semibold">Importar Archivo Plano</h2>
          <p className="text-sm text-muted-foreground">
            Pegue el contenido del archivo plano ACH / Davivienda / Mixto. Una línea por inscripción con campos
            separados por <span className="font-mono">|</span> (tipoId|numId|nombres|apellidos|referencia|tipoCuenta|numCuenta|banco|valorMax|email|contacto|cargo).
          </p>
          <div className="space-y-1.5">
            <Label>Nombre del archivo</Label>
            <Input placeholder="Inscripciones davivienda.txt" value={archivoNombre} onChange={(e) => setArchivoNombre(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Archivo plano (.txt)</Label>
            <Input
              type="file"
              accept=".txt,.csv,text/plain"
              data-testid="crear-archivo-input"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setArchivoNombre(file.name);
                setArchivoTexto(await file.text());
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Contenido (o pegue aquí)</Label>
            <Textarea
              rows={10}
              className="font-mono text-xs"
              placeholder={"NIT|8000190511|Distribuidora|Andina|REF-001|CUENTA DE AHORRO|570098370014007|DAVIVIENDA|1000000|finanzas@empresa.co|María|Tesorera"}
              value={archivoTexto}
              onChange={(e) => setArchivoTexto(e.target.value)}
            />
          </div>
          {archivoError ? (
            <div className="text-sm text-destructive" data-testid="crear-archivo-error" role="alert">
              {archivoError}
            </div>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setStep("mode")}>Regresar</Button>
            {archivoTexto.trim() ? (
              <span className="sr-only" data-testid="crear-archivo-ready" aria-hidden="true" />
            ) : null}
            <Button
              onClick={() => {
                const parsed = parsePlainFileContent(archivoTexto);
                if (!parsed.ok) {
                  setArchivoError(parsed.error);
                  return;
                }
                setArchivoError(null);
                commit("Archivo Plano", parsed.rows);
              }}
              disabled={!archivoTexto.trim()}
              data-testid="crear-procesar-archivo"
            >
              Procesar archivo
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const items: { k: Step; label: string }[] = [
    { k: "header", label: "Encabezado" },
    { k: "mode", label: "Modo de carga" },
    { k: "digitar", label: "Detalle" },
  ];
  return (
    <div className="flex items-center gap-3 text-xs">
      {items.map((s, i) => {
        const idx = items.findIndex((x) => x.k === step);
        const active = items.findIndex((x) => x.k === s.k) <= idx;
        return (
          <div key={s.k} className="flex items-center gap-3">
            <div className={`h-6 w-6 rounded-full grid place-items-center font-semibold ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
            <span className={active ? "font-medium" : "text-muted-foreground"}>{s.label}</span>
            {i < items.length - 1 && <span className="text-muted-foreground">›</span>}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function DetailRow({ value, onChange, onRemove, index }: { value: InscripcionDetalle; onChange: (v: InscripcionDetalle) => void; onRemove: () => void; index: number }) {
  const set = <K extends keyof InscripcionDetalle>(k: K, v: InscripcionDetalle[K]) => onChange({ ...value, [k]: v });
  return (
    <Card className="p-4 border-dashed">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">Inscripción #{index + 1}</div>
        <Button variant="ghost" size="sm" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
      </div>
      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <div className="space-y-1">
          <Label className="text-xs">Tipo Identificación</Label>
          <Select value={value.tipoId} onValueChange={(v) => set("tipoId", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TIPOS_ID.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label className="text-xs">N° Identificación</Label><Input value={value.numId} onChange={(e) => set("numId", e.target.value)} /></div>
        <div className="space-y-1"><Label className="text-xs">Referencia</Label><Input value={value.referencia} onChange={(e) => set("referencia", e.target.value)} /></div>
        <div className="space-y-1"><Label className="text-xs">Nombres</Label><Input value={value.nombres} onChange={(e) => set("nombres", e.target.value)} /></div>
        <div className="space-y-1"><Label className="text-xs">Apellidos</Label><Input value={value.apellidos} onChange={(e) => set("apellidos", e.target.value)} /></div>
        <div className="space-y-1">
          <Label className="text-xs">Tipo Producto / Servicio Destino</Label>
          <Select value={value.tipoProducto} onValueChange={(v) => set("tipoProducto", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TIPOS_CUENTA.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label className="text-xs">N° Producto / Cuenta</Label><Input value={value.numProducto} onChange={(e) => set("numProducto", e.target.value)} /></div>
        <div className="space-y-1">
          <Label className="text-xs">Banco Destino</Label>
          <Select value={value.bancoDestino} onValueChange={(v) => set("bancoDestino", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{BANCOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label className="text-xs">Valor Máximo de Pago $</Label><Input type="number" value={value.valorMax} onChange={(e) => set("valorMax", Number(e.target.value))} /></div>
        <div className="space-y-1"><Label className="text-xs">Dirección e-mail</Label><Input value={value.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div className="space-y-1"><Label className="text-xs">Nombre del Contacto</Label><Input value={value.contacto} onChange={(e) => set("contacto", e.target.value)} /></div>
        <div className="space-y-1"><Label className="text-xs">Cargo del Contacto</Label><Input value={value.cargo} onChange={(e) => set("cargo", e.target.value)} /></div>
      </div>
    </Card>
  );
}
