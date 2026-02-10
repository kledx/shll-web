"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { RentalItem } from "@/hooks/useMyRentals";
import Link from "next/link";
import { Clock, ExternalLink, ArrowDownToLine } from "lucide-react";
import { useAgentAccount } from "@/hooks/useAgentAccount";

interface RentalCardProps {
    rental: RentalItem;
}

export function RentalCard({ rental }: RentalCardProps) {
    const { account: agentAccount } = useAgentAccount(rental.tokenId.toString());

    const handleCopyAccount = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation if nested
        if (agentAccount) {
            navigator.clipboard.writeText(agentAccount);
            // In a real app, show toast
        }
    };

    const isExpired = !rental.isActive;
    const daysLeft = Math.ceil((Number(rental.expires) - Date.now() / 1000) / 86400);

    // formatAddress helper
    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <Card className={`border ${isExpired ? 'border-gray-200 opacity-70' : 'border-[var(--color-burgundy)]/20'}`}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">Agent #{rental.tokenId.toString()}</CardTitle>
                        <CardDescription className="text-xs font-mono mt-1">
                            {formatAddress(rental.agentAccount)}
                        </CardDescription>
                    </div>
                    <Chip variant={isExpired ? "default" : "burgundy"}>
                        {isExpired ? "Expired" : "Active"}
                    </Chip>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    <span>
                        {isExpired
                            ? `Expired on ${new Date(Number(rental.expires) * 1000).toLocaleDateString()}`
                            : `Expires in ${daysLeft} days`}
                    </span>
                </div>
                {/* Visual placeholder for activity or stats */}
                <div className="h-1 bg-gray-100 rounded overflow-hidden">
                    <div className={`h-full ${isExpired ? 'bg-gray-300' : 'bg-[var(--color-burgundy)]'} w-3/4`} />
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                <Button
                    variant="outline"
                    className="flex-1 gap-2 border-[var(--color-burgundy)]/20 hover:bg-[var(--color-burgundy)]/5 text-[var(--color-burgundy)]"
                    onClick={handleCopyAccount}
                >
                    <ArrowDownToLine className="w-4 h-4" /> Deposit
                </Button>

                <Link href={`/agent/${rental.nfa}/${rental.tokenId}/console`} className="flex-1">
                    <Button variant={isExpired ? "outline" : "default"} className="w-full group">
                        Manage
                        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
