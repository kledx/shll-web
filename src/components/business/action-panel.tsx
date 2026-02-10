"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RentForm } from "./rent-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { useRent } from "@/hooks/useRent";

import { pad, Hex } from "viem";

interface ActionPanelProps {
    nfaAddress: string;
    tokenId: string;
    isActive: boolean;
    isOwner: boolean;
    isRenter: boolean;
    pricePerDay: string;
    minDays: number;
}

export function ActionPanel({ nfaAddress, tokenId, isActive, isOwner, isRenter, pricePerDay, minDays }: ActionPanelProps) {
    const { rentAgent, isLoading: isRenting } = useRent();

    const handleRent = async (days: number) => {
        // 0x1 is a mock listing ID for now
        const mockListingId = pad("0x01", { size: 32 });
        await rentAgent(mockListingId, days, pricePerDay);
    };

    return (
        <Tabs defaultValue="rent" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="rent">Rent / Extend</TabsTrigger>
                <TabsTrigger value="console" disabled={!isRenter && !isOwner}>
                    Console
                </TabsTrigger>
            </TabsList>

            <TabsContent value="rent">
                <RentForm
                    pricePerDay={pricePerDay}
                    minDays={minDays}
                    paymentToken="BNB"
                    onRent={handleRent}
                    isRenting={isRenting}
                />
            </TabsContent>

            <TabsContent value="console">
                <Card className="border-dashed border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/50">
                    <CardHeader>
                        <CardTitle>Agent Console</CardTitle>
                        <CardDescription>Execute trades and manage your agent.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                {isOwner ? "Owner View" : "Renter View"} - Access the terminal to control this agent.
                            </p>
                            <Link href={`/agent/${nfaAddress}/${tokenId}/console`}>
                                <Button className="w-full gap-2">
                                    Open Console <ExternalLink className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
