"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
    Settings, Save, Loader2, BrainCircuit, Send, Clock, CheckCircle2,
    PauseCircle, ShieldAlert, XCircle, Target, Bot, X,
} from "lucide-react";
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
        updatedAt?: string;
    } | null;
    isInteractive: boolean;
    language?: "en" | "zh";
    onSaved?: () => void;
    /** P-2026-018: Auto-enable autopilot after sending instruction */
    onAutoEnable?: () => Promise<void>;
}

interface GoalHistoryItem {
    text: string;
    savedAt: string; // ISO string
}

interface ActivityRecord {
    id: string;
    intentType?: string;
    decisionReason?: string;
    txHash?: string;
    error?: string;
    simulateOk: boolean;
    createdAt: string;
}

type DecisionKind = "wait" | "action" | "blocked" | "error";

function classifyDecision(item: ActivityRecord): DecisionKind {
    if (item.error) return item.intentType === "error" ? "error" : "blocked";
    if (item.intentType === "wait") return "wait";
    if (item.txHash) return "action";
    if (!item.simulateOk) return "blocked";
    return "wait";
}

// Unified timeline entry — either a user instruction or an agent response
type TimelineEntry =
    | { kind: "user"; text: string; ts: number; isActive: boolean }
    | { kind: "agent"; record: ActivityRecord; ts: number; decision: DecisionKind };

const copy = {
    en: {
        title: "Strategy Configuration",
        tokenToBuy: "Token to Buy",
        tokenToSpend: "Token to Spend",
        amountPerExec: "Amount Per Execution",
        routerAddress: "Router Address",
        slippageBps: "Max Slippage (bps)",

        agentInstructions: "Agent Instructions",
        inputPlaceholder: "Tell your agent what to do...",
        inputHint: "e.g. \"Buy WBNB when price drops 5%, sell when up 10%. Max 0.5 BNB.\"",
        activeGoal: "Active",
        previousGoal: "Previous",
        cancelGoal: "Cancel instruction",
        cancelling: "Cancelling...",
        cancelSuccess: "Instruction cancelled — agent is on standby",
        cancelFailed: "Failed to cancel instruction",
        noGoalYet: "No instructions yet. Send a message to tell your agent what to do.",
        sending: "Saving...",

        save: "Save & Activate",
        saving: "Saving...",
        saved: "Strategy saved",
        instructionSaved: "Instruction sent to agent",
        saveFailed: "Failed to save",
        readOnly: "Read-only mode. Only the current renter can configure parameters.",
        configured: "Configured",
        notConfigured: "Not configured",

        addressPlaceholder: "0x...",
        amountPlaceholder: "e.g. 1000000000000000 (wei)",
        slippageHint: "100 = 1%, 50 = 0.5%",
        autoEnableOk: "Autopilot enabled automatically",
        autoEnableFailed: "Instruction saved. Please enable Autopilot manually to start the agent.",
        autoEnableSignHint: "Authorizing agent to execute — please sign in your wallet.",
    },
    zh: {
        title: "策略配置",
        tokenToBuy: "买入代币",
        tokenToSpend: "卖出代币",
        amountPerExec: "每次执行数量",
        routerAddress: "路由合约地址",
        slippageBps: "最大滑点 (bps)",

        agentInstructions: "Agent 指令",
        inputPlaceholder: "告诉你的 Agent 该做什么...",
        inputHint: "例如：\"当 WBNB 下跌 5% 时买入，上涨 10% 时卖出。最大仓位 0.5 BNB。\"",
        activeGoal: "当前",
        previousGoal: "历史",
        cancelGoal: "取消指令",
        cancelling: "取消中...",
        cancelSuccess: "指令已取消 — Agent 进入待命",
        cancelFailed: "取消指令失败",
        noGoalYet: "暂无指令。发送消息告诉你的 Agent 该做什么。",
        sending: "保存中...",

        save: "保存并激活",
        saving: "保存中...",
        saved: "策略已保存",
        instructionSaved: "指令已发送给 Agent",
        saveFailed: "保存失败",
        readOnly: "只读模式。只有当前租户可以配置参数。",
        configured: "已配置",
        notConfigured: "未配置",

        addressPlaceholder: "0x...",
        amountPlaceholder: "例如 1000000000000000 (wei)",
        slippageHint: "100 = 1%, 50 = 0.5%",
        autoEnableOk: "Autopilot 已自动启用",
        autoEnableFailed: "指令已保存。请手动启用 Autopilot 以启动 Agent。",
        autoEnableSignHint: "正在授权 Agent 执行操作 — 请在钱包中确认签名。",
    },
};

// Agent type labels
const AGENT_TYPE_LABELS: Record<string, string> = {
    dca: "DCA (Dollar-Cost Averaging)",
    llm_trader: "LLM Trader",
    llm_defi: "LLM DeFi",
    hot_token: "Hot Token",
};

const DEFAULT_ROUTER = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1"; // PancakeSwap V2 Testnet

// Agent types that use LLM brain
const LLM_AGENT_TYPES = new Set(["llm_trader", "llm_defi"]);

// Format relative time
function formatRelative(iso: string, lang: "en" | "zh"): string {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 0) return lang === "zh" ? "刚刚" : "just now";
    if (diff < 60_000) return lang === "zh" ? "刚刚" : "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ${lang === "zh" ? "前" : "ago"}`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ${lang === "zh" ? "前" : "ago"}`;
    return `${Math.floor(diff / 86_400_000)}d ${lang === "zh" ? "前" : "ago"}`;
}

export function StrategyConfig({
    tokenId,
    agentType,
    currentStrategy,
    isInteractive,
    language = "en",
    onSaved,
    onAutoEnable,
}: StrategyConfigProps) {
    const t = copy[language];

    // V3.0: strategy type is determined by template, not user selection
    const strategyType = agentType || currentStrategy?.strategyType || "";
    const isDCA = strategyType === "dca";
    const isLLM = LLM_AGENT_TYPES.has(strategyType);
    const isConfigured = !!currentStrategy;

    // DCA fields
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

    // LLM chat state
    const currentGoal = (currentStrategy?.strategyParams?.tradingGoal as string) || "";
    const goalHistory = (currentStrategy?.strategyParams?.goalHistory as GoalHistoryItem[]) || [];
    const [inputText, setInputText] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [activities, setActivities] = useState<ActivityRecord[]>([]);
    const [isCancelling, setIsCancelling] = useState(false);

    // Fetch agent activity for LLM chat view
    useEffect(() => {
        if (!isLLM) return;
        let cancelled = false;
        const load = async () => {
            try {
                const params = new URLSearchParams({ tokenId, limit: "15" });
                const res = await fetch(`/api/agent/activity?${params.toString()}`, { cache: "no-store" });
                if (!res.ok || cancelled) return;
                const data = await res.json();
                if (!cancelled) setActivities((data.items as ActivityRecord[]) ?? []);
            } catch { /* silent */ }
        };
        void load();
        const timer = setInterval(() => void load(), 15_000);
        return () => { cancelled = true; clearInterval(timer); };
    }, [isLLM, tokenId]);

    // Build unified timeline: merge user instructions + agent responses, sorted by time
    const timeline = useMemo<TimelineEntry[]>(() => {
        if (!isLLM) return [];
        const entries: TimelineEntry[] = [];

        // User instruction history (previous goals)
        for (const h of goalHistory) {
            entries.push({ kind: "user", text: h.text, ts: new Date(h.savedAt).getTime(), isActive: false });
        }
        // Current active goal — use goalSetAt (stable) from strategyParams
        if (currentGoal) {
            const goalSetAt = currentStrategy?.strategyParams?.goalSetAt;
            const goalTs = goalSetAt
                ? new Date(goalSetAt as string).getTime()
                : currentStrategy?.updatedAt
                    ? new Date(currentStrategy.updatedAt).getTime()
                    : Date.now();
            entries.push({ kind: "user", text: currentGoal, ts: goalTs, isActive: true });
        }

        // Agent activity responses (only those with reasoning)
        for (const a of activities) {
            if (a.decisionReason) {
                entries.push({ kind: "agent", record: a, ts: new Date(a.createdAt).getTime(), decision: classifyDecision(a) });
            }
        }

        // Sort chronologically
        entries.sort((a, b) => a.ts - b.ts);
        return entries;
    }, [isLLM, goalHistory, currentGoal, activities]);

    // Auto-scroll to bottom when timeline changes
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [timeline.length]);

    // Auto-resize textarea
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);
        // Auto-resize
        e.target.style.height = "auto";
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    }, []);

    const isValidAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v);

    // DCA save handler
    const handleSaveDCA = async () => {
        if (!isInteractive || !strategyType) return;
        const params: Record<string, unknown> = {};
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

        setIsSaving(true);
        try {
            const resp = await fetch("/api/strategy/upsert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tokenId,
                    strategyType,
                    strategyParams: params,
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

    // LLM chat send handler
    const handleSendInstruction = async () => {
        const text = inputText.trim();
        if (!text || !isInteractive || isSaving) return;

        // Build new history: push current goal to history, set new one
        const newHistory: GoalHistoryItem[] = [...goalHistory];
        if (currentGoal) {
            newHistory.push({
                text: currentGoal,
                savedAt: new Date().toISOString(),
            });
            // Keep only last 10 history items
            while (newHistory.length > 10) newHistory.shift();
        }

        setIsSaving(true);
        try {
            const resp = await fetch("/api/strategy/upsert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tokenId,
                    strategyType,
                    strategyParams: {
                        tradingGoal: text,
                        goalSetAt: new Date().toISOString(),
                        goalHistory: newHistory,
                    },
                    enabled: true,
                }),
            });
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error((err as Record<string, string>).error || `HTTP ${resp.status}`);
            }
            toast.success(t.instructionSaved);
            setInputText("");
            if (inputRef.current) {
                inputRef.current.style.height = "auto";
            }
            onSaved?.();

            // P-2026-018: Auto-enable autopilot after instruction saved
            // handleEnableAutopilot shows its own success toast
            if (onAutoEnable) {
                try {
                    toast.info(t.autoEnableSignHint);
                    await onAutoEnable();
                } catch {
                    // Non-fatal: instruction saved, autopilot enable failed
                    toast.warning(t.autoEnableFailed);
                }
            }
        } catch (err) {
            toast.error(t.saveFailed, {
                description: err instanceof Error ? err.message : "Unknown error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Handle Ctrl+Enter / Cmd+Enter to send
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            void handleSendInstruction();
        }
    };

    // Cancel current instruction — put agent in standby
    const handleCancelGoal = async () => {
        if (!isInteractive || isCancelling) return;
        setIsCancelling(true);
        try {
            const resp = await fetch("/api/strategy/clear-goal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tokenId }),
            });
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error((err as Record<string, string>).error || `HTTP ${resp.status}`);
            }
            toast.success(t.cancelSuccess);
            onSaved?.();
        } catch (err) {
            toast.error(t.cancelFailed, {
                description: err instanceof Error ? err.message : "Unknown error",
            });
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-foreground)]">
                    <Settings className="h-4 w-4 text-[var(--color-primary)]" />
                    {t.title}
                </div>
                <div className="flex items-center gap-2">
                    {isConfigured ? (
                        <Chip className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-sm font-bold">
                            {t.configured}
                        </Chip>
                    ) : (
                        <Chip className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-sm font-bold">
                            {t.notConfigured}
                        </Chip>
                    )}
                    {strategyType && (
                        <Chip className="bg-sky-500/10 text-sky-700 border-sky-500/20 text-sm font-bold">
                            {AGENT_TYPE_LABELS[strategyType] ?? strategyType}
                        </Chip>
                    )}
                </div>
            </div>

            {!isInteractive && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                    {t.readOnly}
                </div>
            )}

            {/* DCA Parameters — form-based */}
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

            {/* LLM Agent — Chat-style Goal Configuration */}
            {isLLM && (
                <div className="rounded-xl border border-[var(--color-border)] bg-gradient-to-b from-slate-50/80 to-white/60 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-white/60">
                        <BrainCircuit className="h-4 w-4 text-violet-500" />
                        <span className="text-sm font-medium text-[var(--color-foreground)]">
                            {t.agentInstructions}
                        </span>
                    </div>

                    {/* Message area — unified timeline */}
                    <div
                        ref={scrollRef}
                        className="px-4 py-3 space-y-3 max-h-[380px] overflow-y-auto min-h-[100px]"
                    >
                        {/* Empty state */}
                        {timeline.length === 0 && (
                            <div className="flex items-center justify-center h-20 text-sm text-[var(--color-muted-foreground)]">
                                {t.noGoalYet}
                            </div>
                        )}

                        {timeline.map((entry, idx) => {
                            if (entry.kind === "user") {
                                // User instruction — right-aligned
                                return (
                                    <div key={`u-${idx}`} className="flex justify-end">
                                        <div className="max-w-[85%] space-y-1">
                                            <div className={`rounded-2xl rounded-tr-md px-4 py-2.5 text-sm leading-relaxed ${entry.isActive
                                                ? "bg-violet-50 border border-violet-200 text-violet-900"
                                                : "bg-slate-100 text-slate-600"
                                                }`}>
                                                {entry.text}
                                            </div>
                                            <div className="flex items-center justify-end gap-1.5 px-1">
                                                {entry.isActive ? (
                                                    <>
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                        <span className="text-xs font-medium text-emerald-600">
                                                            {t.activeGoal}
                                                        </span>
                                                        {isInteractive && (
                                                            <button
                                                                type="button"
                                                                onClick={() => void handleCancelGoal()}
                                                                disabled={isCancelling}
                                                                className="ml-1 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-40"
                                                                title={t.cancelGoal}
                                                            >
                                                                {isCancelling ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <X className="h-3 w-3" />
                                                                )}
                                                                {isCancelling ? t.cancelling : t.cancelGoal}
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="h-3 w-3 text-slate-400" />
                                                        <span className="text-xs text-slate-400">
                                                            {formatRelative(new Date(entry.ts).toISOString(), language)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // Agent response — left-aligned
                            const a = entry.record;
                            const d = entry.decision;
                            // If this is the most recent "wait" entry and goal is cleared → task completed
                            const isCompleted = d === "wait" && idx === timeline.length - 1 && !currentGoal;
                            const decisionStyles = {
                                action: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />, label: language === "zh" ? "已执行" : "Executed" },
                                wait: isCompleted
                                    ? { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />, label: language === "zh" ? "已完成" : "Completed" }
                                    : { bg: "bg-slate-50 border-slate-200", text: "text-slate-700", icon: <PauseCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />, label: language === "zh" ? "等待" : "Wait" },
                                blocked: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", icon: <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />, label: language === "zh" ? "已阻止" : "Blocked" },
                                error: { bg: "bg-red-50 border-red-200", text: "text-red-800", icon: <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />, label: language === "zh" ? "错误" : "Error" },
                            }[d];

                            return (
                                <div key={`a-${a.id || idx}`} className="flex justify-start">
                                    <div className="max-w-[85%] space-y-1">
                                        <div className="flex items-start gap-2">
                                            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100">
                                                <Bot className="h-3.5 w-3.5 text-violet-600" />
                                            </div>
                                            <div className={`rounded-2xl rounded-tl-md border px-4 py-2.5 text-sm leading-relaxed ${decisionStyles.bg} ${decisionStyles.text}`}>
                                                <p className="line-clamp-4">{a.decisionReason}</p>
                                                {a.txHash && (
                                                    <a
                                                        href={`https://testnet.bscscan.com/tx/${a.txHash}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-1 inline-block text-xs text-[var(--color-sky)] hover:underline font-mono"
                                                    >
                                                        tx: {a.txHash.slice(0, 10)}...
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 pl-8">
                                            {decisionStyles.icon}
                                            <span className="text-xs font-medium" style={{ color: "inherit" }}>
                                                {decisionStyles.label}
                                            </span>
                                            {a.intentType && a.intentType !== "wait" && (
                                                <span className="inline-flex items-center gap-0.5 text-xs text-slate-400">
                                                    <Target className="h-3 w-3" />
                                                    {a.intentType}
                                                </span>
                                            )}
                                            <span className="text-xs text-slate-400 ml-auto">
                                                {formatRelative(a.createdAt, language)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Input bar */}
                    {isInteractive && (
                        <div className="border-t border-[var(--color-border)] bg-white/80 px-3 py-2">
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={inputText}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t.inputPlaceholder}
                                    disabled={isSaving}
                                    rows={1}
                                    className="flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm leading-relaxed focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400 disabled:opacity-60 placeholder:text-slate-400"
                                    style={{ minHeight: "38px", maxHeight: "120px" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => void handleSendInstruction()}
                                    disabled={isSaving || !inputText.trim()}
                                    className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition-colors hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <p className="mt-1.5 text-xs text-[var(--color-muted-foreground)]">
                                {t.inputHint} <span className="text-slate-400">· Ctrl+Enter</span>
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Save Button — DCA only (LLM uses inline send) */}
            {isInteractive && isDCA && strategyType && (
                <button
                    type="button"
                    onClick={handleSaveDCA}
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

