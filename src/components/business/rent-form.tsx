"use client";

import { useState, useMemo } from "react";
import { useEffect } from "react";
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
    enableInstanceParams?: boolean;
    initialParams?: Partial<InstanceParams>;
}

export function RentForm({
    pricePerDay,
    minDays,
    paymentToken,
    onRent,
    isRenting,
    schema,
    enableInstanceParams = false,
    initialParams,
}: RentFormProps) {
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
        tokenGroupId: 100,
        dexGroupId: 200,
        riskTier: 1,
    });

    useEffect(() => {
        if (!initialParams) return;
        setParams((prev) => ({
            ...prev,
            ...initialParams,
        }));
    }, [initialParams]);

    // Mock approval function
    const handleApprove = async () => {
        setIsApproving(true);
        setTimeout(() => {
            setIsApproved(true);
            setIsApproving(false);
        }, 1500);
    };

    const handleRent = async () => {
        await onRent(days, enableInstanceParams ? params : undefined);
    };

    const price = parseFloat(pricePerDay) || 0;
    const totalCost = (price * days).toFixed(4);

    const isParamsValid = useMemo(() => {
        if (!enableInstanceParams || !schema) return true;
        if (params.slippageBps > schema.maxSlippageBps) return false;
        if (params.tradeLimit > schema.maxTradeLimit) return false;
        if (params.dailyLimit > schema.maxDailyLimit) return false;
        return true;
    }, [params, schema, enableInstanceParams]);

    return (
        <Card className="border-[var(--color-border)] bg-white/72">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{t.agent.rent.title}</CardTitle>
                        <CardDescription>{t.agent.rent.minLease.replace("{days}", minDays.toString())}</CardDescription>
                    </div>
                    {enableInstanceParams && (
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

                {/* Instance Risk Parameters */}
                {schema && (
                    <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/15 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-foreground)]">
                            <ShieldAlert className="h-4 w-4 text-orange-500" />
                            {language === 'zh' ? '安全防护参数' : 'Security Parameters'}
                        </div>
                        <p className="text-sm text-[var(--color-muted-foreground)] -mt-2">
                            {language === 'zh'
                                ? '以下参数限制 Agent 的链上交易行为，保护你的资金安全'
                                : 'These parameters limit what the Agent can do on-chain to protect your funds'}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Slippage - now uses percentage input */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[var(--color-muted-foreground)]">
                                    {language === 'zh' ? '最大滑点 (%)' : 'Max Slippage (%)'}
                                </label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    className="h-9 font-mono text-sm"
                                    value={(params.slippageBps / 100).toFixed(2)}
                                    onChange={(e) => {
                                        const pct = parseFloat(e.target.value) || 0;
                                        setParams({ ...params, slippageBps: Math.round(pct * 100) });
                                    }}
                                />
                                <p className="text-sm text-[var(--color-muted-foreground)]">
                                    {language === 'zh'
                                        ? `Swap 价格偏差上限，最大 ${(schema.maxSlippageBps / 100).toFixed(1)}%`
                                        : `Max price deviation for swaps, up to ${(schema.maxSlippageBps / 100).toFixed(1)}%`}
                                </p>
                            </div>

                            {/* Trade Limit */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[var(--color-muted-foreground)]">
                                    {language === 'zh' ? '单笔上限 (BNB)' : 'Per-Trade Limit (BNB)'}
                                </label>
                                <Input
                                    className="h-9 font-mono text-sm"
                                    value={formatEther(params.tradeLimit)}
                                    onChange={(e) => {
                                        try { setParams({ ...params, tradeLimit: parseEther(e.target.value || "0") }); } catch (e) { }
                                    }}
                                />
                                <p className="text-sm text-[var(--color-muted-foreground)]">
                                    {language === 'zh'
                                        ? `Agent 每次 Swap 最多投入的金额，上限 ${formatEther(schema.maxTradeLimit)} BNB`
                                        : `Max amount per swap, up to ${formatEther(schema.maxTradeLimit)} BNB`}
                                </p>
                            </div>

                            {/* Daily Budget */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[var(--color-muted-foreground)]">
                                    {language === 'zh' ? '每日预算 (BNB)' : 'Daily Budget (BNB)'}
                                </label>
                                <Input
                                    className="h-9 font-mono text-sm"
                                    value={formatEther(params.dailyLimit)}
                                    onChange={(e) => {
                                        try { setParams({ ...params, dailyLimit: parseEther(e.target.value || "0") }); } catch (e) { }
                                    }}
                                />
                                <p className="text-sm text-[var(--color-muted-foreground)]">
                                    {language === 'zh'
                                        ? `Agent 当日累计交易上限，每天 UTC 0 点重置，上限 ${formatEther(schema.maxDailyLimit)} BNB`
                                        : `Total daily trading cap, resets at UTC midnight, up to ${formatEther(schema.maxDailyLimit)} BNB`}
                                </p>
                            </div>

                            {/* Risk Tier */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[var(--color-muted-foreground)]">
                                    {language === 'zh' ? '风险偏好' : 'Risk Preference'}
                                </label>
                                <select
                                    className="h-9 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
                                    value={params.riskTier}
                                    onChange={(e) => setParams({ ...params, riskTier: parseInt(e.target.value) })}
                                >
                                    <option value={1}>{language === 'zh' ? '稳健 (Tier 1)' : 'Conservative (Tier 1)'}</option>
                                    <option value={2}>{language === 'zh' ? '均衡 (Tier 2)' : 'Balanced (Tier 2)'}</option>
                                    <option value={3}>{language === 'zh' ? '积极 (Tier 3)' : 'Aggressive (Tier 3)'}</option>
                                </select>
                                <p className="text-sm text-[var(--color-muted-foreground)]">
                                    {language === 'zh'
                                        ? 'Runner 策略决策时参考的风险偏好'
                                        : 'Risk appetite used by Runner strategy decisions'}
                                </p>
                            </div>
                        </div>

                        {(!isParamsValid) && (
                            <p className="text-sm text-red-500 font-medium">
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
