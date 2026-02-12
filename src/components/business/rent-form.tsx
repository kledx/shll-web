"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Check, Banknote } from "lucide-react";
import { useConnection } from "wagmi";
import { useTranslation } from "@/hooks/useTranslation";

interface RentFormProps {
    pricePerDay: string;
    minDays: number;
    paymentToken: string;
    onRent: (days: number) => Promise<void>;
    isRenting: boolean;
}

export function RentForm({ pricePerDay, minDays, paymentToken, onRent, isRenting }: RentFormProps) {
    const { t } = useTranslation();
    const { isConnected } = useConnection();
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

    const price = parseFloat(pricePerDay) || 0;
    const totalCost = (price * days).toFixed(4);

    return (
        <Card className="border-[var(--color-burgundy)]/10">
            <CardHeader>
                <CardTitle>{t.agent.rent.title}</CardTitle>
                <CardDescription>{t.agent.rent.minLease.replace("{days}", minDays.toString())}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Days Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t.agent.rent.duration}</label>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDays(Math.max(minDays, days - 1))}
                            disabled={days <= minDays}
                        >
                            -
                        </Button>
                        <Input
                            type="number"
                            className="flex-1 text-center font-mono text-lg h-auto py-2"
                            value={days}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) setDays(val);
                            }}
                            min={minDays}
                        />
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
                    <span className="text-muted-foreground">{t.agent.rent.totalCost}:</span>
                    <span className="font-bold text-[var(--color-burgundy)]">
                        {totalCost} {paymentToken}
                    </span>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                    {!isConnected ? (
                        <Button disabled className="w-full">{t.agent.rent.connect}</Button>
                    ) : (paymentToken !== 'BNB' && !isApproved) ? (
                        <Button
                            className="w-full"
                            onClick={handleApprove}
                            disabled={isApproving}
                        >
                            {isApproving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Banknote className="w-4 h-4 mr-2" />}
                            {t.agent.rent.approve.replace("{token}", paymentToken)}
                        </Button>
                    ) : (
                        <Button
                            className="w-full bg-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)]/90"
                            onClick={handleRent}
                            disabled={isRenting}
                        >
                            {isRenting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            {t.agent.rent.confirm}
                        </Button>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}
