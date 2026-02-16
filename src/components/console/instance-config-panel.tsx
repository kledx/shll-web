"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Database, Shield, Activity, AlertTriangle } from "lucide-react";
import { useInstanceConfig, InstanceConfigData } from "@/hooks/useInstanceConfig";
import { formatEther } from "viem";
import type { RunnerAutopilotStatus } from "@/hooks/useAutopilotStatus";

interface InstanceConfigPanelProps {
    tokenId: string;
    runnerStatus?: RunnerAutopilotStatus | null;
    language?: "zh" | "en";
}

/**
 * V1.4 Instance Configuration + Run Intelligence Panel.
 * Shows on-chain instance params (from Indexer) and latest run metadata (from Runner).
 */
export function InstanceConfigPanel({ tokenId, runnerStatus, language = "en" }: InstanceConfigPanelProps) {
    const { data: instanceConfig, isLoading, error } = useInstanceConfig(tokenId);

    const isZh = language === "zh";

    // Extract V1.4 strategy fields from runner status
    const latestRun = runnerStatus?.runs?.[0];
    const hasV14Data = instanceConfig?.found || latestRun?.strategyExplain || latestRun?.failureCategory;

    if (isLoading) {
        return (
            <Card className="border-[var(--color-border)] bg-white/72">
                <CardContent className="flex items-center justify-center py-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
                </CardContent>
            </Card>
        );
    }

    if (!hasV14Data) return null;

    return (
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-50/50 to-white/80">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-600" />
                        <CardTitle className="text-sm font-bold">
                            {isZh ? "实例配置 (V1.4)" : "Instance Config (V1.4)"}
                        </CardTitle>
                    </div>
                    {instanceConfig?.found && (
                        <Chip className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-bold">
                            Policy #{instanceConfig.policyId} v{instanceConfig.version}
                        </Chip>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                {/* Instance Params (from Indexer) */}
                {instanceConfig?.found && (
                    <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                        <ParamRow
                            label={isZh ? "滑点限制" : "Slippage"}
                            value={`${((instanceConfig.slippageBps ?? 0) / 100).toFixed(2)}%`}
                        />
                        <ParamRow
                            label={isZh ? "单笔限额" : "Trade Limit"}
                            value={formatBigValue(instanceConfig.tradeLimit)}
                        />
                        <ParamRow
                            label={isZh ? "每日限额" : "Daily Limit"}
                            value={formatBigValue(instanceConfig.dailyLimit)}
                        />
                        <ParamRow
                            label={isZh ? "风险档位" : "Risk Tier"}
                            value={`Tier ${instanceConfig.riskTier ?? 0}`}
                        />
                        <ParamRow
                            label={isZh ? "Token 组" : "Token Group"}
                            value={`#${instanceConfig.tokenGroupId ?? 0}`}
                        />
                        <ParamRow
                            label={isZh ? "DEX 组" : "DEX Group"}
                            value={`#${instanceConfig.dexGroupId ?? 0}`}
                        />
                    </div>
                )}

                {/* ParamsHash*/}
                {(instanceConfig?.paramsHash || runnerStatus?.paramsHash) && (
                    <div className="rounded-lg bg-slate-100/80 px-3 py-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                            <Shield className="h-3 w-3" />
                            paramsHash
                        </div>
                        <div className="font-mono text-[11px] text-slate-600 break-all mt-1">
                            {instanceConfig?.paramsHash || runnerStatus?.paramsHash}
                        </div>
                    </div>
                )}

                {/* Strategy Explain (from Runner) */}
                {latestRun?.strategyExplain && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                            <Activity className="h-3 w-3" />
                            {isZh ? "策略决策说明" : "Strategy Explanation"}
                        </div>
                        <div className="text-sm text-emerald-800 mt-1">
                            {latestRun.strategyExplain}
                        </div>
                    </div>
                )}

                {/* Failure Category (from Runner) */}
                {latestRun?.failureCategory && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
                            <AlertTriangle className="h-3 w-3" />
                            {isZh ? "失败归因" : "Failure Category"}
                        </div>
                        <div className="font-mono text-sm text-amber-800 mt-1">
                            {latestRun.failureCategory}
                        </div>
                    </div>
                )}

                {/* Strategy ID */}
                {runnerStatus?.strategyId && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-medium">strategyId:</span>
                        <Chip className="bg-violet-500/10 text-violet-600 border-violet-500/20 text-[10px]">
                            {runnerStatus.strategyId}
                        </Chip>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ParamRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] text-slate-500 font-medium">{label}</span>
            <span className="font-mono text-sm font-semibold text-slate-800 truncate">{value}</span>
        </div>
    );
}

function formatBigValue(value?: string) {
    if (!value) return "—";
    try {
        const eth = formatEther(BigInt(value));
        const num = parseFloat(eth);
        if (num > 1000) return `${(num / 1000).toFixed(1)}k`;
        if (num > 0.001) return num.toFixed(4);
        return eth;
    } catch {
        return value.length > 12 ? `${value.slice(0, 8)}...` : value;
    }
}
