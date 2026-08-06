import React from "react";
import { SchedulingProvider } from "./_components/scheduling-provider";
import { ShellLayout } from "./_components/shell-layout";

export default function LeftNavBarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SchedulingProvider>
      <ShellLayout>{children}</ShellLayout>
    </SchedulingProvider>
  );
}
