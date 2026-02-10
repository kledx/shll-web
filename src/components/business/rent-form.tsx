"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Check, Banknote } from "lucide-react";
import { useAccount } from "wagmi";

interface RentFormProps {
    pricePerDay: string;
    minDays: number;
    paymentToken: string;
    onRent: (days: number) => Promise<void>;
    isRenting: boolean;
}

export function RentForm({ pricePerDay, minDays, paymentToken, onRent, isRenting }: RentFormProps) {
    const { isConnected } = useAccount();
    const [days, setDays] = useState(minDays);
    const [isApproved, setIsApproved] = useState(false); // Mock state for now
    const [isApproving, setIsApproving] = useState(false);

    // Mock approval function
    const handleApprove = async () => {
        setIsApproving(true);
        setTimeout(() => {
            setIsApproved(true);
            setIsApproving(false);
        }, 1500);
    };

    const handleRent = async () => {
        await onRent(days);
    };

    const totalCost = (parseFloat(pricePerDay) * days).toFixed(4);

    return (
        <Card className="border-[var(--color-burgundy)]/10">
            <CardHeader>
                <CardTitle>Rent Agent</CardTitle>
                <CardDescription>Minimum lease period is {minDays} days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Days Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (Days)</label>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDays(Math.max(minDays, days - 1))}
                            disabled={days <= minDays}
                        >
                            -
                        </Button>
                        <div className="flex-1 text-center font-mono text-lg border rounded-md py-2">
                            {days}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDays(days + 1)}
                        >
                            +
                        </Button>
                    </div>
                </div>

                {/* Cost Summary */}
                <div className="p-3 bg-[var(--color-paper)]/50 rounded-lg flex justify-between items-center text-sm border">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <span className="font-bold text-[var(--color-burgundy)]">
                        {totalCost} {paymentToken}
                    </span>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                    {!isConnected ? (
                        <Button disabled className="w-full">Connect Wallet to Rent</Button>
                    ) : !isApproved ? (
                        <Button
                            className="w-full"
                            onClick={handleApprove}
                            disabled={isApproving}
                        >
                            {isApproving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Banknote className="w-4 h-4 mr-2" />}
                            Approve {paymentToken}
                        </Button>
                    ) : (
                        <Button
                            className="w-full bg-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)]/90"
                            onClick={handleRent}
                            disabled={isRenting}
                        >
                            {isRenting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            Confirm Rental
                        </Button>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}
