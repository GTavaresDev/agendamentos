/** Paradas do degradê de calor: verde (baixo) → amarelo → laranja → vermelho (alto). */
const HEATMAP_STOPS: Array<[percent: number, hex: string]> = [
  [0, "#dcfce7"],
  [25, "#86efac"],
  [50, "#fde047"],
  [75, "#fb923c"],
  [100, "#ef4444"],
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

/** Interpola a cor do heatmap para uma ocupação de 0 a 100%. */
export function getHeatmapColor(percent: number): string {
  const p = Math.max(0, Math.min(100, percent));
  for (let i = 0; i < HEATMAP_STOPS.length - 1; i++) {
    const [p0, c0] = HEATMAP_STOPS[i];
    const [p1, c1] = HEATMAP_STOPS[i + 1];
    if (p <= p1) {
      const t = (p - p0) / (p1 - p0);
      const [r0, g0, b0] = hexToRgb(c0);
      const [r1, g1, b1] = hexToRgb(c1);
      const r = lerp(r0, r1, t).toString(16).padStart(2, "0");
      const g = lerp(g0, g1, t).toString(16).padStart(2, "0");
      const b = lerp(b0, b1, t).toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    }
  }
  return HEATMAP_STOPS[HEATMAP_STOPS.length - 1][1];
}

export const HEATMAP_LEGEND = [
  { label: "Muito baixa", color: HEATMAP_STOPS[0][1] },
  { label: "Baixa", color: HEATMAP_STOPS[1][1] },
  { label: "Média", color: HEATMAP_STOPS[2][1] },
  { label: "Alta", color: HEATMAP_STOPS[3][1] },
  { label: "Muito alta", color: HEATMAP_STOPS[4][1] },
];
