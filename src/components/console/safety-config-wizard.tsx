"use client";

/**
 * SafetyConfigWizard — V3.0 Renter Policy Configuration
 *
 * Allows renters to set safety boundaries for their rented agents:
 * - Token whitelist (allowed tokens for swaps)
 * - Spending limits (per trade / per day / slippage)
 * - Frequency control (cooldown + max runs/day)
 * - DEX whitelist (allowed DEX routers)
 *
 * Data flow: Form → /api/safety-config (proxy) → Runner /v3/safety/:tokenId → PostgreSQL
 * Runner checks these rules BEFORE submitting on-chain transactions.
 * On-chain PolicyGuardV4 is the final hard enforcement layer.
 */

import { Card, CardContent } from "@/components/ui/card";
import {
    Shield, ChevronDown, ChevronRight, Loader2, Plus, X, Save,
    RotateCcw, Coins, Timer, ArrowLeftRight, Check, AlertCircle, Ban,
} from "lucide-react";
import { useSafetyConfig, type SafetyConfig } from "@/hooks/useSafetyConfig";
import { useState, useCallback, useEffect, useMemo } from "react";

import { KNOWN_TOKENS as TOKEN_REGISTRY, ROUTER_ADDRESS } from "@/config/tokens";

interface SafetyConfigWizardProps {
    tokenId: string;
    language?: "zh" | "en";
}

// ═══════════════════════════════════════════════════════
//           Well-known tokens & DEXes (chain-aware)
// ═══════════════════════════════════════════════════════

const KNOWN_TOKENS = TOKEN_REGISTRY.map((t) => ({
    address: t.address,
    symbol: t.symbol,
    name: t.name,
}));

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "97");
const isMainnet = chainId === 56;

const KNOWN_DEXES: { address: string; name: string }[] = isMainnet
    ? [
        { address: "0x10ED43C718714eb63d5aA57B78B54704E256024E", name: "PancakeSwap V2" },
        { address: "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4", name: "PancakeSwap V3" },
    ]
    : [
        { address: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1", name: "PancakeSwap V2" },
        { address: "0x1b81D678ffb9C0263b24A97847620C99d213eB14", name: "PancakeSwap V3" },
        { address: "0x3380aE82e39E42Ca34EbEd69aF67fAa0683Bb5c1", name: "BiSwap" },
    ];

// ═══════════════════════════════════════════════════════
//                   Main Component
// ═══════════════════════════════════════════════════════

export function SafetyConfigWizard({ tokenId, language = "en" }: SafetyConfigWizardProps) {
    const isZh = language === "zh";
    const {
        config, isLoading, isDefault, isSaving,
        error, saveError, save, reset, refetch,
    } = useSafetyConfig(tokenId);

    // ── Local editing state ──
    const [draft, setDraft] = useState<Partial<SafetyConfig>>({});
    const [isDirty, setIsDirty] = useState(false);
    const [sections, setSections] = useState({
        tokens: true,
        blocked: false,
        limits: false,
        frequency: false,
        dex: false,
    });
    const [addTokenInput, setAddTokenInput] = useState("");
    const [addBlockedInput, setAddBlockedInput] = useState("");
    const [addDexInput, setAddDexInput] = useState("");
    const [showTokenPicker, setShowTokenPicker] = useState(false);
    const [showBlockedPicker, setShowBlockedPicker] = useState(false);
    const [showDexPicker, setShowDexPicker] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Sync config → draft when loaded
    useEffect(() => {
        if (config && !isDirty) {
            setDraft({
                allowedTokens: [...(config.allowedTokens ?? [])],
                blockedTokens: [...(config.blockedTokens ?? [])],
                maxTradeAmount: config.maxTradeAmount ?? "0",
                maxDailyAmount: config.maxDailyAmount ?? "0",
                maxSlippageBps: config.maxSlippageBps ?? 0,
                cooldownSeconds: config.cooldownSeconds ?? 0,
                maxRunsPerDay: config.maxRunsPerDay ?? 0,
                allowedDexes: [...(config.allowedDexes ?? [])],
            });
        }
    }, [config, isDirty]);

    const updateDraft = useCallback(<K extends keyof SafetyConfig>(key: K, value: SafetyConfig[K]) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
        setIsDirty(true);
        setSaveSuccess(false);
    }, []);

    const handleSave = useCallback(async () => {
        const ok = await save(draft);
        if (ok) {
            setIsDirty(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    }, [save, draft]);

    const handleReset = useCallback(async () => {
        const ok = await reset();
        if (ok) {
            setIsDirty(false);
        }
    }, [reset]);

    const toggleSection = (key: keyof typeof sections) => {
        setSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // ── Token helpers ──
    const allowedTokens = useMemo(() => draft.allowedTokens ?? [], [draft.allowedTokens]);
    const blockedTokens = useMemo(() => draft.blockedTokens ?? [], [draft.blockedTokens]);
    const allowedDexes = useMemo(() => draft.allowedDexes ?? [], [draft.allowedDexes]);

    const resolveTokenSymbol = (addr: string): string => {
        const found = KNOWN_TOKENS.find((t) => t.address.toLowerCase() === addr.toLowerCase());
        return found ? found.symbol : `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const resolveDexName = (addr: string): string => {
        const found = KNOWN_DEXES.find((d) => d.address.toLowerCase() === addr.toLowerCase());
        return found ? found.name : `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const addToken = (address: string) => {
        const normalized = address.trim();
        if (!normalized || allowedTokens.some((t) => t.toLowerCase() === normalized.toLowerCase())) return;
        updateDraft("allowedTokens", [...allowedTokens, normalized]);
        setAddTokenInput("");
        setShowTokenPicker(false);
    };

    const removeToken = (address: string) => {
        updateDraft("allowedTokens", allowedTokens.filter((t) => t.toLowerCase() !== address.toLowerCase()));
    };

    const addBlockedToken = (address: string) => {
        const normalized = address.trim();
        if (!normalized || blockedTokens.some((t) => t.toLowerCase() === normalized.toLowerCase())) return;
        updateDraft("blockedTokens", [...blockedTokens, normalized]);
        setAddBlockedInput("");
        setShowBlockedPicker(false);
    };

    const removeBlockedToken = (address: string) => {
        updateDraft("blockedTokens", blockedTokens.filter((t) => t.toLowerCase() !== address.toLowerCase()));
    };

    const addDex = (address: string) => {
        const normalized = address.trim();
        if (!normalized || allowedDexes.some((d) => d.toLowerCase() === normalized.toLowerCase())) return;
        updateDraft("allowedDexes", [...allowedDexes, normalized]);
        setAddDexInput("");
        setShowDexPicker(false);
    };

    const removeDex = (address: string) => {
        updateDraft("allowedDexes", allowedDexes.filter((d) => d.toLowerCase() !== address.toLowerCase()));
    };

    // ── Loading state ──
    if (isLoading) {
        return (
            <Card className="border-[var(--color-border)] bg-white/72">
                <CardContent className="flex items-center justify-center gap-2 py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    <span className="text-sm text-slate-500">
                        {isZh ? "加载安全配置..." : "Loading safety config..."}
                    </span>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50/50">
                <CardContent className="flex items-center gap-2 py-4">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                    <button onClick={refetch} className="ml-auto text-sm text-red-600 underline">
                        {isZh ? "重试" : "Retry"}
                    </button>
                </CardContent>
            </Card>
        );
    }

    // ── Helper: Slippage in % for display ──
    const slippagePercent = ((draft.maxSlippageBps ?? 0) / 100).toFixed(1);

    return (
        <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-50/30 to-white/80 overflow-hidden">
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-100/60">
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-800">
                        {isZh ? "安全边界配置" : "Safety Boundaries"}
                    </span>
                    {isDefault && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                            {isZh ? "默认" : "Default"}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    {isDirty && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium animate-pulse">
                            {isZh ? "未保存" : "Unsaved"}
                        </span>
                    )}
                    {saveSuccess && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium flex items-center gap-0.5">
                            <Check className="h-3 w-3" />
                            {isZh ? "已保存" : "Saved"}
                        </span>
                    )}
                </div>
            </div>

            <CardContent className="p-0">
                {/* ── Description ── */}
                <div className="px-4 py-2.5 bg-indigo-50/30 border-b border-indigo-100/40">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {isZh
                            ? "设置您租赁 Agent 的安全边界。Agent 的所有操作都会在这些规则范围内执行。"
                            : "Configure safety boundaries for your rented Agent. All agent actions will be constrained by these rules."
                        }
                    </p>
                </div>

                {/* ═══ Section: Token Whitelist ═══ */}
                <SectionHeader
                    icon={<Coins className="h-3.5 w-3.5" />}
                    title={isZh ? "代币白名单" : "Token Whitelist"}
                    subtitle={isZh
                        ? `${allowedTokens.length} 个代币`
                        : `${allowedTokens.length} token${allowedTokens.length !== 1 ? "s" : ""}`
                    }
                    isOpen={sections.tokens}
                    onToggle={() => toggleSection("tokens")}
                />
                {sections.tokens && (
                    <div className="px-4 pb-3 space-y-2">
                        <p className="text-sm text-slate-500">
                            {isZh
                                ? "仅允许 Agent 交易以下代币。留空则不限制。"
                                : "Agent can only trade these tokens. Leave empty for no restriction."}
                        </p>
                        {/* Token chips */}
                        <div className="flex flex-wrap gap-1.5">
                            {allowedTokens.map((addr) => (
                                <span
                                    key={addr}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-800"
                                >
                                    {resolveTokenSymbol(addr)}
                                    <button onClick={() => removeToken(addr)} className="hover:text-red-600 transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                            <button
                                onClick={() => setShowTokenPicker(!showTokenPicker)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-slate-300 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                            >
                                <Plus className="h-3 w-3" />
                                {isZh ? "添加" : "Add"}
                            </button>
                        </div>
                        {/* Token picker */}
                        {showTokenPicker && (
                            <div className="rounded-lg border border-slate-200 bg-white p-2 space-y-1.5">
                                {KNOWN_TOKENS.filter(
                                    (t) => !allowedTokens.some((a) => a.toLowerCase() === t.address.toLowerCase())
                                ).map((token) => (
                                    <button
                                        key={token.address}
                                        onClick={() => addToken(token.address)}
                                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-indigo-50 transition-colors text-left"
                                    >
                                        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[11px] font-bold text-indigo-700">
                                            {token.symbol.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-sm font-semibold text-slate-800">{token.symbol}</span>
                                            <span className="text-sm text-slate-400 ml-1.5">{token.name}</span>
                                        </div>
                                    </button>
                                ))}
                                {/* Custom address input */}
                                <div className="flex gap-1.5 pt-1 border-t border-slate-100">
                                    <input
                                        type="text"
                                        value={addTokenInput}
                                        onChange={(e) => setAddTokenInput(e.target.value)}
                                        placeholder={isZh ? "自定义地址 0x..." : "Custom address 0x..."}
                                        className="flex-1 text-sm border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                                    />
                                    <button
                                        onClick={() => addToken(addTokenInput)}
                                        disabled={!addTokenInput.startsWith("0x") || addTokenInput.length < 42}
                                        className="px-2 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isZh ? "添加" : "Add"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ Section: Token Blacklist ═══ */}
                <SectionHeader
                    icon={<Ban className="h-3.5 w-3.5" />}
                    title={isZh ? "代币黑名单" : "Token Blacklist"}
                    subtitle={isZh
                        ? `${blockedTokens.length} 个代币`
                        : `${blockedTokens.length} token${blockedTokens.length !== 1 ? "s" : ""}`
                    }
                    isOpen={sections.blocked}
                    onToggle={() => toggleSection("blocked")}
                />
                {sections.blocked && (
                    <div className="px-4 pb-3 space-y-2">
                        <p className="text-sm text-slate-500">
                            {isZh
                                ? "禁止 Agent 交易以下代币。留空则不限制。"
                                : "Agent cannot trade these tokens. Leave empty for no restriction."}
                        </p>
                        {/* Blocked token chips */}
                        <div className="flex flex-wrap gap-1.5">
                            {blockedTokens.map((addr) => (
                                <span
                                    key={addr}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-sm font-medium text-red-800"
                                >
                                    {resolveTokenSymbol(addr)}
                                    <button onClick={() => removeBlockedToken(addr)} className="hover:text-red-600 transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                            <button
                                onClick={() => setShowBlockedPicker(!showBlockedPicker)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-slate-300 text-sm text-slate-500 hover:border-red-400 hover:text-red-600 transition-colors"
                            >
                                <Plus className="h-3 w-3" />
                                {isZh ? "添加" : "Add"}
                            </button>
                        </div>
                        {/* Blocked token picker */}
                        {showBlockedPicker && (
                            <div className="rounded-lg border border-slate-200 bg-white p-2 space-y-1.5">
                                {KNOWN_TOKENS.filter(
                                    (t) => !blockedTokens.some((a) => a.toLowerCase() === t.address.toLowerCase())
                                ).map((token) => (
                                    <button
                                        key={token.address}
                                        onClick={() => addBlockedToken(token.address)}
                                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-red-50 transition-colors text-left"
                                    >
                                        <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-[11px] font-bold text-red-700">
                                            {token.symbol.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-sm font-semibold text-slate-800">{token.symbol}</span>
                                            <span className="text-sm text-slate-400 ml-1.5">{token.name}</span>
                                        </div>
                                    </button>
                                ))}
                                {/* Custom address input */}
                                <div className="flex gap-1.5 pt-1 border-t border-slate-100">
                                    <input
                                        type="text"
                                        value={addBlockedInput}
                                        onChange={(e) => setAddBlockedInput(e.target.value)}
                                        placeholder={isZh ? "自定义地址 0x..." : "Custom address 0x..."}
                                        className="flex-1 text-sm border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-300"
                                    />
                                    <button
                                        onClick={() => addBlockedToken(addBlockedInput)}
                                        disabled={!addBlockedInput.startsWith("0x") || addBlockedInput.length < 42}
                                        className="px-2 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isZh ? "添加" : "Add"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ Section: Spending Limits ═══ */}
                <SectionHeader
                    icon={<ArrowLeftRight className="h-3.5 w-3.5" />}
                    title={isZh ? "交易限额" : "Spending Limits"}
                    subtitle={
                        (draft.maxTradeAmount ?? "0") !== "0"
                            ? `${weiToDisplay(draft.maxTradeAmount ?? "0")} BNB/tx`
                            : (isZh ? "未设置" : "Not set")
                    }
                    isOpen={sections.limits}
                    onToggle={() => toggleSection("limits")}
                />
                {sections.limits && (
                    <div className="px-4 pb-3 space-y-3">
                        <LimitInput
                            label={isZh ? "单笔上限 (BNB)" : "Max per trade (BNB)"}
                            value={weiToDisplay(draft.maxTradeAmount ?? "0")}
                            onChange={(v) => updateDraft("maxTradeAmount", displayToWei(v))}
                            hint={isZh ? "每笔交易的最大金额，0 = 不限" : "Max amount per swap, 0 = unlimited"}
                        />
                        <LimitInput
                            label={isZh ? "每日上限 (BNB)" : "Max per day (BNB)"}
                            value={weiToDisplay(draft.maxDailyAmount ?? "0")}
                            onChange={(v) => updateDraft("maxDailyAmount", displayToWei(v))}
                            hint={isZh ? "每日累计交易上限，0 = 不限" : "Daily cumulative limit, 0 = unlimited"}
                        />
                        <LimitInput
                            label={isZh ? "最大滑点 (%)" : "Max slippage (%)"}
                            value={slippagePercent}
                            onChange={(v) => updateDraft("maxSlippageBps", Math.round(parseFloat(v || "0") * 100))}
                            hint={isZh ? "允许的最大滑点百分比，0 = 不限" : "Max allowed slippage %, 0 = unlimited"}
                        />
                    </div>
                )}

                {/* ═══ Section: Frequency ═══ */}
                <SectionHeader
                    icon={<Timer className="h-3.5 w-3.5" />}
                    title={isZh ? "频率控制" : "Frequency Control"}
                    subtitle={
                        (draft.cooldownSeconds ?? 0) > 0
                            ? `${Math.round((draft.cooldownSeconds ?? 0) / 60)}min`
                            : (isZh ? "未设置" : "Not set")
                    }
                    isOpen={sections.frequency}
                    onToggle={() => toggleSection("frequency")}
                />
                {sections.frequency && (
                    <div className="px-4 pb-3 space-y-3">
                        <LimitInput
                            label={isZh ? "冷却间隔 (分钟)" : "Cooldown (minutes)"}
                            value={String(Math.round((draft.cooldownSeconds ?? 0) / 60))}
                            onChange={(v) => updateDraft("cooldownSeconds", Math.round(parseFloat(v || "0") * 60))}
                            hint={isZh ? "两次交易之间的最短间隔，0 = 不限" : "Min interval between trades, 0 = unlimited"}
                        />
                        <LimitInput
                            label={isZh ? "每日最大执行次数" : "Max runs per day"}
                            value={String(draft.maxRunsPerDay ?? 0)}
                            onChange={(v) => updateDraft("maxRunsPerDay", parseInt(v || "0") || 0)}
                            hint={isZh ? "Agent 每天最多执行几次，0 = 不限" : "Max agent executions per day, 0 = unlimited"}
                        />
                    </div>
                )}

                {/* ═══ Section: DEX Whitelist ═══ */}
                <SectionHeader
                    icon={<ArrowLeftRight className="h-3.5 w-3.5" />}
                    title={isZh ? "DEX 白名单" : "DEX Whitelist"}
                    subtitle={isZh
                        ? `${allowedDexes.length} 个交易所`
                        : `${allowedDexes.length} DEX${allowedDexes.length !== 1 ? "es" : ""}`
                    }
                    isOpen={sections.dex}
                    onToggle={() => toggleSection("dex")}
                />
                {sections.dex && (
                    <div className="px-4 pb-3 space-y-2">
                        <p className="text-sm text-slate-500">
                            {isZh
                                ? "仅允许 Agent 在以下交易所执行。留空则不限制。"
                                : "Agent can only trade on these DEXes. Leave empty for no restriction."}
                        </p>
                        <div className="space-y-1">
                            {allowedDexes.map((addr) => (
                                <div
                                    key={addr}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50/50"
                                >
                                    <div className="min-w-0">
                                        <span className="text-sm font-semibold text-slate-800">{resolveDexName(addr)}</span>
                                        <span className="text-sm text-slate-400 ml-2 font-mono">{addr.slice(0, 10)}...</span>
                                    </div>
                                    <button
                                        onClick={() => removeDex(addr)}
                                        className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowDexPicker(!showDexPicker)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-slate-300 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                        >
                            <Plus className="h-3 w-3" />
                            {isZh ? "添加 DEX" : "Add DEX"}
                        </button>
                        {showDexPicker && (
                            <div className="rounded-lg border border-slate-200 bg-white p-2 space-y-1.5">
                                {KNOWN_DEXES.filter(
                                    (d) => !allowedDexes.some((a) => a.toLowerCase() === d.address.toLowerCase())
                                ).map((dex) => (
                                    <button
                                        key={dex.address}
                                        onClick={() => addDex(dex.address)}
                                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-indigo-50 transition-colors text-left"
                                    >
                                        <span className="text-sm font-semibold text-slate-800">{dex.name}</span>
                                        <span className="text-sm text-slate-400 font-mono">{dex.address.slice(0, 10)}...</span>
                                    </button>
                                ))}
                                <div className="flex gap-1.5 pt-1 border-t border-slate-100">
                                    <input
                                        type="text"
                                        value={addDexInput}
                                        onChange={(e) => setAddDexInput(e.target.value)}
                                        placeholder={isZh ? "自定义 DEX 地址 0x..." : "Custom DEX address 0x..."}
                                        className="flex-1 text-sm border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                                    />
                                    <button
                                        onClick={() => addDex(addDexInput)}
                                        disabled={!addDexInput.startsWith("0x") || addDexInput.length < 42}
                                        className="px-2 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isZh ? "添加" : "Add"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ Action Buttons ═══ */}
                {saveError && (
                    <div className="mx-4 mb-2 p-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        {saveError}
                    </div>
                )}
                <div className="flex gap-2 px-4 py-3 border-t border-indigo-100/60 bg-white/40">
                    <button
                        onClick={handleReset}
                        disabled={isSaving || isDefault}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {isZh ? "重置" : "Reset"}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !isDirty}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSaving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Save className="h-3.5 w-3.5" />
                        )}
                        {isSaving ? (isZh ? "保存中..." : "Saving...") : (isZh ? "保存配置" : "Save Config")}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}

// ═══════════════════════════════════════════════════════
//                  Sub-Components
// ═══════════════════════════════════════════════════════

function SectionHeader({
    icon, title, subtitle, isOpen, onToggle,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-indigo-50/40 transition-colors border-t border-indigo-100/40 first:border-t-0"
        >
            {isOpen
                ? <ChevronDown className="h-3.5 w-3.5 text-indigo-500" />
                : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            }
            <span className="text-indigo-600">{icon}</span>
            <span className="text-sm font-semibold text-slate-700 flex-1 text-left">{title}</span>
            <span className="text-sm text-slate-400">{subtitle}</span>
        </button>
    );
}

function LimitInput({
    label, value, onChange, hint,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    hint?: string;
}) {
    return (
        <div>
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <input
                type="text"
                inputMode="decimal"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
            />
            {hint && <p className="text-sm text-slate-400 mt-0.5">{hint}</p>}
        </div>
    );
}

// ═══════════════════════════════════════════════════════
//                  Utility Functions
// ═══════════════════════════════════════════════════════

function weiToDisplay(weiStr: string): string {
    try {
        const ZERO = BigInt(0);
        const DECIMALS = BigInt(10) ** BigInt(18);
        const wei = BigInt(weiStr || "0");
        if (wei === ZERO) return "0";
        const ethPart = wei / DECIMALS;
        const remainder = wei % DECIMALS;
        if (remainder === ZERO) return ethPart.toString();

        // Show up to 4 decimal places
        const fracStr = remainder.toString().padStart(18, "0").slice(0, 4).replace(/0+$/, "");
        return fracStr ? `${ethPart}.${fracStr}` : ethPart.toString();
    } catch {
        return "0";
    }
}

function displayToWei(display: string): string {
    try {
        const num = parseFloat(display || "0");
        if (num <= 0 || isNaN(num)) return "0";
        const DECIMALS = BigInt(10) ** BigInt(18);
        // Convert to wei (18 decimals)
        const [intPart, fracPart = ""] = display.split(".");
        const padded = fracPart.padEnd(18, "0").slice(0, 18);
        return (BigInt(intPart || "0") * DECIMALS + BigInt(padded)).toString();
    } catch {
        return "0";
    }
}
