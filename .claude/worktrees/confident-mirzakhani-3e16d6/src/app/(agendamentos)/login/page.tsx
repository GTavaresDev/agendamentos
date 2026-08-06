import type { Metadata } from "next";
import { LoginClient } from "./login-client";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://harmonize-estetica.vercel.app";

export const metadata: Metadata = {
  title: "Login — Harmonize",
  description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
  openGraph: {
    title: "Harmonize — Gestão Inteligente para Clínicas de Estética",
    description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
    url: `${siteUrl}/login`,
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
  twitter: {
    card: "summary_large_image",
    title: "Harmonize — Gestão Inteligente para Clínicas de Estética",
    description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
