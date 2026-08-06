import React from "react";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-zinc-800">
      {children}
    </label>
  );
}
