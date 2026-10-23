import { DEMO_REQ } from "./demo-config";
import type { Inscripcion } from "./store";

const REJECTION = DEMO_REQ.rejectionReason;

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Move date forward by N business days (Mon–Fri). */
export function addBusinessDays(date: Date, days: number): Date {
  const cursor = new Date(date);
  cursor.setHours(12, 0, 0, 0);
  let remaining = days;
  while (remaining > 0) {
    cursor.setDate(cursor.getDate() + 1);
    if (!isWeekend(cursor)) remaining -= 1;
  }
  return cursor;
}

/** Move date backward by N business days (Mon–Fri). */
export function subtractBusinessDays(date: Date, days: number): Date {
  const cursor = new Date(date);
  cursor.setHours(12, 0, 0, 0);
  let remaining = days;
  while (remaining > 0) {
    cursor.setDate(cursor.getDate() - 1);
    if (!isWeekend(cursor)) remaining -= 1;
  }
  return cursor;
}

/** Count business days (Mon–Fri) between two dates, exclusive of start, inclusive of end. */
export function businessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const cursor = new Date(start);
  cursor.setHours(12, 0, 0, 0);
  const limit = new Date(end);
  limit.setHours(12, 0, 0, 0);
  while (cursor < limit) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count += 1;
  }
  return count;
}

/** Auto-reject inscriptions sent to other banks after N business days without response. */
export function applyBusinessDayRejections(
  items: Inscripcion[],
  businessDaysParam: number,
  now = new Date(),
): Inscripcion[] {
  return items.map((item) => {
    if (item.estado !== "Enviada a otro banco") return item;
    const updated = new Date(item.fechaActualizacion);
    if (businessDaysBetween(updated, now) < businessDaysParam) return item;
    return {
      ...item,
      estado: "Rechazada",
      motivoRechazo: REJECTION,
      fechaActualizacion: now.toISOString(),
    };
  });
}
