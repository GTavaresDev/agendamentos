"use client";

import { SiteHeader } from "./site-header";
import { SiteHero } from "./site-hero";
import { ProductMockup } from "./product-mockup";
import { SiteStats } from "./site-stats";
import { SiteFeatures } from "./site-features";
import { SiteClientPortal } from "./site-client-portal";
import { SiteFaq } from "./site-faq";
import { SiteCtaBanner, SiteFooter } from "./site-footer";

export function AgendamentosLanding() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-950 selection:bg-zinc-900 selection:text-white">
      <SiteHeader />
      <main>
        <SiteHero />
        <ProductMockup />
        <SiteStats />
        <SiteFeatures />
        <SiteClientPortal />
        <SiteFaq />
        <SiteCtaBanner />
      </main>
      <SiteFooter />
    </div>
  );
}
