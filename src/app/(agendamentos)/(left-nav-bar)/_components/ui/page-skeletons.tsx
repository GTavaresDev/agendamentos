import {
  Card,
  CardContent,
  CardHeader,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import { Skeleton } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/skeleton";
import {
  LIST_PAGE_SIZE,
  TABLE_BODY_MIN_HEIGHT_CLASS,
  TABLE_ROW_MIN_HEIGHT_CLASS,
} from "@/lib/pagination";

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex min-h-[132px] flex-col justify-between gap-4 rounded-2xl bg-zinc-950 p-6 sm:flex-row sm:items-center">
        <div className="space-y-3">
          <Skeleton className="h-5 w-28 bg-white/15" />
          <Skeleton className="h-7 w-64 bg-white/20" />
          <Skeleton className="h-4 w-80 max-w-full bg-white/10" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40 bg-white/15" />
          <Skeleton className="h-10 w-44 bg-white/20" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="min-h-[132px]">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="size-9 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Card className="min-h-[420px]">
          <CardHeader className="flex-row items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-52" />
            </div>
            <Skeleton className="h-8 w-28" />
          </CardHeader>
          <CardContent className="space-y-0 px-0 pb-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex h-[52px] items-center gap-4 border-t border-zinc-100 px-5"
              >
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-8 w-0.5" />
                <Skeleton className="size-8 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="hidden h-5 w-20 rounded-full sm:block" />
                <Skeleton className="size-7 rounded-lg" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="min-h-[420px]">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex h-[190px] items-end gap-3 border-b border-zinc-200 pt-4 sm:gap-5">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="w-full rounded-t-md"
                  style={{ height: `${40 + ((index * 17) % 50)}%` }}
                />
              ))}
            </div>
            <div className="mt-6 space-y-3 rounded-xl bg-zinc-50 p-4">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function TablePageSkeleton({
  columns = 5,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex min-h-[64px] flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <Skeleton className="h-10 max-w-md" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="hidden h-11 items-center gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 lg:grid"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr)) 36px` }}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-20" />
          ))}
          <span />
        </div>

        <div className={TABLE_BODY_MIN_HEIGHT_CLASS}>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex h-[52px] items-center gap-4 border-b border-zinc-100 px-5"
            >
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40 max-w-full" />
                <Skeleton className="h-3 w-56 max-w-full" />
              </div>
              <Skeleton className="hidden h-5 w-20 rounded-full sm:block" />
              <Skeleton className="size-7 shrink-0 rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function AgendaSkeleton() {
  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex min-h-[64px] flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="min-h-16 rounded-xl" />
        ))}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <Skeleton className="h-10 max-w-md" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex h-[60px] items-center justify-between border-b border-zinc-100 bg-zinc-50/70 px-4 sm:px-6">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <div className={TABLE_BODY_MIN_HEIGHT_CLASS}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex h-[52px] items-center gap-4 border-b border-zinc-100 px-4 sm:px-6"
            >
              <Skeleton className="h-4 w-14" />
              <Skeleton className="size-8 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="hidden h-4 w-20 lg:block" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="size-7 rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function ViewLoadingSkeleton({ view }: { view: string }) {
  if (view === "dashboard") {
    return <DashboardSkeleton />;
  }

  if (view === "agenda") {
    return <AgendaSkeleton />;
  }

  if (view === "usuarios") {
    return <TablePageSkeleton columns={4} rows={6} />;
  }

  if (view === "clientes") {
    return <TablePageSkeleton columns={5} rows={6} />;
  }

  if (view === "produtos") {
    return <TablePageSkeleton columns={5} rows={5} />;
  }

  if (view === "vendas") {
    return <TablePageSkeleton columns={5} rows={5} />;
  }

  if (view === "servicos") {
    return <TablePageSkeleton columns={4} rows={10} />;
  }

  return <TablePageSkeleton rows={5} />;
}

export function LoadingOverlayCard({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 lg:left-[256px] z-40 flex items-center justify-center bg-black/10 backdrop-blur-[3px] p-4 animate-in fade-in duration-150">
      <div className="flex flex-col items-center justify-center gap-3.5 rounded-2xl border border-zinc-200/80 bg-white/95 px-8 py-7 shadow-2xl backdrop-blur-md">
        <div className="size-10 rounded-full border-4 border-zinc-200 border-t-zinc-950 animate-spin" />
        <span className="text-xs font-semibold text-zinc-700 tracking-wide">{label}</span>
      </div>
    </div>
  );
}

