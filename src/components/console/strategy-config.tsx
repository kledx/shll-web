"use client";

import { useState } from "react";
import { Settings, Save, Loader2 } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { toast } from "sonner";

interface StrategyConfigProps {
    tokenId: string;
    /** V3.0: agentType from template — determines which param form to show */
    agentType?: string;
    currentStrategy?: {
        strategyType: string;
        enabled: boolean;
        strategyParams: Record<string, unknown>;
        minIntervalMs: number;
    } | null;
    isInteractive: boolean;
    language?: "en" | "zh";
    onSaved?: () => void;
}

const copy = {
    en: {
        title: "Execution Parameters",
        tokenToBuy: "Token to Buy",
        tokenToSpend: "Token to Spend",
        amountPerExec: "Amount Per Execution",
        routerAddress: "Router Address",
        slippageBps: "Max Slippage (bps)",
        interval: "Execution Interval",
        save: "Save Parameters",
        saving: "Saving...",
        saved: "Parameters saved",
        saveFailed: "Failed to save",
        readOnly: "Read-only mode. Only the current renter can configure parameters.",
        noConfig: "This agent type does not require parameter configuration.",
        intervals: {
            "60000": "1 minute",
            "300000": "5 minutes",
            "900000": "15 minutes",
            "3600000": "1 hour",
            "14400000": "4 hours",
            "86400000": "24 hours",
        },
        addressPlaceholder: "0x...",
        amountPlaceholder: "e.g. 1000000000000000 (wei)",
        slippageHint: "100 = 1%, 50 = 0.5%",
    },
    zh: {
        title: "执行参数",
        tokenToBuy: "买入代币",
        tokenToSpend: "卖出代币",
        amountPerExec: "每次执行数量",
        routerAddress: "路由合约地址",
        slippageBps: "最大滑点 (bps)",
        interval: "执行间隔",
        save: "保存参数",
        saving: "保存中...",
        saved: "参数已保存",
        saveFailed: "保存失败",
        readOnly: "只读模式。只有当前租户可以配置参数。",
        noConfig: "此 Agent 类型不需要参数配置。",
        intervals: {
            "60000": "1 分钟",
            "300000": "5 分钟",
            "900000": "15 分钟",
            "3600000": "1 小时",
            "14400000": "4 小时",
            "86400000": "24 小时",
        },
        addressPlaceholder: "0x...",
        amountPlaceholder: "例如 1000000000000000 (wei)",
        slippageHint: "100 = 1%, 50 = 0.5%",
    },
};

// Agent type labels
const AGENT_TYPE_LABELS: Record<string, string> = {
    dca: "DCA (Dollar-Cost Averaging)",
    hotpump_watchlist: "HotPump Watchlist",
    llm_trader: "LLM Trader",
};

const DEFAULT_ROUTER = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1"; // PancakeSwap V2 Testnet

export function StrategyConfig({
    tokenId,
    agentType,
    currentStrategy,
    isInteractive,
    language = "en",
    onSaved,
}: StrategyConfigProps) {
    const t = copy[language];

    // V3.0: strategy type is determined by template, not user selection
    const strategyType = agentType || currentStrategy?.strategyType || "";
    const isDCA = strategyType === "dca";

    const [tokenToBuy, setTokenToBuy] = useState(
        (currentStrategy?.strategyParams?.tokenToBuy as string) || ""
    );
    const [tokenToSpend, setTokenToSpend] = useState(
        (currentStrategy?.strategyParams?.tokenToSpend as string) || ""
    );
    const [amountPerExecution, setAmountPerExecution] = useState(
        (currentStrategy?.strategyParams?.amountPerExecution as string) || ""
    );
    const [routerAddress, setRouterAddress] = useState(
        (currentStrategy?.strategyParams?.routerAddress as string) || DEFAULT_ROUTER
    );
    const [slippageBps, setSlippageBps] = useState(
        String(currentStrategy?.strategyParams?.slippageBps ?? "100")
    );
    const [minIntervalMs, setMinIntervalMs] = useState(
        String(currentStrategy?.minIntervalMs ?? "3600000")
    );
    const [isSaving, setIsSaving] = useState(false);

    const isValidAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v);

    const handleSave = async () => {
        if (!isInteractive || !strategyType) return;

        const params: Record<string, unknown> = {};
        if (isDCA) {
            if (!isValidAddress(tokenToBuy) || !isValidAddress(tokenToSpend)) {
                toast.error("Invalid token address");
                return;
            }
            if (!amountPerExecution || BigInt(amountPerExecution) <= BigInt(0)) {
                toast.error("Amount must be positive");
                return;
            }
            params.tokenToBuy = tokenToBuy;
            params.tokenToSpend = tokenToSpend;
            params.amountPerExecution = amountPerExecution;
            params.routerAddress = routerAddress;
            params.slippageBps = Number(slippageBps);
        }

        setIsSaving(true);
        try {
            const resp = await fetch("/api/autopilot/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tokenId,
                    strategyType,
                    strategyParams: params,
                    minIntervalMs: Number(minIntervalMs),
                    enabled: true,
                }),
            });
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error((err as Record<string, string>).error || `HTTP ${resp.status}`);
            }
            toast.success(t.saved);
            onSaved?.();
        } catch (err) {
            toast.error(t.saveFailed, {
                description: err instanceof Error ? err.message : "Unknown error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-foreground)]">
                    <Settings className="h-4 w-4 text-[var(--color-primary)]" />
                    {t.title}
                </div>
                {strategyType && (
                    <Chip className="bg-sky-500/10 text-sky-700 border-sky-500/20 text-sm font-bold">
                        {AGENT_TYPE_LABELS[strategyType] ?? strategyType}
                    </Chip>
                )}
            </div>

            {!isInteractive && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                    {t.readOnly}
                </div>
            )}

            {/* DCA Parameters — shown automatically for DCA agents */}
            {isDCA && (
                <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-white/40 p-4">
                    <FieldInput
                        label={t.tokenToBuy}
                        value={tokenToBuy}
                        onChange={setTokenToBuy}
                        placeholder={t.addressPlaceholder}
                        disabled={!isInteractive}
                        isValid={!tokenToBuy || isValidAddress(tokenToBuy)}
                    />
                    <FieldInput
                        label={t.tokenToSpend}
                        value={tokenToSpend}
                        onChange={setTokenToSpend}
                        placeholder={t.addressPlaceholder}
                        disabled={!isInteractive}
                        isValid={!tokenToSpend || isValidAddress(tokenToSpend)}
                    />
                    <FieldInput
                        label={t.amountPerExec}
                        value={amountPerExecution}
                        onChange={setAmountPerExecution}
                        placeholder={t.amountPlaceholder}
                        disabled={!isInteractive}
                    />
                    <FieldInput
                        label={t.routerAddress}
                        value={routerAddress}
                        onChange={setRouterAddress}
                        placeholder={t.addressPlaceholder}
                        disabled={!isInteractive}
                        isValid={!routerAddress || isValidAddress(routerAddress)}
                    />
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--color-foreground)]">
                            {t.slippageBps}
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="10000"
                            value={slippageBps}
                            onChange={(e) => setSlippageBps(e.target.value)}
                            disabled={!isInteractive}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-60"
                        />
                        <p className="text-xs text-[var(--color-muted-foreground)]">{t.slippageHint}</p>
                    </div>
                </div>
            )}

            {/* Unsupported agent type */}
            {strategyType && !isDCA && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-500">
                    {t.noConfig}
                </div>
            )}

            {/* Execution Interval */}
            {strategyType && (
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--color-foreground)]">{t.interval}</label>
                    <select
                        value={minIntervalMs}
                        onChange={(e) => setMinIntervalMs(e.target.value)}
                        disabled={!isInteractive}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-60"
                    >
                        {Object.entries(t.intervals).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Save Button */}
            {isInteractive && strategyType && (
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary)]/90 disabled:opacity-60"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {isSaving ? t.saving : t.save}
                </button>
            )}
        </div>
    );
}

function FieldInput({
    label, value, onChange, placeholder, disabled, isValid = true,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    isValid?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-foreground)]">
                {label}
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full rounded-lg border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 disabled:opacity-60 ${isValid
                    ? "border-[var(--color-border)] bg-white focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    : "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500"
                    }`}
            />
        </div>
    );
}
