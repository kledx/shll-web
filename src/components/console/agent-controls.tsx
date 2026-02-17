"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/chip";
import { RunnerMode } from "@/components/console/status-card";
import { EnableState } from "@/hooks/useAutopilot";
import { RunnerAutopilotStatus } from "@/hooks/useAutopilotStatus";
import {
    Play, Pause, ShieldAlert, ChevronDown, ChevronUp, AlertTriangle, Loader2,
} from "lucide-react";

// ── i18n ─────────────────────────────────────────────────────
interface AgentControlsUiText {
    title: string;
    nonce: string;
    onchainOperator: string;
    operatorExpires: string;
    notSet: string;
    operatorAddress: string;
    useDefaultRunner: string;
    operatorExpiresInput: string;
    hint: string;
    enabling: string;
    enable: string;
    disabling: string;
    disable: string;
    renterOnlyHint: string;
    runnerLoading: string;
    runnerOperator: string;
    runnerEnabled: string;
    runnerReason: string;
    zeroBalanceHint: string;
    modeManagedOnlyHint: string;
    blockedByPackHint: string;
    runnerModeLabels: {
        manual: string;
        managed: string;
        external: string;
    };
    runtimeStateLabels: {
        AUTO_OFF: string;
        AUTO_ON: string;
        AUTO_ENABLING: string;
        AUTO_EXPIRED: string;
    };
    enableStateLabels: {
        IDLE: string;
        SIGNING: string;
        SUBMITTING: string;
        ONCHAIN_PENDING: string;
        ONCHAIN_CONFIRMED: string;
        ERROR: string;
    };
    boolTrue: string;
    boolFalse: string;
    toast: {
        invalidOperatorAddress: string;
        selectOperatorExpiry: string;
        expiryFutureRequired: string;
        enabledSuccess: string;
        enableFailed: string;
        disabledSuccess: string;
        disableFailed: string;
        unknownError: string;
        txPrefix: string;
    };
}

// ── Props ────────────────────────────────────────────────────
interface AgentControlsProps {
    ui: AgentControlsUiText;
    runnerMode: RunnerMode;
    enableState: EnableState;
    operatorNonce: bigint;
    onchainOperator: string | null;
    operatorExpires: bigint;
    leaseExpires?: number;
    autopilotOperator: string;
    autopilotExpiresAt: string;
    runnerOperatorDefault?: string;
    runnerStatus: RunnerAutopilotStatus | null;
    runnerStatusLoading: boolean;
    lockOperatorInput?: boolean;
    lockExpiryInput?: boolean;
    blockedByPack: boolean;
    isInteractiveConsole: boolean;
    isRenter: boolean;
    isOwner: boolean;
    isEnablingAutopilot: boolean;
    isClearingAutopilot: boolean;
    onSetAutopilotOperator: (value: string) => void;
    onSetAutopilotExpiresAt: (value: string) => void;
    onEnableAutopilot: () => void;
    onDisableAutopilot: () => void;
    language?: "en" | "zh";
}

// ── Runtime state derivation ────────────────────────────────
function runtimeAutopilotState(params: {
    enableState: EnableState;
    runnerEnabled: boolean;
    operatorExpires: bigint;
    leaseExpires?: number;
    onchainOperator?: string | null;
}): "AUTO_OFF" | "AUTO_ON" | "AUTO_ENABLING" | "AUTO_EXPIRED" {
    const { enableState, runnerEnabled, operatorExpires, leaseExpires, onchainOperator } = params;
    const nowSec = Math.floor(Date.now() / 1000);
    const onchainValid = onchainOperator && onchainOperator !== "0x0000000000000000000000000000000000000000";
    const operatorExpired = operatorExpires > BigInt(0) && Number(operatorExpires) <= nowSec;
    const leaseExpired = typeof leaseExpires === "number" && leaseExpires > 0 && leaseExpires <= nowSec;

    if (enableState === "SIGNING" || enableState === "SUBMITTING" || enableState === "ONCHAIN_PENDING") {
        return "AUTO_ENABLING";
    }
    if ((operatorExpired || leaseExpired) && onchainValid) {
        return "AUTO_EXPIRED";
    }
    if (runnerEnabled && onchainValid && !operatorExpired && !leaseExpired) {
        return "AUTO_ON";
    }
    return "AUTO_OFF";
}

// ── Localized labels ────────────────────────────────────────
const agentLabels = {
    en: {
        startAgent: "Start Agent",
        pauseAgent: "Pause Agent",
        starting: "Starting...",
        pausing: "Pausing...",
        emergencyStop: "Emergency Stop (Owner)",
        running: "Running",
        paused: "Paused",
        activating: "Activating...",
        expired: "Expired",
        advanced: "Advanced",
        runnerInfo: "Runner Info",
        confirmPhrase: "DISABLE",
        confirmHint: "Owner emergency action. Type",
        confirmToConfirm: "to confirm.",
        cancel: "Cancel",
        ownerEmergencyNote: "Renter can pause directly. Owner pause is emergency-only with confirmation.",
    },
    zh: {
        startAgent: "启动 Agent",
        pauseAgent: "暂停 Agent",
        starting: "启动中...",
        pausing: "暂停中...",
        emergencyStop: "紧急停止 (Owner)",
        running: "运行中",
        paused: "已暂停",
        activating: "激活中...",
        expired: "已过期",
        advanced: "高级设置",
        runnerInfo: "Runner 信息",
        confirmPhrase: "DISABLE",
        confirmHint: "Owner 紧急操作。请输入",
        confirmToConfirm: "以确认。",
        cancel: "取消",
        ownerEmergencyNote: "租户可直接暂停。Owner 暂停为紧急操作，需确认。",
    },
};

// ── State color mapping ─────────────────────────────────────
function stateColor(state: ReturnType<typeof runtimeAutopilotState>) {
    switch (state) {
        case "AUTO_ON": return "bg-emerald-500";
        case "AUTO_ENABLING": return "bg-amber-400 animate-pulse";
        case "AUTO_EXPIRED": return "bg-red-400";
        default: return "bg-gray-400";
    }
}

function stateChipVariant(state: ReturnType<typeof runtimeAutopilotState>): "burgundy" | "outline" | "destructive" {
    switch (state) {
        case "AUTO_ON": return "burgundy";
        case "AUTO_EXPIRED": return "destructive";
        default: return "outline";
    }
}

// ── Component ───────────────────────────────────────────────
export function AgentControls({
    ui,
    runnerMode,
    enableState,
    operatorNonce,
    onchainOperator,
    operatorExpires,
    leaseExpires,
    autopilotOperator,
    autopilotExpiresAt,
    runnerOperatorDefault,
    runnerStatus,
    runnerStatusLoading,
    lockOperatorInput = false,
    lockExpiryInput = false,
    blockedByPack,
    isInteractiveConsole,
    isRenter,
    isOwner,
    isEnablingAutopilot,
    isClearingAutopilot,
    onSetAutopilotOperator,
    onSetAutopilotExpiresAt,
    onEnableAutopilot,
    onDisableAutopilot,
    language = "en",
}: AgentControlsProps) {
    const t = agentLabels[language];
    const runnerEnabled = runnerStatus?.autopilot?.enabled === true;
    const nowSec = Math.floor(Date.now() / 1000);
    const onchainValid =
        !!onchainOperator &&
        onchainOperator.toLowerCase() !== "0x0000000000000000000000000000000000000000";
    const operatorExpired = operatorExpires > BigInt(0) && Number(operatorExpires) <= nowSec;
    const leaseExpired =
        typeof leaseExpires === "number" && leaseExpires > 0 && leaseExpires <= nowSec;

    const runtimeState = runtimeAutopilotState({
        enableState,
        runnerEnabled,
        operatorExpires,
        leaseExpires,
        onchainOperator,
    });

    const modeLabel = ui.runnerModeLabels[runnerMode];
    const modeSupportsEnable = runnerMode === "managed" || runnerMode === "external";
    const lastReason = runnerStatus?.autopilot?.lastReason || "";
    const balanceZeroBlocked = /agent account balance is zero|balance is zero|insufficient balance/i.test(
        lastReason
    );
    const ownerEmergencyMode = isOwner && !isRenter;

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [ownerConfirmingDisable, setOwnerConfirmingDisable] = useState(false);
    const [ownerDisableConfirmText, setOwnerDisableConfirmText] = useState("");
    const ownerCanDisable =
        ownerDisableConfirmText.trim().toUpperCase() === t.confirmPhrase;

    const isRunning = runtimeState === "AUTO_ON";

    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-white/60 p-4 space-y-4">
            {/* Header: Status + Mode */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${stateColor(runtimeState)}`} />
                    <span className="text-sm font-semibold text-[var(--color-foreground)]">
                        {isRunning ? t.running
                            : runtimeState === "AUTO_ENABLING" ? t.activating
                                : runtimeState === "AUTO_EXPIRED" ? t.expired
                                    : t.paused}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Chip variant="sticker">{modeLabel}</Chip>
                    <Chip variant={stateChipVariant(runtimeState)}>
                        {ui.runtimeStateLabels[runtimeState]}
                    </Chip>
                </div>
            </div>

            {/* Runner status summary */}
            {runnerStatusLoading ? (
                <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {ui.runnerLoading}
                </div>
            ) : lastReason ? (
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-3 py-2 text-sm text-[var(--color-muted-foreground)] truncate">
                    {ui.runnerReason}: {lastReason}
                </div>
            ) : null}

            {/* Balance zero warning */}
            {balanceZeroBlocked && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {ui.zeroBalanceHint}
                </div>
            )}

            {/* Mode/pack warnings */}
            {!modeSupportsEnable && (
                <div className="text-sm text-amber-700">{ui.modeManagedOnlyHint}</div>
            )}
            {blockedByPack && (
                <div className="text-sm text-red-600">{ui.blockedByPackHint}</div>
            )}

            {/* Primary action buttons */}
            <div className="flex flex-wrap gap-3">
                {!isRunning ? (
                    <button
                        type="button"
                        onClick={onEnableAutopilot}
                        disabled={!modeSupportsEnable || !isInteractiveConsole || isEnablingAutopilot || blockedByPack}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-5 py-2.5 text-sm font-medium transition-colors hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {isEnablingAutopilot ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                        {isEnablingAutopilot ? t.starting : t.startAgent}
                    </button>
                ) : null}

                {isRenter && isRunning && (
                    <button
                        type="button"
                        onClick={onDisableAutopilot}
                        disabled={isClearingAutopilot}
                        className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--color-muted)] disabled:opacity-50"
                    >
                        {isClearingAutopilot ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Pause className="h-4 w-4" />
                        )}
                        {isClearingAutopilot ? t.pausing : t.pauseAgent}
                    </button>
                )}

                {ownerEmergencyMode && !ownerConfirmingDisable && (
                    <button
                        type="button"
                        onClick={() => setOwnerConfirmingDisable(true)}
                        disabled={isClearingAutopilot}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-300 text-red-700 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                        <ShieldAlert className="h-4 w-4" />
                        {t.emergencyStop}
                    </button>
                )}
            </div>

            {/* Owner emergency confirm */}
            {ownerEmergencyMode && ownerConfirmingDisable && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
                    <div className="text-sm text-red-700">
                        {t.confirmHint} <span className="font-mono font-semibold">{t.confirmPhrase}</span> {t.confirmToConfirm}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            className="min-w-48 rounded-lg border border-red-200 px-3 py-2 text-sm font-mono"
                            placeholder={t.confirmPhrase}
                            value={ownerDisableConfirmText}
                            onChange={(e) => setOwnerDisableConfirmText(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={onDisableAutopilot}
                            disabled={isClearingAutopilot || !ownerCanDisable}
                            className="inline-flex items-center rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-red-700 disabled:opacity-50"
                        >
                            {isClearingAutopilot ? t.pausing : t.pauseAgent}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setOwnerConfirmingDisable(false);
                                setOwnerDisableConfirmText("");
                            }}
                            className="inline-flex items-center rounded-lg border px-3 py-2 text-sm"
                        >
                            {t.cancel}
                        </button>
                    </div>
                </div>
            )}

            {/* Renter/owner hint */}
            {!isRenter && ownerEmergencyMode && (
                <div className="text-sm text-[var(--color-muted-foreground)]">
                    {t.ownerEmergencyNote}
                </div>
            )}
            {!isRenter && !ownerEmergencyMode && (
                <div className="text-sm text-[var(--color-muted-foreground)]">
                    {ui.renterOnlyHint}
                </div>
            )}

            {/* Advanced settings (collapsed by default) */}
            <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            >
                {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {t.advanced}
            </button>

            {showAdvanced && (
                <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/20 p-3">
                    {/* On-chain info */}
                    <div className="grid grid-cols-1 gap-1 text-sm text-[var(--color-muted-foreground)]">
                        <div>{ui.nonce}: {operatorNonce.toString()}</div>
                        <div>{ui.onchainOperator}: {onchainOperator || ui.notSet}</div>
                        <div>
                            {ui.operatorExpires}:{" "}
                            {operatorExpires > BigInt(0)
                                ? new Date(Number(operatorExpires) * 1000).toLocaleString()
                                : ui.notSet}
                        </div>
                    </div>

                    {/* Runner info */}
                    {!runnerStatusLoading && (
                        <div className="rounded-lg border border-[var(--color-border)] bg-white/40 px-3 py-2 text-sm text-[var(--color-muted-foreground)]">
                            <div>{ui.runnerOperator}: {runnerStatus?.runnerOperator || "-"}</div>
                            <div>{ui.runnerEnabled}: {runnerEnabled ? ui.boolTrue : ui.boolFalse}</div>
                        </div>
                    )}

                    {/* Operator address + expiry inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[var(--color-foreground)]">{ui.operatorAddress}</label>
                            <input
                                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-mono focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-60"
                                value={autopilotOperator}
                                onChange={(e) => onSetAutopilotOperator(e.target.value)}
                                placeholder="0x..."
                                disabled={lockOperatorInput}
                                readOnly={lockOperatorInput}
                            />
                            {!lockOperatorInput && runnerOperatorDefault && (
                                <button
                                    type="button"
                                    onClick={() => onSetAutopilotOperator(runnerOperatorDefault)}
                                    className="text-xs text-[var(--color-primary)] hover:underline"
                                >
                                    {ui.useDefaultRunner}
                                </button>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[var(--color-foreground)]">{ui.operatorExpiresInput}</label>
                            <input
                                type="datetime-local"
                                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-60"
                                value={autopilotExpiresAt}
                                onChange={(e) => onSetAutopilotExpiresAt(e.target.value)}
                                disabled={lockExpiryInput}
                                readOnly={lockExpiryInput}
                            />
                        </div>
                    </div>

                    {/* Hint */}
                    <div className="text-xs text-[var(--color-muted-foreground)]">
                        {ui.hint}
                    </div>
                </div>
            )}
        </div>
    );
}

// Re-export old name for backward compatibility during migration
export { AgentControls as AutopilotCard };
