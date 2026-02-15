"use client";

import { AppShell } from "@/components/layout/app-shell";
import { HeroSection } from "@/components/home/hero-section";
import { StatsSection } from "@/components/home/stats-section";
import { WhySection } from "@/components/home/why-section";
import { FeaturedAgents } from "@/components/home/featured-agents";

export default function Home() {
  return (
    <AppShell fullWidth>
      <div className="flex flex-col gap-0 pb-20">
        <HeroSection />
        <StatsSection />
        <WhySection />
        <FeaturedAgents />
      </div>
    </AppShell>
  );
}
