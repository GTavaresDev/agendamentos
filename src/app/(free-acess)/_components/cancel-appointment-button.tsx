"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import { cancelClientAppointmentAction } from "../_actions/portal-appointment-actions";

export function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    setLoading(true);
    setError("");

    const result = await cancelClientAppointmentAction(appointmentId);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Não foi possível cancelar.");
      setConfirming(false);
      return;
    }

    router.refresh();
  }

  if (!confirming) {
    return (
      <div>
        <Button variant="outline" className="w-full" onClick={() => setConfirming(true)}>
          Cancelar agendamento
        </Button>
        {error ? (
          <p className="mt-3 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-sm font-semibold text-zinc-950">Cancelar este agendamento?</p>
      <p className="mt-1 text-sm text-zinc-500">
        Essa ação não pode ser desfeita. Para remarcar, faça um novo agendamento.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button className="w-full" onClick={cancel} disabled={loading}>
          {loading ? "Cancelando..." : "Sim, cancelar"}
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setConfirming(false)}
          disabled={loading}
        >
          Manter agendamento
        </Button>
      </div>
    </div>
  );
}
