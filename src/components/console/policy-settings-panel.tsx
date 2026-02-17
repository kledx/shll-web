"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Settings, Shield, Lock, Loader2, ChevronDown } from "lucide-react";
import { useExecutionMode, EXECUTION_MODES, ExecutionModeName } from "@/hooks/useExecutionMode";
import { usePolicy, ParamSchema, InstanceParams } from "@/hooks/usePolicy";
import { useUpdateParams } from "@/hooks/useUpdateParams";
import { useInstanceConfig } from "@/hooks/useInstanceConfig";
import { formatEther, parseEther } from "viem";
import { useState, useEffect, useMemo } from "react";

interface PolicySettingsPanelProps {
    tokenId: string;
    policyId?: number;
    version?: number;
    isInteractive?: boolean;
    language?: "zh" | "en";
}

const MODE_INFO: Record<ExecutionModeName, { label: string; labelZh: string; desc: string; descZh: string; color: string; chipColor: string }> = {
    STRICT: {
        label: "Strict", labelZh: "严格",
        desc: "Full token + DEX whitelist enforcement",
        descZh: "完整白名单检查",
        color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
        chipColor: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    },
    MANUAL: {
        label: "Manual", labelZh: "手动",
        desc: "Skip token whitelist, keep receiver=vault",
        descZh: "跳过 Token 白名单",
        color: "bg-amber-500/10 text-amber-700 border-amber-500/20",
        chipColor: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    },
    EXPLORER: {
        label: "Explorer", labelZh: "探索",
        desc: "Skip token whitelist, lower limits",
        descZh: "跳过白名单，低限额",
        color: "bg-violet-500/10 text-violet-700 border-violet-500/20",
        chipColor: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    },
};

/**
 * Collapsible Policy Settings Panel.
 * Collapsed: shows a compact summary bar with current execution mode.
 * Expanded: full execution mode selector + instance params editor.
 */
export function PolicySettingsPanel({
    tokenId, policyId, version,
    isInteractive = false, language = "en",
}: PolicySettingsPanelProps) {
    const isZh = language === "zh";
    const tokenIdBigInt = useMemo(() => {
        try { return BigInt(tokenId); } catch { return undefined; }
    }, [tokenId]);

    const [isExpanded, setIsExpanded] = useState(false);

    // Read execution mode
    const {
        mode: currentMode,
        modeName: currentModeName,
        isReading: isModeReading,
        setMode,
        isWriting: isModeWriting,
    } = useExecutionMode(tokenIdBigInt);

    // Read schema
    const { schema, isLoading: isSchemaLoading } = usePolicy(policyId, version);

    // Read current params from indexer
    const { data: instanceConfig, refresh: refreshConfig } = useInstanceConfig(tokenId);

    // Write params
    const { updateParams, isLoading: isParamsWriting, isConfirmed: paramsConfirmed } = useUpdateParams();

    // Editing state
    const [editSlippageBps, setEditSlippageBps] = useState("");
    const [editTradeLimit, setEditTradeLimit] = useState("");
    const [editDailyLimit, setEditDailyLimit] = useState("");
    const [editTokenGroupId, setEditTokenGroupId] = useState("");
    const [editDexGroupId, setEditDexGroupId] = useState("");
    const [editRiskTier, setEditRiskTier] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (instanceConfig?.found && !isEditing) {
            setEditSlippageBps(String(instanceConfig.slippageBps ?? 0));
            setEditTradeLimit(safeFormatEther(instanceConfig.tradeLimit));
            setEditDailyLimit(safeFormatEther(instanceConfig.dailyLimit));
            setEditTokenGroupId(String(instanceConfig.tokenGroupId ?? 0));
            setEditDexGroupId(String(instanceConfig.dexGroupId ?? 0));
            setEditRiskTier(String(instanceConfig.riskTier ?? 0));
        }
    }, [instanceConfig, isEditing]);

    useEffect(() => {
        if (paramsConfirmed) {
            setIsEditing(false);
            void refreshConfig();
        }
    }, [paramsConfirmed, refreshConfig]);

    const allowParamsUpdate = schema?.allowParamsUpdate ?? false;
    const allowExplorerMode = schema?.allowExplorerMode ?? false;

    const paramErrors = useMemo(() => {
        if (!schema) return {};
        const errors: Record<string, string> = {};
        const slip = parseInt(editSlippageBps) || 0;
        if (slip > schema.maxSlippageBps)
            errors.slippage = isZh ? `上限 ${schema.maxSlippageBps}` : `Max ${schema.maxSlippageBps}`;
        try {
            const trade = parseEther(editTradeLimit || "0");
            if (trade > schema.maxTradeLimit) errors.tradeLimit = isZh ? "超限" : "Over limit";
        } catch { errors.tradeLimit = "Invalid"; }
        try {
            const daily = parseEther(editDailyLimit || "0");
            if (daily > schema.maxDailyLimit) errors.dailyLimit = isZh ? "超限" : "Over limit";
        } catch { errors.dailyLimit = "Invalid"; }
        const tgId = parseInt(editTokenGroupId) || 0;
        if (schema.allowedTokenGroups.length > 0 && !schema.allowedTokenGroups.includes(tgId))
            errors.tokenGroupId = isZh ? "不在允许列表" : "Not allowed";
        const dgId = parseInt(editDexGroupId) || 0;
        if (schema.allowedDexGroups.length > 0 && !schema.allowedDexGroups.includes(dgId))
            errors.dexGroupId = isZh ? "不在允许列表" : "Not allowed";
        return errors;
    }, [schema, editSlippageBps, editTradeLimit, editDailyLimit, editTokenGroupId, editDexGroupId, isZh]);

    const hasParamErrors = Object.keys(paramErrors).length > 0;

    const handleSaveParams = () => {
        if (!tokenIdBigInt || hasParamErrors) return;
        updateParams(tokenIdBigInt, {
            slippageBps: parseInt(editSlippageBps) || 0,
            tradeLimit: parseEther(editTradeLimit || "0"),
            dailyLimit: parseEther(editDailyLimit || "0"),
            tokenGroupId: parseInt(editTokenGroupId) || 0,
            dexGroupId: parseInt(editDexGroupId) || 0,
            riskTier: parseInt(editRiskTier) || 0,
        });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (instanceConfig?.found) {
            setEditSlippageBps(String(instanceConfig.slippageBps ?? 0));
            setEditTradeLimit(safeFormatEther(instanceConfig.tradeLimit));
            setEditDailyLimit(safeFormatEther(instanceConfig.dailyLimit));
            setEditTokenGroupId(String(instanceConfig.tokenGroupId ?? 0));
            setEditDexGroupId(String(instanceConfig.dexGroupId ?? 0));
            setEditRiskTier(String(instanceConfig.riskTier ?? 0));
        }
    };

    const isLoading = isModeReading || isSchemaLoading;
    const modeInfo = currentModeName ? MODE_INFO[currentModeName] : null;

    if (isLoading) {
        return (
            <Card className="border-[var(--color-border)] bg-white/72">
                <CardContent className="flex items-center justify-center py-4">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
                </CardContent>
            </Card>
        );
    }

    /* ═══ Collapsed: compact summary bar ═══ */
    if (!isExpanded) {
        return (
            <Card
                className="border-[var(--color-border)] bg-white/72 hover:bg-white/90 transition-colors cursor-pointer"
                onClick={() => setIsExpanded(true)}
            >
                <CardContent className="flex items-center justify-between py-3 px-4">
                    <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-semibold text-slate-700">
                            {isZh ? "策略设置" : "Policy Settings"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {modeInfo && (
                            <Chip className={`${modeInfo.chipColor} text-xs font-bold`}>
                                {isZh ? modeInfo.labelZh : modeInfo.label}
                            </Chip>
                        )}
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    /* ═══ Expanded: full settings ═══ */
    return (
        <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-50/30 to-white/80">
            {/* Header — click to collapse */}
            <button
                onClick={() => { setIsExpanded(false); setIsEditing(false); }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50/50 transition-colors rounded-t-xl"
            >
                <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-800">
                        {isZh ? "策略设置" : "Policy Settings"}
                    </span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 rotate-180 transition-transform" />
            </button>

            <CardContent className="space-y-4 text-sm pt-0 pb-4">
                {/* ── Execution Mode ── */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        <Shield className="h-3 w-3" />
                        {isZh ? "执行模式" : "Execution Mode"}
                    </div>
                    <div className="grid gap-1.5">
                        {EXECUTION_MODES.map((name, idx) => {
                            const info = MODE_INFO[name];
                            const isCurrent = currentMode === idx;
                            const isDisabled = !isInteractive || isModeWriting || (name === "EXPLORER" && !allowExplorerMode);
                            return (
                                <button
                                    key={name}
                                    onClick={() => !isDisabled && !isCurrent && setMode(idx)}
                                    disabled={isDisabled}
                                    className={`
                                        relative flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-all
                                        ${isCurrent
                                            ? `${info.color} border-current ring-1 ring-current/20`
                                            : "border-slate-200 bg-white/80 hover:border-slate-300"
                                        }
                                        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                    `}
                                >
                                    <div className={`h-3 w-3 rounded-full border-2 flex-shrink-0
                                        ${isCurrent ? "border-current bg-current" : "border-slate-300"}
                                    `}>
                                        {isCurrent && (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <div className="h-1 w-1 rounded-full bg-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-semibold text-sm">
                                            {isZh ? info.labelZh : info.label}
                                        </span>
                                        <span className="text-xs text-slate-500 truncate">
                                            {isZh ? info.descZh : info.desc}
                                        </span>
                                        {name === "EXPLORER" && !allowExplorerMode && (
                                            <Lock className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                        )}
                                    </div>
                                    {isModeWriting && isCurrent && (
                                        <Loader2 className="absolute right-2 h-3.5 w-3.5 animate-spin text-slate-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <hr className="border-slate-200/80" />

                {/* ── Instance Params ── */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                            <Settings className="h-3 w-3" />
                            {isZh ? "实例参数" : "Instance Params"}
                        </span>
                        {!allowParamsUpdate && (
                            <Chip className="bg-slate-100 text-slate-500 border-slate-200 text-xs">
                                <Lock className="h-3 w-3 mr-0.5" />
                                {isZh ? "锁定" : "Locked"}
                            </Chip>
                        )}
                    </div>

                    {!isEditing ? (
                        <div className="space-y-1">
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                <PRow l={isZh ? "滑点" : "Slip"} v={`${((instanceConfig?.slippageBps ?? 0) / 100).toFixed(1)}%`} />
                                <PRow l={isZh ? "风险" : "Risk"} v={`Tier ${instanceConfig?.riskTier ?? 0}`} />
                                <PRow l={isZh ? "单笔" : "Trade"} v={`${safeFormatEther(instanceConfig?.tradeLimit)}`} />
                                <PRow l={isZh ? "每日" : "Daily"} v={`${safeFormatEther(instanceConfig?.dailyLimit)}`} />
                                <PRow l="Token" v={`#${instanceConfig?.tokenGroupId ?? 0}`} />
                                <PRow l="DEX" v={`#${instanceConfig?.dexGroupId ?? 0}`} />
                            </div>
                            {isInteractive && allowParamsUpdate && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="mt-1.5 w-full rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
                                >
                                    {isZh ? "编辑" : "Edit"}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <ERow l={isZh ? "滑点 (bps)" : "Slippage (bps)"} v={editSlippageBps} set={setEditSlippageBps} err={paramErrors.slippage} />
                            <ERow l={isZh ? "单笔 (BNB)" : "Trade (BNB)"} v={editTradeLimit} set={setEditTradeLimit} err={paramErrors.tradeLimit} />
                            <ERow l={isZh ? "每日 (BNB)" : "Daily (BNB)"} v={editDailyLimit} set={setEditDailyLimit} err={paramErrors.dailyLimit} />
                            <div className="grid grid-cols-2 gap-2">
                                <ERow l="Token Group" v={editTokenGroupId} set={setEditTokenGroupId} err={paramErrors.tokenGroupId} />
                                <ERow l="DEX Group" v={editDexGroupId} set={setEditDexGroupId} err={paramErrors.dexGroupId} />
                            </div>
                            <ERow l={isZh ? "风险等级" : "Risk Tier"} v={editRiskTier} set={setEditRiskTier} />
                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={isParamsWriting}
                                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    {isZh ? "取消" : "Cancel"}
                                </button>
                                <button
                                    onClick={handleSaveParams}
                                    disabled={isParamsWriting || hasParamErrors}
                                    className="flex-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                    {isParamsWriting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    {isZh ? "保存" : "Save"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/* ── Compact row helpers ── */

function PRow({ l, v }: { l: string; v: string }) {
    return (
        <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500">{l}</span>
            <span className="font-mono text-sm font-semibold text-slate-800">{v}</span>
        </div>
    );
}

function ERow({ l, v, set, err }: { l: string; v: string; set: (s: string) => void; err?: string }) {
    return (
        <div>
            <label className="text-xs font-medium text-slate-600">{l}</label>
            <input
                type="text"
                value={v}
                onChange={(e) => set(e.target.value)}
                className={`w-full rounded-md border px-2 py-1 font-mono text-sm mt-0.5
                    ${err ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}
                    focus:outline-none focus:ring-1 focus:ring-indigo-300
                `}
            />
            {err && <div className="text-xs text-red-600 mt-0.5">{err}</div>}
        </div>
    );
}

function safeFormatEther(value?: string | bigint): string {
    if (!value) return "0";
    try {
        const eth = formatEther(BigInt(value));
        const num = parseFloat(eth);
        if (num > 1000) return `${(num / 1000).toFixed(1)}k`;
        if (num > 0.001) return num.toFixed(4);
        return eth;
    } catch {
        return String(value);
    }
}
