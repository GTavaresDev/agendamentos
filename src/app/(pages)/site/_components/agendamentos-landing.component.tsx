"use client";

import { SiteHeader } from "./site-header.component";
import { SiteHero } from "./site-hero.component";
import { ProductMockup } from "./product-mockup.component";
import { SiteStats } from "./site-stats.component";
import { SiteFeatures } from "./site-features.component";
import { SiteClientPortal } from "./site-client-portal.component";
import { SiteFaq } from "./site-faq.component";
import { SiteCtaBanner, SiteFooter } from "./site-footer.component";

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
