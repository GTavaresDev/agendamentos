/** Cor neutra usada quando o serviço não possui cor configurada. */
export const DEFAULT_SERVICE_COLOR = "#a1a1aa";

/**
 * Resolve a cor de um serviço a partir da cor já vinculada ao agendamento
 * (join pelo serviceId), com fallback por nome para registros antigos sem
 * vínculo, e um fallback neutro final quando nenhuma cor está configurada.
 */
export function resolveServiceColor(
  services: Array<{ id?: string; name: string; color?: string }>,
  appt: { serviceId?: string | null; service?: string | null; serviceColor?: string | null },
): string {
  if (appt.serviceColor) return appt.serviceColor;

  const byId = appt.serviceId ? services.find((s) => s.id === appt.serviceId) : undefined;
  if (byId?.color) return byId.color;

  const byName = appt.service
    ? services.find((s) => s.name.toLowerCase() === appt.service!.toLowerCase())
    : undefined;

  return byName?.color || DEFAULT_SERVICE_COLOR;
}

/** Escolhe preto ou branco para o texto, conforme o brilho da cor de fundo (WCAG-friendly). */
export function getContrastTextColor(hex: string): "#000000" | "#ffffff" {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return "#ffffff";

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return "#ffffff";

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140 ? "#000000" : "#ffffff";
}
