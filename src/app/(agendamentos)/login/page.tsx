import type { Metadata } from "next";
import { LoginClient } from "./login-client.component";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agendamentos.vercel.app";

export const metadata: Metadata = {
  title: "Login — Agendamentos",
  description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
  openGraph: {
    title: "Agendamentos — Gestão Inteligente & Sistema de Agendamentos",
    description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
    url: `${siteUrl}/login`,
    siteName: "Agendamentos",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        secureUrl: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Agendamentos — Gestão Inteligente & Sistema de Agendamentos",
        type: "image/png",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agendamentos — Gestão Inteligente & Sistema de Agendamentos",
    description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
