// Lightweight client-side store for the mock portal.
// Persists session, inscripciones and transacciones in localStorage.

import {
  addBusinessDays,
  applyBusinessDayRejections,
  subtractBusinessDays,
} from "./business-days";
import { DEFAULT_BUSINESS_DAYS_PARAM } from "./demo-config";
import { MOCK_USERS, type MockUser } from "./mock-data";

const SESSION_KEY = "dav.session";
const INSCRIPCIONES_KEY = "dav.inscripciones";
const TRANSACCIONES_KEY = "dav.transacciones";
const CONFIG_KEY = "dav.demo.config";

export type Session = {
  user: MockUser;
  loggedAt: string;
};

export type InscripcionEstado =
  | "Creada"
  | "Validada"
  | "Actualizada"
  | "Enviada a otro banco"
  | "Aceptada"
  | "Rechazada"
  | "Pagado Parcial";

export type Inscripcion = {
  numProceso: string;
  nombreProceso: string;
  cantidad: number;
  servicioDestino: string;
  origen: "Digitar" | "Archivo Plano";
  detalles: InscripcionDetalle[];
  estado: InscripcionEstado;
  motivoRechazo?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  createdBy: string;
};

export type InscripcionDetalle = {
  tipoId: string;
  numId: string;
  nombres: string;
  apellidos: string;
  referencia: string;
  tipoProducto: string;
  numProducto: string;
  bancoDestino: string;
  valorMax: number;
  email: string;
  contacto: string;
  cargo: string;
};

export type Transaccion = {
  id: string;
  tipo: "ACH" | "DV" | "Transferencia interna";
  servicio: string;
  numProcesoInscripcion?: string;
  cuentaOrigen: string;
  cuentaDestino: string;
  banco: string;
  valor: number;
  estado: "Procesada" | "Pendiente" | "Rechazada";
  fecha: string;
  createdBy: string;
};

export type DemoConfig = {
  businessDaysParam: number;
  simulateBusinessDays: boolean;
  /** ISO timestamp — overrides real clock for business-day rejection rules. */
  simulatedNow?: string;
};

const DEFAULT_DEMO_SEED_DETALLE = {
  tipoId: "NIT",
  numId: "8006007002",
  nombres: "Servicios",
  apellidos: "Generales SAS",
  referencia: "REF-ACH-DEMO",
  tipoProducto: "CUENTAS CORRIENTES OTROS BANCOS",
  numProducto: "1082869975",
  bancoDestino: "BBVA",
  valorMax: 5_000_000,
  email: "finanzas@servicios.co",
  contacto: "Laura",
  cargo: "Mesa de pagos",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new StorageEvent("storage", { key }));
}

export function getDemoConfig(): DemoConfig {
  return read<DemoConfig>(CONFIG_KEY, {
    businessDaysParam: DEFAULT_BUSINESS_DAYS_PARAM,
    simulateBusinessDays: true,
  });
}

export function setDemoConfig(patch: Partial<DemoConfig>) {
  write(CONFIG_KEY, { ...getDemoConfig(), ...patch });
}

export function getEffectiveNow(): Date {
  const cfg = getDemoConfig();
  if (cfg.simulatedNow) return new Date(cfg.simulatedNow);
  return new Date();
}

export function setSimulatedNow(iso?: string) {
  const cfg = getDemoConfig();
  if (iso) {
    setDemoConfig({ ...cfg, simulatedNow: iso });
  } else {
    const { simulatedNow: _removed, ...rest } = cfg;
    write(CONFIG_KEY, rest);
  }
}

/** Advance the simulated clock by N business days (Mon–Fri). */
export function advanceBusinessDays(n: number) {
  const next = addBusinessDays(getEffectiveNow(), n);
  setSimulatedNow(next.toISOString());
}

/** Force "today" to the nearest Saturday for weekend / non-business-day checks. */
export function simulateWeekend() {
  const now = getEffectiveNow();
  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);
  const day = cursor.getDay();
  const daysUntilSaturday = day === 6 ? 0 : (6 - day + 7) % 7;
  cursor.setDate(cursor.getDate() + daysUntilSaturday);
  setSimulatedNow(cursor.toISOString());
}

export function resetSimulatedNow() {
  setSimulatedNow(undefined);
}

// ---------- Session ----------
export function getSession(): Session | null {
  return read<Session | null>(SESSION_KEY, null);
}

export function login(
  cliente: string,
  tipoId: string,
  numDocumento: string,
  clave: string,
  token?: string,
): { ok: true; session: Session } | { ok: false; error: string } {
  const user = MOCK_USERS.find((u) => u.numDocumento === numDocumento.trim());
  if (!user) return { ok: false, error: "Usuario no encontrado." };
  if (user.cliente !== cliente.trim()) {
    return { ok: false, error: "Código de cliente incorrecto." };
  }
  if (user.tipoId.toLowerCase() !== tipoId.trim().toLowerCase()) {
    return { ok: false, error: "Tipo de identificación no coincide con el usuario." };
  }
  if (user.clave !== clave.trim()) return { ok: false, error: "Clave incorrecta." };
  if (user.token) {
    if (!token?.trim()) return { ok: false, error: "Token requerido para este usuario." };
    if (user.token !== token.trim()) return { ok: false, error: "Token incorrecto." };
  }
  const session: Session = { user, loggedAt: new Date().toISOString() };
  write(SESSION_KEY, session);
  return { ok: true, session };
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new StorageEvent("storage", { key: SESSION_KEY }));
}

// ---------- Inscripciones ----------
function readInscripcionesRaw(): Inscripcion[] {
  return read<Inscripcion[]>(INSCRIPCIONES_KEY, []);
}

function persistInscripciones(items: Inscripcion[]) {
  write(INSCRIPCIONES_KEY, items);
}

export function getInscripciones(): Inscripcion[] {
  const raw = readInscripcionesRaw();
  const cfg = getDemoConfig();
  if (!cfg.simulateBusinessDays) return raw;
  const adjusted = applyBusinessDayRejections(raw, cfg.businessDaysParam, getEffectiveNow());
  if (JSON.stringify(adjusted) !== JSON.stringify(raw)) {
    persistInscripciones(adjusted);
  }
  return adjusted;
}

export function triggerBusinessDayRejections(): Inscripcion[] {
  const cfg = getDemoConfig();
  const raw = readInscripcionesRaw();
  const adjusted = applyBusinessDayRejections(raw, cfg.businessDaysParam, getEffectiveNow());
  persistInscripciones(adjusted);
  window.dispatchEvent(new StorageEvent("storage", { key: INSCRIPCIONES_KEY }));
  return adjusted;
}

export type SeedInscripcionOptions = {
  estado?: InscripcionEstado;
  numProceso?: string;
  fechaActualizacion?: string;
  fechaCreacion?: string;
  motivoRechazo?: string;
  nombreProceso?: string;
};

export function seedInscripcion(opts: SeedInscripcionOptions = {}): Inscripcion {
  const now = getEffectiveNow().toISOString();
  const suffix = String(Date.now()).slice(-6);
  const insc: Inscripcion = {
    numProceso: opts.numProceso ?? `INS-${suffix}-QA`,
    nombreProceso: opts.nombreProceso ?? "APTP Demo Seed",
    cantidad: 1,
    servicioDestino: "ACH",
    origen: "Digitar",
    detalles: [{ ...DEFAULT_DEMO_SEED_DETALLE }],
    estado: opts.estado ?? "Creada",
    motivoRechazo: opts.motivoRechazo,
    fechaCreacion: opts.fechaCreacion ?? now,
    fechaActualizacion: opts.fechaActualizacion ?? now,
    createdBy: "aptp-demo",
  };
  saveInscripcion(insc);
  return insc;
}

/** Seed an inscription in "Enviada a otro banco" with fecha N business days before effective now. */
export function seedEnviadoOtroBanco(businessDaysAgo = 1, numProceso?: string): Inscripcion {
  const anchor = getEffectiveNow();
  const fecha = subtractBusinessDays(anchor, businessDaysAgo);
  return seedInscripcion({
    estado: "Enviada a otro banco",
    numProceso,
    fechaCreacion: fecha.toISOString(),
    fechaActualizacion: fecha.toISOString(),
    nombreProceso: "APTP Enviada otro banco",
  });
}

export function saveInscripcion(insc: Inscripcion) {
  const all = readInscripcionesRaw();
  const idx = all.findIndex((i) => i.numProceso === insc.numProceso);
  if (idx >= 0) all[idx] = insc;
  else all.unshift(insc);
  persistInscripciones(all);
}

export function getInscripcion(numProceso: string): Inscripcion | undefined {
  return getInscripciones().find((i) => i.numProceso === numProceso);
}

export function nextProcesoNumber(): string {
  const n = getInscripciones().length + 1;
  return `INS-${String(Date.now()).slice(-6)}-${String(n).padStart(3, "0")}`;
}

export function markPagadoParcial(numProceso: string) {
  const insc = getInscripcion(numProceso);
  if (!insc) return;
  saveInscripcion({
    ...insc,
    estado: "Pagado Parcial",
    fechaActualizacion: new Date().toISOString(),
  });
}

// ---------- Transacciones ----------
export function getTransacciones(): Transaccion[] {
  return read<Transaccion[]>(TRANSACCIONES_KEY, []);
}

export function saveTransaccion(t: Transaccion) {
  const all = getTransacciones();
  all.unshift(t);
  write(TRANSACCIONES_KEY, all);
}

export function resetDemoData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(INSCRIPCIONES_KEY);
  window.localStorage.removeItem(TRANSACCIONES_KEY);
  window.localStorage.removeItem(CONFIG_KEY);
  resetSimulatedNow();
  window.dispatchEvent(new StorageEvent("storage", { key: INSCRIPCIONES_KEY }));
}

export function clearAll() {
  resetDemoData();
}

// OPTIMIZATION: Batch operations API for Playwright automation
// Reduces re-renders by combining multiple state updates into a single operation
export type BatchDemoOperation =
  | { type: "seedInscripcion"; opts?: SeedInscripcionOptions }
  | { type: "seedEnviadoOtroBanco"; businessDaysAgo?: number; numProceso?: string }
  | { type: "triggerBusinessDayRejections" }
  | { type: "setSimulatedNow"; isoDate: string }
  | { type: "resetSimulatedNow" }
  | { type: "advanceBusinessDays"; n: number }
  | { type: "simulateWeekend" };

export function batchDemoOperations(operations: BatchDemoOperation[]): {
  results: unknown[];
  inscripcionesCount: number;
} {
  const results: unknown[] = [];

  // Execute all operations without triggering storage events
  for (const op of operations) {
    switch (op.type) {
      case "seedInscripcion":
        results.push(seedInscripcion(op.opts));
        break;
      case "seedEnviadoOtroBanco":
        results.push(seedEnviadoOtroBanco(op.businessDaysAgo, op.numProceso));
        break;
      case "triggerBusinessDayRejections":
        results.push(triggerBusinessDayRejections());
        break;
      case "setSimulatedNow":
        setSimulatedNow(op.isoDate);
        results.push(getEffectiveNow().toISOString());
        break;
      case "resetSimulatedNow":
        resetSimulatedNow();
        results.push(getEffectiveNow().toISOString());
        break;
      case "advanceBusinessDays":
        results.push(advanceBusinessDays(op.n));
        break;
      case "simulateWeekend":
        results.push(simulateWeekend());
        break;
    }
  }

  // Single storage event after all operations
  window.dispatchEvent(new StorageEvent("storage", { key: INSCRIPCIONES_KEY }));

  return {
    results,
    inscripcionesCount: getInscripciones().length,
  };
}

// OPTIMIZATION: Quick setup for common business-day test scenarios
export function setupBusinessDayScenario(
  businessDaysParam: number,
  businessDaysAgo: number,
): { config: DemoConfig; inscripcion: Inscripcion; effectiveNow: string } {
  setDemoConfig({ businessDaysParam, simulateBusinessDays: true });
  const inscripcion = seedEnviadoOtroBanco(businessDaysAgo);
  triggerBusinessDayRejections();
  return {
    config: getDemoConfig(),
    inscripcion,
    effectiveNow: getEffectiveNow().toISOString(),
  };
}

declare global {
  interface Window {
    __aptpHydrated?: boolean;
    __aptpDemo?: {
      resetDemoData: typeof resetDemoData;
      login: typeof login;
      setDemoConfig: typeof setDemoConfig;
      getDemoConfig: typeof getDemoConfig;
      getEffectiveNow: typeof getEffectiveNow;
      setSimulatedNow: typeof setSimulatedNow;
      resetSimulatedNow: typeof resetSimulatedNow;
      advanceBusinessDays: typeof advanceBusinessDays;
      simulateWeekend: typeof simulateWeekend;
      seedInscripcion: typeof seedInscripcion;
      seedEnviadoOtroBanco: typeof seedEnviadoOtroBanco;
      triggerBusinessDayRejections: typeof triggerBusinessDayRejections;
      getInscripciones: typeof getInscripciones;
      // OPTIMIZATION: Batch operations for efficient Playwright automation
      batchOperations: typeof batchDemoOperations;
      setupBusinessDayScenario: typeof setupBusinessDayScenario;
    };
  }
}

if (typeof window !== "undefined") {
  window.__aptpDemo = {
    resetDemoData,
    login,
    setDemoConfig,
    getDemoConfig,
    getEffectiveNow,
    setSimulatedNow,
    resetSimulatedNow,
    advanceBusinessDays,
    simulateWeekend,
    seedInscripcion,
    seedEnviadoOtroBanco,
    triggerBusinessDayRejections,
    getInscripciones,
    batchOperations: batchDemoOperations,
    setupBusinessDayScenario,
  };
}
