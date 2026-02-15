"use client";

import { AgentCard } from "@/components/business/agent-card";
import { useListings } from "@/hooks/useListings";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FeaturedAgents() {
    const { data: listings, isLoading } = useListings();
    const { t } = useTranslation();

    // Take top 3 agents for now
    // In future this could be based on "success rate" or "featured" flag
    const featuredListings = listings ? listings.slice(0, 3) : [];

    if (isLoading) {
        return (
            <div className="flex justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    if (!featuredListings.length) {
        return null;
    }

    return (
        <section className="py-16 md:py-24 bg-[var(--color-surface)]">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
                            {t.home.featured.title}
                        </h2>
                        <p className="mt-4 text-lg text-[var(--color-muted-foreground)]">
                            {t.home.featured.subtitle}
                        </p>
                    </div>
                    <Link href="/market">
                        <Button variant="outline" className="hidden md:flex">
                            {t.home.hero.cta} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {featuredListings.map((listing) => (
                        <AgentCard
                            key={`${listing.nfaAddress}-${listing.tokenId}`}
                            listing={listing}
                        />
                    ))}
                </div>

                <div className="mt-8 md:hidden">
                    <Link href="/market" className="block w-full">
                        <Button variant="outline" className="w-full">
                            {t.home.hero.cta} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
