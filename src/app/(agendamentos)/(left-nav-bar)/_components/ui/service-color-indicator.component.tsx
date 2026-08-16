import { cn } from "@/lib/utils";
import { getContrastTextColor } from "@/lib/service-color";
import { Badge } from "./badge.component";

/** Indicador visual reutilizável da cor de um serviço (barra ou ponto). */
export function ServiceColorIndicator({
  color,
  variant = "dot",
  className,
}: {
  color: string;
  variant?: "dot" | "bar";
  className?: string;
}) {
  if (variant === "bar") {
    return (
      <span
        aria-hidden
        className={cn("h-9 w-1 shrink-0 rounded-full ring-1 ring-inset ring-black/10", className)}
        style={{ backgroundColor: color }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn("inline-block size-2.5 shrink-0 rounded-full ring-1 ring-black/10", className)}
      style={{ backgroundColor: color }}
    />
  );
}

/** Badge com a cor configurada do serviço, no mesmo estilo do badge de Status. */
export function ServiceBadge({
  color,
  name,
  className,
}: {
  color: string;
  name: string;
  className?: string;
}) {
  return (
    <Badge
      className={cn("shrink-0 truncate", className)}
      style={{ backgroundColor: color, color: getContrastTextColor(color) }}
    >
      {name}
    </Badge>
  );
}
