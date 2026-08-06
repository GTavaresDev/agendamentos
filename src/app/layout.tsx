import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agendamentos.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Agendamentos — Sistema de Gestão & Agendamentos",
    template: "%s | Agendamentos",
  },
  description: "Gerencie horários, clientes, produtos e relatórios do seu negócio em um só lugar.",
  openGraph: {
    title: "Agendamentos — Gestão Inteligente de Agendamentos",
    description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
    url: siteUrl,
    siteName: "Agendamentos",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        secureUrl: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Agendamentos — Gestão Inteligente de Agendamentos",
        type: "image/png",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agendamentos — Gestão Inteligente de Agendamentos",
    description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
