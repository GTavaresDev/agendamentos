import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandLogo({
  inverse = false,
  large = false,
  className,
}: {
  inverse?: boolean;
  large?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-label="Cliente"
      className={cn("inline-flex items-center gap-3", className)}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl",
          large ? "size-12" : "size-9",
          inverse ? "bg-white text-zinc-950" : "bg-zinc-950 text-white",
        )}
      >
        <CalendarDays className={large ? "size-6" : "size-[18px]"} />
      </span>
      <span
        className={cn(
          "font-semibold tracking-[-0.03em]",
          large ? "text-3xl" : "text-lg",
          inverse ? "text-white" : "text-zinc-950",
        )}
      >
        Cliente
      </span>
    </span>
  );
}
