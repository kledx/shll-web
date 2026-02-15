"use client";

import { useMyRentals } from "@/hooks/useMyRentals";
import { RentalCard } from "./rental-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export function MyRentalsList() {
    const { rentals, isLoading } = useMyRentals();
    const { t } = useTranslation();

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
                    <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-50">
                        <p>{t.dashboard.empty.instances}</p>
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
                    <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-50">
                        <p>{t.dashboard.empty.owned}</p>
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
                    <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-50">
                        <p>{t.dashboard.empty.history}</p>
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
