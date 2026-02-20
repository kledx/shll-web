"use client";

import { AppShell } from "@/components/layout/app-shell";
import { HeroSection } from "@/components/home/hero-section";
import { StatsSection } from "@/components/home/stats-section";
import { WhySection } from "@/components/home/why-section";
import { WorkflowSection } from "@/components/home/workflow-section";
import { FeaturedAgents } from "@/components/home/featured-agents";
import { ContractAddresses } from "@/components/home/contract-addresses";

export default function Home() {
  return (
    <AppShell fullWidth>
      <div className="flex flex-col gap-0 pb-20">
        <HeroSection />
        <StatsSection />
        <WhySection />
        <WorkflowSection />
        <ContractAddresses />
        <FeaturedAgents />
      </div>
    </AppShell>
  );
}
