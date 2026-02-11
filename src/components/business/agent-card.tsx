"use client";

import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, ShieldCheck } from "lucide-react";

export interface AgentListing {
    tokenId: string;
    nfaAddress: string;
    listingId: string;
    owner: string;
    pricePerDay: string;
    minDays: number;
    active: boolean;
    rented: boolean;
    renter?: string;
    capabilities: ("swap" | "repay")[];
    metadata?: {
        name?: string;
        image?: string;
    };
}

export function AgentCard({ listing }: { listing: AgentListing }) {
    return (
        <Card className={`hover:shadow-md transition-shadow relative overflow-hidden group ${listing.rented ? 'opacity-75' : ''}`}>
            {/* Decorative stamp effect */}
            <div className="absolute -right-12 -top-12 w-24 h-24 bg-[var(--color-sky)]/10 rounded-full blur-2xl group-hover:bg-[var(--color-sky)]/20 transition-colors" />

            <CardHeader>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <Chip variant="sticker">#{listing.tokenId}</Chip>
                        {listing.rented && (
                            <span className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                                <ShieldCheck className="w-3 h-3" />
                                Rented
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>min {listing.minDays}d</span>
                    </div>
                </div>
                <CardTitle className="truncate">
                    {listing.metadata?.name || `Agent ${listing.tokenId}`}
                </CardTitle>
                <CardDescription className="truncate font-mono text-xs">
                    by {listing.owner.slice(0, 6)}...{listing.owner.slice(-4)}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {listing.capabilities.map((cap) => (
                        <Chip
                            key={cap}
                            variant={cap === "swap" ? "secondary" : "default"}
                            className={cap === "swap" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}
                        >
                            {cap === "swap" ? "Swap Pack" : "Repay Pack"}
                        </Chip>
                    ))}
                </div>

                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-serif text-[var(--color-burgundy)]">
                        {listing.pricePerDay}
                    </span>
                    <span className="text-sm text-muted-foreground">/ day</span>
                </div>
            </CardContent>

            <CardFooter>
                <Link href={`/agent/${listing.nfaAddress}/${listing.tokenId}`} className="w-full">
                    <Button
                        className={`w-full justify-between ${listing.rented ? 'bg-muted text-muted-foreground hover:bg-muted/90' : 'group-hover:bg-[var(--color-burgundy)]/90'}`}
                        variant={listing.rented ? 'outline' : 'default'}
                    >
                        {listing.rented ? 'View Details' : 'Rent Now'} <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
