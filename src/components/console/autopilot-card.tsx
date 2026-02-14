"use client";

import { Chip } from "@/components/ui/chip";
import { RunnerMode } from "@/components/console/status-card";
import { EnableState } from "@/hooks/useAutopilot";
import { RunnerAutopilotStatus } from "@/hooks/useAutopilotStatus";

interface AutopilotUiText {
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
}

interface AutopilotCardProps {
    ui: AutopilotUiText;
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
}

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

export function AutopilotCard({
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
}: AutopilotCardProps) {
    const runnerEnabled = runnerStatus?.autopilot?.enabled === true;
    const runnerStateLabel = runtimeAutopilotState({
        enableState,
        runnerEnabled,
        operatorExpires,
        leaseExpires,
        onchainOperator,
    });
    const modeLabel = ui.runnerModeLabels[runnerMode];
    const managedMode = runnerMode === "managed";

    return (
        <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{ui.title}</h2>
                <div className="flex items-center gap-2">
                    <Chip variant="sticker">{modeLabel}</Chip>
                    <Chip variant={runnerEnabled ? "burgundy" : "outline"}>{ui.runtimeStateLabels[runnerStateLabel]}</Chip>
                    <Chip variant={enableState === "ERROR" ? "destructive" : "outline"}>
                        {ui.enableStateLabels[enableState]}
                    </Chip>
                </div>
            </div>
            <div className="text-xs text-muted-foreground">
                {ui.nonce}: {operatorNonce.toString()}
            </div>
            <div className="text-xs text-muted-foreground">
                {ui.onchainOperator}: {onchainOperator || ui.notSet}
            </div>
            <div className="text-xs text-muted-foreground">
                {ui.operatorExpires}:{" "}
                {operatorExpires > BigInt(0)
                    ? new Date(Number(operatorExpires) * 1000).toLocaleString()
                    : ui.notSet}
            </div>
            {runnerStatusLoading ? (
                <div className="text-xs text-muted-foreground">{ui.runnerLoading}</div>
            ) : (
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    <div>{ui.runnerOperator}: {runnerStatus?.runnerOperator || "-"}</div>
                    <div>{ui.runnerEnabled}: {runnerEnabled ? ui.boolTrue : ui.boolFalse}</div>
                    {runnerStatus?.autopilot?.lastReason && (
                        <div className="truncate">{ui.runnerReason}: {runnerStatus.autopilot.lastReason}</div>
                    )}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-sm font-medium">{ui.operatorAddress}</label>
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                        value={autopilotOperator}
                        onChange={(e) => onSetAutopilotOperator(e.target.value)}
                        placeholder="0x..."
                    />
                    {runnerOperatorDefault && (
                        <button
                            type="button"
                            onClick={() => onSetAutopilotOperator(runnerOperatorDefault)}
                            className="text-xs text-[var(--color-burgundy)] hover:underline"
                        >
                            {ui.useDefaultRunner}
                        </button>
                    )}
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">{ui.operatorExpiresInput}</label>
                    <input
                        type="datetime-local"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={autopilotExpiresAt}
                        onChange={(e) => onSetAutopilotExpiresAt(e.target.value)}
                    />
                </div>
            </div>
            <div className="text-xs text-muted-foreground">
                {ui.hint}
            </div>
            {!managedMode && (
                <div className="text-xs text-amber-700">
                    {ui.modeManagedOnlyHint}
                </div>
            )}
            {blockedByPack && (
                <div className="text-xs text-red-600">
                    {ui.blockedByPackHint}
                </div>
            )}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onEnableAutopilot}
                    disabled={!managedMode || !isInteractiveConsole || isEnablingAutopilot || blockedByPack}
                    className="inline-flex items-center rounded-md bg-[var(--color-burgundy)] text-white px-4 py-2 text-sm disabled:opacity-50"
                >
                    {isEnablingAutopilot
                        ? ui.enabling
                        : ui.enable}
                </button>
                <button
                    type="button"
                    onClick={onDisableAutopilot}
                    disabled={isClearingAutopilot || (!isOwner && !isRenter)}
                    className="inline-flex items-center rounded-md border px-4 py-2 text-sm disabled:opacity-50"
                >
                    {isClearingAutopilot
                        ? ui.disabling
                        : ui.disable}
                </button>
            </div>
            {!isRenter && (
                <div className="text-xs text-muted-foreground">
                    {ui.renterOnlyHint}
                </div>
            )}
        </div>
    );
}
