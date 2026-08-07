import { CalendarDays } from "lucide-react";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge";
import { Card, CardContent } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  progress,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof CalendarDays;
  progress?: number;
}) {
  return (
    <Card className="@container/stat h-full overflow-hidden border-zinc-800 bg-zinc-900 text-white shadow-md transition-all hover:border-zinc-700 hover:bg-zinc-950 flex flex-col justify-between">
      <CardContent className="p-[clamp(0.75rem,4.5cqw,1.25rem)] flex flex-col justify-between h-full space-y-[clamp(0.5rem,2.5cqw,1rem)]">
        <div>
          <div className="mb-[clamp(0.375rem,2.5cqw,0.75rem)] flex items-center justify-between gap-[clamp(0.25rem,1.5cqw,0.75rem)]">
            <div className="flex size-[clamp(1.75rem,8cqw,2.5rem)] shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-white">
              <Icon className="size-[clamp(0.875rem,4cqw,1.25rem)]" />
            </div>
            <Badge
              variant="outline"
              className="border-white/15 bg-white/10 text-[clamp(0.5625rem,2.5cqw,0.75rem)] font-medium text-white px-[clamp(0.375rem,1.8cqw,0.5rem)] py-[clamp(0.125rem,0.8cqw,0.25rem)] shrink-0 whitespace-nowrap leading-none flex items-center"
            >
              +12% <span className="text-zinc-400 ml-1">este mês</span>
            </Badge>
          </div>
          <p className="text-[clamp(0.6875rem,3.2cqw,0.875rem)] font-medium text-zinc-400 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {label}
          </p>
        </div>

        <div className="mt-auto pt-1">
          <div className="flex items-baseline justify-between gap-x-[clamp(0.25rem,1.5cqw,0.5rem)]">
            <p className="text-[clamp(1.125rem,6.8cqw,1.875rem)] font-semibold tracking-[-0.04em] text-white tabular-nums leading-none whitespace-nowrap">
              {value}
            </p>
            <span className="text-[clamp(0.5625rem,2.6cqw,0.75rem)] text-zinc-400 font-normal leading-none whitespace-nowrap shrink-0">
              {detail}
            </span>
          </div>
          {progress !== undefined && (
            <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] h-[clamp(0.25rem,1.2cqw,0.375rem)] overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
