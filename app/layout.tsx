import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "Atempo — Sistema de agendamentos",
    description: "Gerencie horários, clientes e atendimentos em um só lugar.",
    openGraph: {
      title: "Atempo — Agendamentos simples. Rotina mais leve.",
      description: "Gerencie horários, clientes e atendimentos em um só lugar.",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1680, height: 941, alt: "Atempo — Sistema de agendamentos" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Atempo — Sistema de agendamentos",
      description: "Agendamentos simples. Rotina mais leve.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
