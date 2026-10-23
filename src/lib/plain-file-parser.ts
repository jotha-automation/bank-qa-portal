import { BANCOS, TIPOS_CUENTA, TIPOS_ID } from "@/lib/mock-data";
import type { InscripcionDetalle } from "@/lib/store";

export type PlainFileParseResult =
  | { ok: true; rows: InscripcionDetalle[] }
  | { ok: false; error: string; line?: number };

const MIN_FIELDS = 8;

export function parsePlainFileContent(text: string): PlainFileParseResult {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { ok: false, error: "El archivo está vacío." };
  }

  const rows: InscripcionDetalle[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const parts = lines[i].split("|");
    if (parts.length < MIN_FIELDS) {
      return {
        ok: false,
        error: `Formato de archivo inválido en línea ${i + 1}. Se requieren al menos ${MIN_FIELDS} campos separados por |.`,
        line: i + 1,
      };
    }
    const [
      tipoId,
      numId,
      nombres,
      apellidos,
      referencia,
      tipoProducto,
      numProducto,
      bancoDestino,
      valor,
      email,
      contacto,
      cargo,
    ] = parts;

    if (!numId?.trim() || !numProducto?.trim()) {
      return {
        ok: false,
        error: `Formato de archivo inválido en línea ${i + 1}. N° identificación y N° producto son obligatorios.`,
        line: i + 1,
      };
    }

    rows.push({
      tipoId: tipoId?.trim() || TIPOS_ID[0],
      numId: numId.trim(),
      nombres: nombres?.trim() || "",
      apellidos: apellidos?.trim() || "",
      referencia: referencia?.trim() || "",
      tipoProducto: tipoProducto?.trim() || TIPOS_CUENTA[0],
      numProducto: numProducto.trim(),
      bancoDestino: bancoDestino?.trim() || BANCOS[0],
      valorMax: Number(valor || 0),
      email: email?.trim() || "",
      contacto: contacto?.trim() || "",
      cargo: cargo?.trim() || "",
    });
  }

  return { ok: true, rows };
}
