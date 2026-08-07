import { useState, useRef, useEffect } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Info,
  X,
} from "lucide-react";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import { cn } from "@/lib/utils";

export interface CardInfoExplanation {
  title: string;
  whatIsIt: string;
  howItIsCalculated: string;
  exampleOrNote?: string;
}

export function CardInfoModal({
  info,
  align = "center",
  className,
}: {
  info: CardInfoExplanation;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div
      className={cn("relative inline-flex items-center", className)}
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors focus:outline-none"
        aria-label="Informações do cálculo"
      >
        <Info className="size-4" />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-7 z-50 w-72 sm:w-80 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-left",
            align === "center" && "left-1/2 -translate-x-1/2",
            align === "right" && "right-0",
            align === "left" && "left-0",
          )}
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-zinc-900 text-white text-[10px] font-bold">
                i
              </span>
              <h4 className="text-xs font-semibold text-zinc-950 truncate">
                {info.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs text-zinc-600">
            <div>
              <strong className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">
                O que é referente
              </strong>
              <p className="leading-relaxed text-zinc-700">{info.whatIsIt}</p>
            </div>

            <div>
              <strong className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">
                Como é feito o cálculo
              </strong>
              <p className="rounded-lg bg-zinc-50 border border-zinc-100 p-2 font-mono text-[11px] text-zinc-800 leading-relaxed">
                {info.howItIsCalculated}
              </p>
            </div>

            {info.exampleOrNote && (
              <p className="text-[11px] text-zinc-500 italic pt-1 border-t border-zinc-100">
                💡 {info.exampleOrNote}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; payload?: { color?: string } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs shadow-xl">
      <p className="mb-2 font-semibold text-zinc-900">{label}</p>
      {payload.map((item) => (
        <div
          key={item.name}
          className="flex min-w-32 items-center justify-between gap-5 py-0.5"
        >
          <span className="flex items-center gap-1.5 text-zinc-500">
            <i
              className="size-2 rounded-full"
              style={{ background: item.payload?.color ?? item.color }}
            />
            {item.name}
          </span>
          <strong>{item.value.toLocaleString("pt-BR")}</strong>
        </div>
      ))}
    </div>
  );
}

export function MetricCard({
  title,
  value,
  change,
  description,
  icon: Icon,
  positive = true,
  info,
  align = "right",
}: {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: typeof CalendarDays;
  positive?: boolean;
  info?: CardInfoExplanation;
  align?: "left" | "right" | "center";
}) {
  return (
    <Card className="@container/report-card h-full overflow-hidden border-zinc-200/80 bg-white shadow-xs flex flex-col justify-between">
      <CardContent className="p-[clamp(0.75rem,4.5cqw,1.25rem)] flex flex-col justify-between h-full space-y-[clamp(0.5rem,2.5cqw,1rem)]">
        <div>
          <div className="flex items-center justify-between gap-[clamp(0.25rem,1.5cqw,0.75rem)] mb-[clamp(0.375rem,2.5cqw,0.75rem)]">
            <span className="flex size-[clamp(1.75rem,8cqw,2.5rem)] shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
              <Icon className="size-[clamp(0.875rem,4cqw,1.25rem)]" />
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {info && <CardInfoModal info={info} align={align} />}
              <Badge variant={positive ? "success" : "secondary"} className="text-[clamp(0.5625rem,2.5cqw,0.75rem)] px-[clamp(0.375rem,1.8cqw,0.5rem)] py-[clamp(0.125rem,0.8cqw,0.25rem)] whitespace-nowrap leading-none flex items-center">
                {positive ? (
                  <ArrowUpRight className="mr-0.5 size-[clamp(0.625rem,2.5cqw,0.75rem)]" />
                ) : (
                  <ArrowDownRight className="mr-0.5 size-[clamp(0.625rem,2.5cqw,0.75rem)]" />
                )}
                {change}
              </Badge>
            </div>
          </div>
          <p className="text-[clamp(0.6875rem,3.2cqw,0.875rem)] font-medium text-zinc-500 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{title}</p>
        </div>
        <div className="mt-auto pt-1">
          <p className="text-[clamp(1.125rem,6.8cqw,1.875rem)] font-semibold tracking-[-0.04em] text-zinc-950 leading-none whitespace-nowrap">
            {value}
          </p>
          <p className="mt-[clamp(0.25rem,1.5cqw,0.5rem)] text-[clamp(0.5625rem,2.6cqw,0.75rem)] text-zinc-400 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SectionHead({
  title,
  description,
  action,
  info,
  align = "center",
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  info?: CardInfoExplanation;
  align?: "left" | "right" | "center";
}) {
  return (
    <CardHeader className="p-3.5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
      <div>
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          {info && <CardInfoModal info={info} align={align} />}
        </div>
        <CardDescription className="text-xs sm:text-sm mt-0.5">{description}</CardDescription>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </CardHeader>
  );
}
