"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExecutionMode, EXECUTION_MODES, ExecutionModeName } from "@/hooks/useExecutionMode";
import { useUpdateParams } from "@/hooks/useUpdateParams";
import { useTokenPermissions } from "@/hooks/useTokenPermissions";
import { usePolicy, InstanceParams, INSTANCE_PARAMS_ABI_TYPES } from "@/hooks/usePolicy";
import { Settings, Shield, Zap, Lock, Unlock } from "lucide-react";
import { useMemo, useState } from "react";
import { decodeAbiParameters, formatEther, parseAbiParameters, parseEther, Hex } from "viem";
import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/config/contracts";

interface AgentSettingsProps {
    tokenId: bigint;
    isRenter: boolean;
    isOwner: boolean;
    v14Params?: {
        policyId: number;
        version: number;
        paramsPacked: Hex;
    };
}

const MODE_COLORS: Record<ExecutionModeName, string> = {
    STRICT: "bg-green-500/10 text-green-700 border-green-500/30",
    MANUAL: "bg-amber-500/10 text-amber-700 border-amber-500/30",
    EXPLORER: "bg-purple-500/10 text-purple-700 border-purple-500/30",
};

const MODE_DESCRIPTIONS_EN: Record<ExecutionModeName, string> = {
    STRICT: "Full policy enforcement — all trades verified against limits and token groups",
    MANUAL: "Owner/renter can bypass token group checks; daily limits still enforced",
    EXPLORER: "Relaxed limits for exploration; capped at explorer-level thresholds",
};

const MODE_DESCRIPTIONS_ZH: Record<ExecutionModeName, string> = {
    STRICT: "完全策略执行 — 所有交易都按限额和 Token 组检查",
    MANUAL: "Owner/Renter 可跳过 Token 组限制，但每日限额仍然执行",
    EXPLORER: "放宽限额探索模式，但受探索级上限约束",
};

export function AgentSettings({ tokenId, isRenter, isOwner, v14Params }: AgentSettingsProps) {
    const { language } = useTranslation();
    const modeDescriptions = language === "zh" ? MODE_DESCRIPTIONS_ZH : MODE_DESCRIPTIONS_EN;

    // Execution Mode
    const { modeName, isReading: isModeReading, setMode, isWriting: isModeWriting } = useExecutionMode(tokenId);

    // Instance Params — read current from V3
    const { data: instanceData } = useReadContract({
        address: CONTRACTS.PolicyGuardV3.address,
        abi: CONTRACTS.PolicyGuardV3.abi,
        functionName: 'getInstanceParams',
        args: [tokenId],
        query: { enabled: true },
    });

    const currentParams = useMemo<InstanceParams | null>(() => {
        if (!instanceData) return null;
        try {
            const [, paramBytes] = instanceData as [unknown, Hex];
            if (!paramBytes || paramBytes === "0x") return null;
            const decoded = decodeAbiParameters(
                parseAbiParameters(INSTANCE_PARAMS_ABI_TYPES),
                paramBytes,
            );
            return {
                slippageBps: Number(decoded[0]),
                tradeLimit: decoded[1] as bigint,
                dailyLimit: decoded[2] as bigint,
                tokenGroupId: Number(decoded[3]),
                dexGroupId: Number(decoded[4]),
                riskTier: Number(decoded[5]),
            };
        } catch {
            return null;
        }
    }, [instanceData]);

    // Policy schema — for allowParamsUpdate check
    const policyId = v14Params?.policyId ?? 1;
    const policyVersion = v14Params?.version ?? 1;
    const { schema } = usePolicy(policyId, policyVersion);
    const canUpdateParams = schema?.allowParamsUpdate ?? false;

    // Token Permissions
    const { permBitmap, hasBit, isReading: isPermReading, grantPermission, revokePermission, isWriting: isPermWriting } = useTokenPermissions(tokenId);

    // Update Params
    const { updateParams, isLoading: isUpdating } = useUpdateParams();

    // Edit state
    const [editSlippage, setEditSlippage] = useState("");
    const [editTradeLimit, setEditTradeLimit] = useState("");
    const [editDailyLimit, setEditDailyLimit] = useState("");

    const canManage = isRenter || isOwner;
    if (!canManage) return null;

    const handleUpdateParams = () => {
        if (!currentParams) return;
        const newParams: InstanceParams = {
            slippageBps: editSlippage ? Math.round(parseFloat(editSlippage) * 100) : currentParams.slippageBps,
            tradeLimit: editTradeLimit ? parseEther(editTradeLimit) : currentParams.tradeLimit,
            dailyLimit: editDailyLimit ? parseEther(editDailyLimit) : currentParams.dailyLimit,
            tokenGroupId: currentParams.tokenGroupId,
            dexGroupId: currentParams.dexGroupId,
            riskTier: currentParams.riskTier,
        };
        updateParams(tokenId, newParams);
    };

    return (
        <Card className="border-[var(--color-border)] bg-white/72">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[var(--color-primary)]" />
                    <CardTitle className="text-lg">
                        {language === "zh" ? "Agent 设置" : "Agent Settings"}
                    </CardTitle>
                    <span className="ml-auto text-sm font-semibold text-[var(--color-muted-foreground)] bg-[var(--color-muted)]/50 px-2 py-0.5 rounded-full">
                        V1.5
                    </span>
                </div>
            </CardHeader>
            <CardContent className="grid gap-5 text-sm">

                {/* ── Execution Mode ─────────────────────── */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-tight text-[var(--color-muted-foreground)]">
                        <Shield className="h-3.5 w-3.5" />
                        {language === "zh" ? "执行模式" : "Execution Mode"}
                    </div>

                    {isModeReading ? (
                        <div className="h-8 animate-pulse rounded-lg bg-[var(--color-muted)]/30" />
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {EXECUTION_MODES.map((name, i) => (
                                <button
                                    key={name}
                                    onClick={() => setMode(i)}
                                    disabled={isModeWriting}
                                    className={`rounded-lg border px-3 py-2 text-center text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 ${modeName === name
                                        ? MODE_COLORS[name] + " ring-2 ring-offset-1"
                                        : "border-[var(--color-border)] bg-white/50 text-[var(--color-muted-foreground)]"
                                        }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    )}

                    {modeName && (
                        <p className="text-sm text-[var(--color-muted-foreground)] italic pl-1">
                            {modeDescriptions[modeName]}
                        </p>
                    )}
                </div>

                {/* ── Mutable Parameters ─────────────────── */}
                {canUpdateParams && currentParams && (
                    <div className="space-y-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-700 uppercase tracking-tight">
                            <Zap className="h-3.5 w-3.5" />
                            {language === "zh" ? "运行时参数调整" : "Runtime Parameter Tuning"}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-sm text-blue-600/70 font-medium">
                                    {language === "zh" ? "最大滑点 (%)" : "Max Slippage (%)"}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder={(currentParams.slippageBps / 100).toFixed(2)}
                                    value={editSlippage}
                                    onChange={(e) => setEditSlippage(e.target.value)}
                                    className="w-full rounded-md border border-blue-500/20 bg-white/80 px-2 py-1.5 text-sm font-mono"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-blue-600/70 font-medium">
                                    {language === "zh" ? "单笔上限 (BNB)" : "Per-Trade Limit (BNB)"}
                                </label>
                                <input
                                    type="text"
                                    placeholder={formatEther(currentParams.tradeLimit)}
                                    value={editTradeLimit}
                                    onChange={(e) => setEditTradeLimit(e.target.value)}
                                    className="w-full rounded-md border border-blue-500/20 bg-white/80 px-2 py-1.5 text-sm font-mono"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-blue-600/70 font-medium">
                                    {language === "zh" ? "每日预算 (BNB)" : "Daily Budget (BNB)"}
                                </label>
                                <input
                                    type="text"
                                    placeholder={formatEther(currentParams.dailyLimit)}
                                    value={editDailyLimit}
                                    onChange={(e) => setEditDailyLimit(e.target.value)}
                                    className="w-full rounded-md border border-blue-500/20 bg-white/80 px-2 py-1.5 text-sm font-mono"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleUpdateParams}
                            disabled={isUpdating || (!editSlippage && !editTradeLimit && !editDailyLimit)}
                            size="sm"
                            className="w-full"
                        >
                            {isUpdating
                                ? (language === "zh" ? "更新中..." : "Updating...")
                                : (language === "zh" ? "更新参数" : "Update Parameters")}
                        </Button>
                    </div>
                )}

                {/* ── Token Permissions ───────────────────── */}
                {isOwner && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-tight text-[var(--color-muted-foreground)]">
                            <Lock className="h-3.5 w-3.5" />
                            {language === "zh" ? "Token 权限位图" : "Token Permission Bitmap"}
                        </div>

                        {isPermReading ? (
                            <div className="h-8 animate-pulse rounded-lg bg-[var(--color-muted)]/30" />
                        ) : (
                            <div className="space-y-2">
                                <div className="font-mono text-sm text-[var(--color-muted-foreground)] bg-[var(--color-muted)]/20 rounded-md px-3 py-2">
                                    {language === "zh" ? "当前位图: " : "Current bitmap: "}
                                    {permBitmap !== undefined ? `0x${permBitmap.toString(16)}` : "N/A"}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isPermWriting}
                                        onClick={() => grantPermission(BigInt(1))}
                                        className="gap-1.5"
                                    >
                                        <Unlock className="h-3.5 w-3.5" />
                                        {language === "zh" ? "授权 Bit 0" : "Grant Bit 0"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isPermWriting}
                                        onClick={() => revokePermission(BigInt(1))}
                                        className="gap-1.5"
                                    >
                                        <Lock className="h-3.5 w-3.5" />
                                        {language === "zh" ? "撤销 Bit 0" : "Revoke Bit 0"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </CardContent>
        </Card>
    );
}
