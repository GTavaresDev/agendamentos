import * as React from "react";
import { cn } from "@/lib/utils";

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700 ring-1 ring-inset ring-zinc-200", className)}>
      {initials}
    </span>
  );
}
