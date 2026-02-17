"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Settings, Shield, Lock, Loader2, ChevronDown, Check, X, AlertTriangle, Info, Coins } from "lucide-react";
import { useExecutionMode, EXECUTION_MODES, ExecutionModeName } from "@/hooks/useExecutionMode";
import { usePolicy, ParamSchema, InstanceParams } from "@/hooks/usePolicy";
import { useUpdateParams } from "@/hooks/useUpdateParams";
import { useInstanceConfig } from "@/hooks/useInstanceConfig";
import { useTokenPermissions } from "@/hooks/useTokenPermissions";
import { resolveGroupDisplay, resolveGroupName, TOKEN_PERMISSION_SLOTS } from "@/config/policy-groups";
import { formatEther, parseEther } from "viem";
import { useState, useEffect, useMemo } from "react";

interface PolicySettingsPanelProps {
    tokenId: string;
    policyId?: number;
    version?: number;
    isInteractive?: boolean;
    language?: "zh" | "en";
}

interface ModeRule {
    label: string;
    labelZh: string;
    status: "enforced" | "skipped" | "partial";
    note?: string;
    noteZh?: string;
}

interface ModeInfoEntry {
    label: string;
    labelZh: string;
    desc: string;
    descZh: string;
    color: string;
    chipColor: string;
    icon: "shield" | "hand" | "compass";
    rules: ModeRule[];
}

const MODE_INFO: Record<ExecutionModeName, ModeInfoEntry> = {
    STRICT: {
        label: "Strict", labelZh: "严格模式",
        desc: "Maximum protection — only whitelisted tokens/DEX",
        descZh: "最高保护 — 仅白名单内的代币和交易所",
        color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
        chipColor: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
        icon: "shield",
        rules: [
            { label: "Token whitelist", labelZh: "代币白名单", status: "enforced", note: "Only whitelisted tokens", noteZh: "仅白名单代币可交易" },
            { label: "DEX whitelist", labelZh: "DEX 白名单", status: "enforced", note: "Only whitelisted DEX", noteZh: "仅白名单交易所" },
            { label: "Trade limit (per tx)", labelZh: "单笔限额", status: "enforced" },
            { label: "Daily limit", labelZh: "每日限额", status: "enforced" },
            { label: "Receiver = Vault", labelZh: "收款方 = Vault", status: "enforced", note: "Funds stay in agent", noteZh: "资金留在 Agent 内" },
            { label: "Infinite approve", labelZh: "无限授权", status: "enforced", note: "Blocked", noteZh: "已禁止" },
            { label: "Runner / Autopilot", labelZh: "Runner 自动执行", status: "enforced", note: "Allowed", noteZh: "允许" },
        ],
    },
    MANUAL: {
        label: "Manual", labelZh: "手动模式",
        desc: "Owner-only, trade any token freely",
        descZh: "仅限 Owner 操作，可自由交易任意代币",
        color: "bg-amber-500/10 text-amber-700 border-amber-500/20",
        chipColor: "bg-amber-500/10 text-amber-700 border-amber-500/20",
        icon: "hand",
        rules: [
            { label: "Token whitelist", labelZh: "代币白名单", status: "skipped", note: "Any token OK", noteZh: "任意代币均可" },
            { label: "DEX whitelist", labelZh: "DEX 白名单", status: "skipped", note: "Any DEX OK", noteZh: "任意 DEX 均可" },
            { label: "Trade limit (per tx)", labelZh: "单笔限额", status: "enforced" },
            { label: "Daily limit", labelZh: "每日限额", status: "skipped", note: "No daily cap", noteZh: "无每日上限" },
            { label: "Receiver = Vault", labelZh: "收款方 = Vault", status: "enforced", note: "Funds stay in agent", noteZh: "资金留在 Agent 内" },
            { label: "Infinite approve", labelZh: "无限授权", status: "enforced", note: "Blocked", noteZh: "已禁止" },
            { label: "Runner / Autopilot", labelZh: "Runner 自动执行", status: "skipped", note: "Disabled — owner only", noteZh: "已禁用 — 仅 Owner" },
        ],
    },
    EXPLORER: {
        label: "Explorer", labelZh: "探索模式",
        desc: "Trade any token with tighter limits",
        descZh: "可交易任意代币，但使用更低的限额",
        color: "bg-violet-500/10 text-violet-700 border-violet-500/20",
        chipColor: "bg-violet-500/10 text-violet-700 border-violet-500/20",
        icon: "compass",
        rules: [
            { label: "Token whitelist", labelZh: "代币白名单", status: "skipped", note: "Any token OK", noteZh: "任意代币均可" },
            { label: "DEX whitelist", labelZh: "DEX 白名单", status: "enforced", note: "Still checked", noteZh: "仍需白名单 DEX" },
            { label: "Trade limit (per tx)", labelZh: "单笔限额", status: "partial", note: "Lower cap applied", noteZh: "使用更低的限额" },
            { label: "Daily limit", labelZh: "每日限额", status: "partial", note: "Lower cap applied", noteZh: "使用更低的限额" },
            { label: "Receiver = Vault", labelZh: "收款方 = Vault", status: "enforced", note: "Funds stay in agent", noteZh: "资金留在 Agent 内" },
            { label: "Infinite approve", labelZh: "无限授权", status: "enforced", note: "Blocked", noteZh: "已禁止" },
            { label: "Runner / Autopilot", labelZh: "Runner 自动执行", status: "enforced", note: "Allowed", noteZh: "允许" },
        ],
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

    // Token permissions
    const {
        hasBit,
        grantPermission,
        revokePermission,
        isWriting: isPermWriting,
        isReading: isPermReading,
    } = useTokenPermissions(tokenIdBigInt);

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
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">
                                                {isZh ? info.labelZh : info.label}
                                            </span>
                                            {name === "EXPLORER" && !allowExplorerMode && (
                                                <Lock className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500 block mt-0.5">
                                            {isZh ? info.descZh : info.desc}
                                        </span>
                                    </div>
                                    {isModeWriting && isCurrent && (
                                        <Loader2 className="absolute right-2 h-3.5 w-3.5 animate-spin text-slate-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Details for selected mode */}
                    {modeInfo && (
                        <ModeDetails rules={modeInfo.rules} isZh={isZh} schema={schema} />
                    )}
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
                                <PRow l={isZh ? "单笔" : "Trade"} v={`${safeFormatEther(instanceConfig?.tradeLimit)} BNB`} />
                                <PRow l={isZh ? "每日" : "Daily"} v={`${safeFormatEther(instanceConfig?.dailyLimit)} BNB`} />
                                <PRow
                                    l={isZh ? "代币" : "Token"}
                                    v={resolveGroupDisplay(instanceConfig?.tokenGroupId, language)}
                                />
                                <PRow
                                    l="DEX"
                                    v={resolveGroupDisplay(instanceConfig?.dexGroupId, language)}
                                />
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

                <hr className="border-slate-200/80" />

                {/* ── Token Permissions ── */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        <Coins className="h-3 w-3" />
                        {isZh ? "代币交易权限" : "Token Permissions"}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        {isZh
                            ? "选择允许您的 Agent 交易的代币。开启后 Agent 可以自动交易该代币。"
                            : "Choose which tokens your Agent is allowed to trade. Enabled tokens can be auto-traded by the Runner."}
                    </p>
                    <div className="space-y-1">
                        {TOKEN_PERMISSION_SLOTS.map((slot) => {
                            const enabled = hasBit(slot.bit);
                            const isToggling = isPermWriting;
                            return (
                                <div
                                    key={slot.bit}
                                    className={`
                                        flex items-center justify-between rounded-lg border px-3 py-2 transition-all
                                        ${enabled
                                            ? "border-emerald-200 bg-emerald-50/50"
                                            : "border-slate-200 bg-white/80"
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={`
                                            h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold
                                            ${enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}
                                        `}>
                                            {slot.symbol.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-sm font-semibold text-slate-700 block">{slot.symbol}</span>
                                            <span className="text-xs text-slate-400 truncate block">
                                                {isZh ? slot.nameZh : slot.name}
                                            </span>
                                        </div>
                                    </div>
                                    {isInteractive ? (
                                        <button
                                            onClick={() => {
                                                const bitMask = BigInt(1) << BigInt(slot.bit);
                                                if (enabled) {
                                                    revokePermission(bitMask);
                                                } else {
                                                    grantPermission(bitMask);
                                                }
                                            }}
                                            disabled={isToggling}
                                            className={`
                                                relative h-6 w-11 rounded-full transition-colors duration-200 flex-shrink-0
                                                ${enabled ? "bg-emerald-500" : "bg-slate-300"}
                                                ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                            `}
                                        >
                                            <span className={`
                                                absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200
                                                ${enabled ? "translate-x-5" : "translate-x-0.5"}
                                            `} />
                                            {isToggling && (
                                                <Loader2 className="absolute inset-0 m-auto h-3 w-3 animate-spin text-white" />
                                            )}
                                        </button>
                                    ) : (
                                        <Chip className={`text-xs ${enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                            {enabled ? (isZh ? "已开启" : "On") : (isZh ? "已关闭" : "Off")}
                                        </Chip>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/* ── Mode details: per-rule breakdown ── */

function ModeDetails({ rules, isZh, schema }: { rules: ModeRule[]; isZh: boolean; schema?: ParamSchema }) {
    return (
        <div className="rounded-lg border border-slate-200/80 bg-white/60 overflow-hidden">
            <div className="px-3 py-1.5 bg-slate-50/80 border-b border-slate-200/60">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {isZh ? "规则详情" : "Rule Details"}
                </span>
            </div>
            <div className="divide-y divide-slate-100">
                {rules.map((rule, i) => {
                    const icon = rule.status === "enforced"
                        ? <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                        : rule.status === "skipped"
                            ? <X className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                            : <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />;
                    const statusLabel = rule.status === "enforced"
                        ? (isZh ? "已启用" : "On")
                        : rule.status === "skipped"
                            ? (isZh ? "已关闭" : "Off")
                            : (isZh ? "受限" : "Limited");
                    const statusColor = rule.status === "enforced"
                        ? "text-emerald-700 bg-emerald-50"
                        : rule.status === "skipped"
                            ? "text-red-600 bg-red-50"
                            : "text-amber-700 bg-amber-50";
                    return (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50/50 transition-colors">
                            {icon}
                            <span className="text-sm text-slate-700 flex-1 min-w-0">
                                {isZh ? rule.labelZh : rule.label}
                            </span>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${statusColor}`}>
                                {statusLabel}
                            </span>
                            {(isZh ? rule.noteZh : rule.note) && (
                                <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-[140px]">
                                    {isZh ? rule.noteZh : rule.note}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            {schema && (
                <div className="px-3 py-1.5 bg-slate-50/60 border-t border-slate-200/60">
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                        {schema.explorerMaxTradeLimit > BigInt(0) && (
                            <span>{isZh ? "探索单笔上限" : "Explorer trade cap"}: {safeFormatEther(schema.explorerMaxTradeLimit)} BNB</span>
                        )}
                        {schema.explorerMaxDailyLimit > BigInt(0) && (
                            <span>{isZh ? "探索每日上限" : "Explorer daily cap"}: {safeFormatEther(schema.explorerMaxDailyLimit)} BNB</span>
                        )}
                    </div>
                </div>
            )}
        </div>
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
