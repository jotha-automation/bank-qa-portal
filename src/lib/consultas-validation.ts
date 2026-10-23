/** Validates consultas search filters for QA automation (empty / invalid format). */

export function validateConsultasFilters(numProceso: string): string | null {
  const trimmed = numProceso.trim();
  if (!trimmed) {
    return "Debe ingresar al menos un criterio de búsqueda (por ejemplo, N° de proceso).";
  }
  if (!/^(P-\d{4}-\d{3,}|INS-[A-Z0-9-]+)$/i.test(trimmed)) {
    return "Formato de N° proceso inválido. Use P-AAAA-NNN (ej: P-2026-001) o el ID sembrado INS-…";
  }
  return null;
}
