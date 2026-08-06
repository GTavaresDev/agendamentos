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
    <Card className="overflow-hidden border-zinc-800 bg-zinc-900 text-white shadow-md transition-all hover:border-zinc-700 hover:bg-zinc-950">
      <CardContent className="p-2.5 sm:p-5">
        <div className="mb-2 sm:mb-5 flex items-center justify-between gap-1">
          <div className="flex size-7 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-zinc-800 text-white">
            <Icon className="size-3.5 sm:size-5" />
          </div>
          <Badge variant="outline" className="border-white/15 bg-white/10 text-[9px] sm:text-xs font-medium text-white px-1.5 py-0.5 shrink-0">
            +12% <span className="hidden sm:inline ml-1 text-zinc-400">este mês</span>
          </Badge>
        </div>
        <p className="text-[11px] sm:text-sm font-medium text-zinc-400 truncate">{label}</p>
        <div className="mt-0.5 sm:mt-1 flex items-baseline justify-between gap-1">
          <p className="text-lg sm:text-3xl font-semibold tracking-[-0.04em] text-white tabular-nums">
            {value}
          </p>
          <span className="text-[9px] sm:text-xs text-zinc-400 truncate max-w-[70px] sm:max-w-none">{detail}</span>
        </div>
        {progress !== undefined && (
          <div className="mt-2 sm:mt-4 h-1 sm:h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
