import React from "react";
import { Providers } from "@/app/(agendamentos)/(left-nav-bar)/_providers/providers";
import { ShellLayout } from "./_components/shell-layout";

export default function LeftNavBarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <ShellLayout>{children}</ShellLayout>
    </Providers>
  );
}
