import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://harmonize-estetica.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Harmonize — Sistema de agendamentos",
    template: "%s | Harmonize",
  },
  description: "Gerencie horários, clientes, produtos e relatórios da sua clínica de estética em um só lugar.",
  openGraph: {
    title: "Harmonize — Gestão Inteligente para Clínicas de Estética",
    description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
    url: siteUrl,
    siteName: "Harmonize",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        secureUrl: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Harmonize — Gestão Inteligente para Clínicas de Estética",
        type: "image/png",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harmonize — Gestão Inteligente para Clínicas de Estética",
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
