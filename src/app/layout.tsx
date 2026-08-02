import type { Metadata } from "next";
import "./globals.css";
import { AppDataProvider } from "@/app/(agendamentos)/_components/app-data-provider";

export const metadata: Metadata = {
  title: "Cliente — Sistema de agendamentos",
  description: "Gerencie horários, clientes e atendimentos em um só lugar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <AppDataProvider>{children}</AppDataProvider>
      </body>
    </html>
  );
}
