"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Unhandled App Error]:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 text-center text-slate-100">
      <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
        <h2 className="mb-2 text-xl font-bold text-red-400">Ocorreu um erro inesperado</h2>
        <p className="mb-6 text-sm text-slate-400">
          Não foi possível carregar este módulo no momento. Tente novamente mais tarde.
        </p>
        <button
          onClick={() => reset()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}
