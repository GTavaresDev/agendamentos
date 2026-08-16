import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold", {
  variants: {
    variant: {
      default: "bg-zinc-950 text-white",
      secondary: "bg-zinc-100 text-zinc-700",
      success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10",
      warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10",
      destructive: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10",
      outline: "border border-zinc-200 bg-white text-zinc-600",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
