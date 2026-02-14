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

    const myAgents = rentals.filter(r => r.isOwner);
    const activeRentals = rentals.filter(r => r.isRenter && r.isActive);
    const expiredRentals = rentals.filter(r => r.isRenter && !r.isActive);

    return (
        <Tabs defaultValue="owned" className="w-full">
            <TabsList className="mb-6">
                <TabsTrigger value="owned">{t.dashboard.tabs.owned} ({myAgents.length})</TabsTrigger>
                <TabsTrigger value="active">{t.dashboard.tabs.active} ({activeRentals.length})</TabsTrigger>
                <TabsTrigger value="history">{t.dashboard.tabs.history} ({expiredRentals.length})</TabsTrigger>
            </TabsList>

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

            <TabsContent value="active">
                {activeRentals.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-50">
                        <p>{t.dashboard.empty.active}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeRentals.map(rental => (
                            <RentalCard key={rental.tokenId.toString()} rental={rental} />
                        ))}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="history">
                {expiredRentals.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-50">
                        <p>{t.dashboard.empty.history}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {expiredRentals.map(rental => (
                            <RentalCard key={rental.tokenId.toString()} rental={rental} />
                        ))}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}
