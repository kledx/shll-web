"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Check, Banknote, ShieldAlert, Settings2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useTranslation } from "@/hooks/useTranslation";
import { ParamSchema, InstanceParams } from "@/hooks/usePolicy";
import { formatEther, parseEther } from "viem";

interface RentFormProps {
    pricePerDay: string;
    minDays: number;
    paymentToken: string;
    onRent: (days: number, params?: InstanceParams) => Promise<void>;
    isRenting: boolean;
    schema?: ParamSchema;
}

export function RentForm({ pricePerDay, minDays, paymentToken, onRent, isRenting, schema }: RentFormProps) {
    const { t, language } = useTranslation();
    const { isConnected } = useAccount();
    const [days, setDays] = useState(minDays);
    const [isApproved, setIsApproved] = useState(false); // Mock state for now
    const [isApproving, setIsApproving] = useState(false);

    // V1.4 Params State
    const [params, setParams] = useState<InstanceParams>({
        slippageBps: 100, // 1% default
        tradeLimit: parseEther("0.1"),
        dailyLimit: parseEther("1"),
        tokenGroupId: 0,
        dexGroupId: 0,
        riskTier: 1,
    });

    // Mock approval function
    const handleApprove = async () => {
        setIsApproving(true);
        setTimeout(() => {
            setIsApproved(true);
            setIsApproving(false);
        }, 1500);
    };

    const handleRent = async () => {
        await onRent(days, schema ? params : undefined);
    };

    const price = parseFloat(pricePerDay) || 0;
    const totalCost = (price * days).toFixed(4);

    const isParamsValid = useMemo(() => {
        if (!schema) return true;
        if (params.slippageBps > schema.maxSlippageBps) return false;
        if (params.tradeLimit > schema.maxTradeLimit) return false;
        if (params.dailyLimit > schema.maxDailyLimit) return false;
        return true;
    }, [params, schema]);

    return (
        <Card className="border-[var(--color-border)] bg-white/72">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{t.agent.rent.title}</CardTitle>
                        <CardDescription>{t.agent.rent.minLease.replace("{days}", minDays.toString())}</CardDescription>
                    </div>
                    {schema && (
                        <div className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-bold text-blue-600 border border-blue-500/20">
                            <Settings2 className="h-3 w-3" />
                            V1.4
                        </div>
                    )}
                </div>
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
                            className="h-11 flex-1 text-center font-mono text-lg"
                            value={days}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) setDays(Math.max(minDays, val));
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

                {/* V1.4 Parameter Inputs */}
                {schema && (
                    <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/15 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-foreground)]">
                            <ShieldAlert className="h-4 w-4 text-orange-500" />
                            {language === 'zh' ? '实例风险参数' : 'Instance Risk Parameters'}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-wider text-[var(--color-muted-foreground)] font-bold">
                                    {language === 'zh' ? '滑点 (BPS)' : 'Slippage (BPS)'}
                                </label>
                                <Input
                                    type="number"
                                    className="h-9 font-mono text-sm"
                                    value={params.slippageBps}
                                    onChange={(e) => setParams({ ...params, slippageBps: parseInt(e.target.value) || 0 })}
                                />
                                <p className="text-[10px] text-[var(--color-muted-foreground)]">MAX: {schema.maxSlippageBps}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-wider text-[var(--color-muted-foreground)] font-bold">
                                    {language === 'zh' ? '单笔交易限制' : 'Trade Limit'}
                                </label>
                                <Input
                                    className="h-9 font-mono text-sm"
                                    value={formatEther(params.tradeLimit)}
                                    onChange={(e) => {
                                        try { setParams({ ...params, tradeLimit: parseEther(e.target.value || "0") }); } catch (e) { }
                                    }}
                                />
                                <p className="text-[10px] text-[var(--color-muted-foreground)]">MAX: {formatEther(schema.maxTradeLimit)}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-wider text-[var(--color-muted-foreground)] font-bold">
                                    {language === 'zh' ? '每日额度' : 'Daily Limit'}
                                </label>
                                <Input
                                    className="h-9 font-mono text-sm"
                                    value={formatEther(params.dailyLimit)}
                                    onChange={(e) => {
                                        try { setParams({ ...params, dailyLimit: parseEther(e.target.value || "0") }); } catch (e) { }
                                    }}
                                />
                                <p className="text-[10px] text-[var(--color-muted-foreground)]">MAX: {formatEther(schema.maxDailyLimit)}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-wider text-[var(--color-muted-foreground)] font-bold">
                                    {language === 'zh' ? '风险等级' : 'Risk Tier'}
                                </label>
                                <select
                                    className="h-9 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
                                    value={params.riskTier}
                                    onChange={(e) => setParams({ ...params, riskTier: parseInt(e.target.value) })}
                                >
                                    <option value={1}>Tier 1 (Safe)</option>
                                    <option value={2}>Tier 2 (Moderate)</option>
                                    <option value={3}>Tier 3 (Aggressive)</option>
                                </select>
                            </div>
                        </div>

                        {(!isParamsValid) && (
                            <p className="text-[11px] text-red-500 font-medium">
                                {language === 'zh' ? '⚠️ 参数超出了策略模板允许的最大限制' : '⚠️ Parameters exceed template maximums'}
                            </p>
                        )}
                    </div>
                )}

                {/* Cost Summary */}
                <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3 text-sm">
                    <span className="text-[var(--color-muted-foreground)]">{t.agent.rent.totalCost}:</span>
                    <span className="font-bold text-[var(--color-primary)]">
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
                            className="w-full"
                            onClick={handleRent}
                            disabled={isRenting || !isParamsValid}
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
