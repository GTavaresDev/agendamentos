import type { Metadata } from "next";
import { redirect } from "next/navigation";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://harmonize-estetica.vercel.app";

export const metadata: Metadata = {
  title: "Harmonize — Gestão Inteligente para Clínicas de Estética",
  description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
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
  twitter: {
    card: "summary_large_image",
    title: "Harmonize — Gestão Inteligente para Clínicas de Estética",
    description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function HomePage() {
  redirect("/login");
}
