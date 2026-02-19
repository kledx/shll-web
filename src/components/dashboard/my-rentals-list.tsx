"use client";

import { useMyRentals } from "@/hooks/useMyRentals";
import { RentalCard } from "./rental-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowRight, Bot } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MyRentalsList() {
    const { rentals, isLoading } = useMyRentals();
    const { t, language } = useTranslation();

    if (isLoading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[var(--color-burgundy)]" /></div>;
    }

    const myAgents = rentals.filter(r => r.isOwner && !r.isInstance);
    const myInstances = rentals.filter(r => r.isOwner && r.isInstance && r.isActive);
    const instanceHistory = rentals.filter(r => r.isOwner && r.isInstance && !r.isActive);

    return (
        <Tabs defaultValue="instances" className="w-full">
            <TabsList className="mb-6">
                <TabsTrigger value="instances">{t.dashboard.tabs.instances} ({myInstances.length})</TabsTrigger>
                <TabsTrigger value="owned">{t.dashboard.tabs.owned} ({myAgents.length})</TabsTrigger>
                <TabsTrigger value="history">{t.dashboard.tabs.history} ({instanceHistory.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="instances">
                {myInstances.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-xl">
                        <Bot className="mx-auto h-10 w-10 text-[var(--color-muted-foreground)] opacity-40 mb-3" />
                        <p className="text-[var(--color-muted-foreground)]">{t.dashboard.empty.instances}</p>
                        <Link href="/market" className="inline-block mt-4">
                            <Button variant="outline" size="sm">
                                {language === "zh" ? "浏览 Agent 市场" : "Browse Marketplace"}
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myInstances.map(rental => (
                            <RentalCard key={rental.tokenId.toString()} rental={rental} />
                        ))}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="owned">
                {myAgents.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-xl">
                        <Bot className="mx-auto h-10 w-10 text-[var(--color-muted-foreground)] opacity-40 mb-3" />
                        <p className="text-[var(--color-muted-foreground)]">{t.dashboard.empty.owned}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myAgents.map(rental => (
                            <RentalCard key={rental.tokenId.toString()} rental={rental} />
                        ))}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="history">
                {instanceHistory.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                        <p className="text-[var(--color-muted-foreground)]">{t.dashboard.empty.history}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {instanceHistory.map(rental => (
                            <RentalCard key={rental.tokenId.toString()} rental={rental} />
                        ))}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}
