"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { AppShell } from "@/components/layout/app-shell";
import { AgentFilters } from "@/components/market/agent-filters";
import { MarketToolbar } from "@/components/market/market-toolbar";
import { AgentCard } from "@/components/business/agent-card";
import { useListings } from "@/hooks/useListings";
import { useAgentFilter } from "@/hooks/useAgentFilter";
import { Loader2, AlertTriangle, FilterX } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { SUPPORTED_CHAIN_ID, CHAIN_NAME } from "@/config/wagmi";
import { PageTransition } from "@/components/layout/page-transition";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";



export default function MarketPage() {
    const { t } = useTranslation();
    const { data: listings, isLoading } = useListings();
    const {
        filters,
        filteredListings,
        setStatus,
        setAgentType,
        setSearch,
        setSort,
        clearFilters,
        stats,
        agentTypes,
    } = useAgentFilter(listings || []);


    const { chain, isConnected } = useAccount();
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const isWrongChain = isConnected && chain && chain.id !== SUPPORTED_CHAIN_ID;

    // Loading State
    if (isLoading) {
        return (
            <AppShell>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell fullWidth>
            <PageTransition className="flex flex-col gap-6 md:gap-8">
                <PageHeader title={t.marketplace.title} subtitle={t.marketplace.subtitle} />

                {isWrongChain && (
                    <PageSection tone="warning" className="flex items-center gap-4 text-amber-900">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <span className="text-sm">{t.marketplace.wrongChain}</span>
                    </PageSection>
                )}

                <div className="flex flex-col gap-6 lg:flex-row xl:gap-8">
                    {/* Sidebar Filters (Desktop) */}
                    <aside className="hidden w-64 flex-shrink-0 lg:block">
                        <div className="sticky top-20">
                            <AgentFilters
                                filters={filters}
                                setStatus={setStatus}
                                setAgentType={setAgentType}
                                clearFilters={clearFilters}
                                stats={stats}
                                agentTypes={agentTypes}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex flex-1 flex-col gap-5 md:gap-6">
                        <MarketToolbar
                            search={filters.search}
                            setSearch={setSearch}
                            sort={filters.sort}
                            setSort={setSort}
                            onToggleFilters={() => setIsMobileFiltersOpen(true)}
                        />

                        {/* Mobile Filter Sheet */}
                        <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                            <SheetContent side="left" className="w-[80vw] sm:w-[350px]">
                                <div className="mt-6">
                                    <AgentFilters
                                        filters={filters}
                                        setStatus={setStatus}
                                        setAgentType={setAgentType}
                                        clearFilters={() => {
                                            clearFilters();
                                            setIsMobileFiltersOpen(false);
                                        }}
                                        stats={stats}
                                        agentTypes={agentTypes}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Grid */}
                        {filteredListings.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {filteredListings.map((listing) => (
                                    <AgentCard
                                        key={`${listing.nfaAddress}-${listing.tokenId}`}
                                        listing={listing}
                                    />
                                ))}
                            </div>
                        ) : (
                            <PageSection tone="dashed" className="flex flex-col items-center justify-center py-16 md:py-20 text-center">
                                <div className="rounded-full bg-[var(--color-surface)] p-3">
                                    <FilterX className="h-8 w-8 text-[var(--color-muted-foreground)]" />
                                </div>
                                <h3 className="mt-4 text-lg font-medium">{t.marketplace.noResults}</h3>
                                <p className="text-sm text-[var(--color-muted-foreground)]">
                                    {t.marketplace.searchPlaceholder}
                                </p>
                                <Button
                                    variant="link"
                                    onClick={clearFilters}
                                    className="mt-2 text-[var(--color-primary)]"
                                >
                                    {t.marketplace.filters.clear}
                                </Button>
                            </PageSection>
                        )}
                    </div>
                </div>
            </PageTransition>
        </AppShell>
    );
}
