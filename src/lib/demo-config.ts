/** Demo metadata aligned with REQ INC1353166 (Portal Empresarial · Inscripciones). */
export const DEMO_REQ = {
  id: "INC1353166",
  suite: "REQ INC1353166 - EN DIAGNÓSTICO/PENDIENTE DE RESPUESTA/FRONT/INSCRIPCIONES",
  project: "DAV_PORTAL_EMPRESARIAL",
  rejectionReason: "Error de Comunicación inscripción no realizada",
} as const;

/** Business days without bank response before auto-rejection (demo default: 1). */
export const DEFAULT_BUSINESS_DAYS_PARAM = Number(
  import.meta.env.VITE_DEMO_BUSINESS_DAYS_PARAM ?? "1",
);

export const DEMO_TARGET_URL =
  import.meta.env.VITE_PUBLIC_APP_URL || "http://localhost:8080";
