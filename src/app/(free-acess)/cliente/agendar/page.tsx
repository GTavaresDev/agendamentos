import type { Metadata } from "next";
import { getBookableServicesAction } from "../../_actions/portal-booking-actions";
import { BookingWizard } from "../../_components/booking-wizard";
import { PortalShell, requireCompletePortalSession } from "../../_components/portal-shell";

export const metadata: Metadata = {
  title: "Agendar",
};

export default async function BookingPage() {
  const session = await requireCompletePortalSession();
  // Serviços chegam sem preço: o DTO do portal não carrega valores.
  const services = await getBookableServicesAction();

  return (
    <PortalShell
      session={session}
      title="Novo agendamento"
      subtitle="Escolha o serviço e o horário ideal para o seu atendimento."
    >
      <BookingWizard services={services} />
    </PortalShell>
  );
}
