"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Shield, Clock, ArrowRightLeft, DollarSign } from "lucide-react";

export interface PolicyRules {
    maxDeadlineWindow: number;
    maxPathLength: number;
    maxSwapAmountIn: string;
    maxApproveAmount: string;
    maxRepayAmount: string;
    allowedTokens: string[];
    allowedSpenders: string[];
}

export function PolicySummary({ rules }: { rules: PolicyRules }) {
    return (
        <Card className="border-[var(--color-burgundy)]/10">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--color-burgundy)]" />
                    <CardTitle className="text-lg">Policy Guard Rules</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">

                {/* Swap Rules */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-medium text-[var(--color-dark-text)]/80">
                        <ArrowRightLeft className="w-4 h-4" /> Swap Limits
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-6">
                        <div className="text-muted-foreground">Max Amount In:</div>
                        <div className="font-mono">{rules.maxSwapAmountIn}</div>
                        <div className="text-muted-foreground">Max Path Length:</div>
                        <div className="font-mono">{rules.maxPathLength} hops</div>
                    </div>
                </div>

                {/* Time Rules */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-medium text-[var(--color-dark-text)]/80">
                        <Clock className="w-4 h-4" /> Time Constraints
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-6">
                        <div className="text-muted-foreground">Deadline Window:</div>
                        <div className="font-mono">{rules.maxDeadlineWindow}s</div>
                    </div>
                </div>

                {/* Allowance Rules */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-medium text-[var(--color-dark-text)]/80">
                        <DollarSign className="w-4 h-4" /> Spend Limits
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-6">
                        <div className="text-muted-foreground">Max Approve:</div>
                        <div className="font-mono">{rules.maxApproveAmount}</div>
                        <div className="text-muted-foreground">Max Repay:</div>
                        <div className="font-mono">{rules.maxRepayAmount}</div>
                    </div>
                </div>

                {/* Whitelists */}
                <div className="pt-2 border-t border-[var(--color-burgundy)]/10">
                    <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Whitelisted Tokens
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {rules.allowedTokens.map((token, i) => (
                            <Chip key={i} variant="outline" className="text-xs bg-white/50">
                                {token.slice(0, 6)}...{token.slice(-4)}
                            </Chip>
                        ))}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
