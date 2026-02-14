"use client";

import { AppShell } from "@/components/ui/app-shell";
import { ActionBuilder } from "@/components/console/action-builder";
import { Action, TemplateKey } from "@/components/console/action-types";
import { useAgentAccount } from "@/hooks/useAgentAccount";
import { useAgent } from "@/hooks/useAgent";
import { useExecute } from "@/hooks/useExecute";
import { TransactionHistory } from "@/components/console/transaction-history";
import { VaultPanel } from "@/components/console/vault-panel";
import { StatusCard, LeaseStatus, PackStatus, RunnerMode } from "@/components/console/status-card";
import { AutopilotCard } from "@/components/console/autopilot-card";
import { useSimulate } from "@/hooks/useSimulate";
import { useAccount } from "wagmi";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronRight, ShieldAlert } from "lucide-react";
import { useAutopilot } from "@/hooks/useAutopilot";
import { useCapabilityPack } from "@/hooks/useCapabilityPack";
import { useAutopilotStatus } from "@/hooks/useAutopilotStatus";
import { getConsoleCopy } from "@/lib/console/console-copy";
import { toast } from "sonner";
import { Address, zeroAddress } from "viem";
import Link from "next/link";

export default function ConsolePage() {
    const { t, language } = useTranslation();
    const params = useParams();
    const tokenId = params.tokenId as string;
    const nfaAddress = params.nfa as string;
    const detailPath = `/agent/${nfaAddress}/${tokenId}`;
    const consolePath = `${detailPath}/console`;
    const runnerOperatorDefault = process.env.NEXT_PUBLIC_RUNNER_OPERATOR || "";
    const tokenIdBigInt = useMemo(() => {
        try {
            return BigInt(tokenId);
        } catch {
            return undefined;
        }
    }, [tokenId]);

    const { address } = useAccount();
    const { data: agent, isLoading: isAgentLoading, error: agentError } = useAgent(tokenId, nfaAddress);
    const { account: agentAccount, isLoading: isAccountLoading } = useAgentAccount(tokenId, nfaAddress);
    const capabilityPack = useCapabilityPack(tokenIdBigInt, nfaAddress);
    const {
        executeAction,
        isLoading: isExecuting,
        isSuccess: isExecuteSuccess,
        hash: executeHash,
    } = useExecute(nfaAddress);

    // Derive permissions from on-chain data
    const isOwner = !!address && !!agent && address.toLowerCase() === agent.owner.toLowerCase();
    const isRenter = !!address && !!agent && address.toLowerCase() === agent.renter.toLowerCase();
    const hasAccess = isOwner || isRenter;
    const ui = getConsoleCopy(language);
    const roleLabel = isOwner
        ? ui.roleLabels.owner
        : isRenter
            ? ui.roleLabels.renter
            : ui.roleLabels.guest;

    const nowSec = Math.floor(Date.now() / 1000);
    const hasRenter = !!agent && agent.renter.toLowerCase() !== zeroAddress.toLowerCase();
    const leaseStatus: LeaseStatus = !hasRenter
        ? "NOT_RENTED"
        : (agent?.expires || 0) > nowSec
            ? "RENTED_ACTIVE"
            : "RENTED_EXPIRED";
    const isRentedActive = leaseStatus === "RENTED_ACTIVE";
    const isInteractiveConsole = isRenter && isRentedActive;
    const readOnlyMessage = ui.readOnlyMessage;

    const packStatus: PackStatus = useMemo(() => {
        if (!agent?.metadata?.vaultURI) return "PACK_NONE";
        if (capabilityPack.isLoading) return "PACK_LOADING";
        if (capabilityPack.error) return "PACK_INVALID";
        if (capabilityPack.isHashValid === false) return "PACK_INVALID";
        if (capabilityPack.manifest) return "PACK_VALID";
        return "PACK_INVALID";
    }, [
        agent?.metadata?.vaultURI,
        capabilityPack.error,
        capabilityPack.isHashValid,
        capabilityPack.isLoading,
        capabilityPack.manifest,
    ]);

    const runnerMode: RunnerMode = useMemo(() => {
        const mode = capabilityPack.capabilities?.runnerMode || "manual";
        if (mode === "managed" || mode === "external") return mode;
        return "manual";
    }, [capabilityPack.capabilities?.runnerMode]);

    const enabledTemplates = useMemo<TemplateKey[]>(() => {
        const normalizeTemplate = (value: string): TemplateKey | null => {
            const key = value.toLowerCase();
            if (key.includes("swap")) return "swap";
            if (key.includes("repay")) return "repay";
            if (key === "raw") return "raw";
            return null;
        };

        if (packStatus !== "PACK_VALID") {
            return ["swap", "repay", "raw"];
        }

        const templates = (capabilityPack.capabilities?.consoleTemplates || [])
            .map(normalizeTemplate)
            .filter((item): item is TemplateKey => item !== null);

        const deduped = Array.from(new Set(templates));
        if (!deduped.includes("raw")) deduped.push("raw");
        return deduped.length > 0 ? deduped : ["swap", "repay", "raw"];
    }, [capabilityPack.capabilities?.consoleTemplates, packStatus]);

    const autopilotBlockedByPack = packStatus === "PACK_INVALID";

    // Simulation State Management
    const [simAction, setSimAction] = useState<Action | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const {
        simulate,
        result: simulationResult,
        error: simulationError,
        isLoading: isSimulating
    } = useSimulate(tokenId, simAction, nfaAddress);
    const {
        enableAutopilot,
        clearAutopilot,
        operator: onchainOperator,
        operatorExpires,
        nonce: operatorNonce,
        enableState,
        isSubmitting: isEnablingAutopilot,
        isClearingAutopilot,
    } = useAutopilot({ tokenId, renter: agent?.renter, nfaAddress });
    const {
        data: runnerStatus,
        isLoading: isRunnerStatusLoading,
    } = useAutopilotStatus(tokenId, nfaAddress, refreshKey);
    const [autopilotOperator, setAutopilotOperator] = useState<string>(
        process.env.NEXT_PUBLIC_RUNNER_OPERATOR || ""
    );
    const [autopilotExpiresAt, setAutopilotExpiresAt] = useState<string>("");

    const handleSimulate = (action: Action) => {
        if (!isInteractiveConsole) {
            toast.error(readOnlyMessage);
            return;
        }
        setSimAction(action);
        setTimeout(() => {
            simulate();
        }, 0);
    };

    const handleExecute = (action: Action) => {
        if (!isInteractiveConsole) {
            toast.error(readOnlyMessage);
            return;
        }
        executeAction(tokenId, action);
    };

    const formatLocalInput = (unixSeconds: number) => {
        const date = new Date(unixSeconds * 1000);
        const pad = (n: number) => String(n).padStart(2, "0");
        const y = date.getFullYear();
        const m = pad(date.getMonth() + 1);
        const d = pad(date.getDate());
        const h = pad(date.getHours());
        const mm = pad(date.getMinutes());
        return `${y}-${m}-${d}T${h}:${mm}`;
    };

    const handleEnableAutopilot = async () => {
        if (!agent) return;
        if (!isInteractiveConsole) {
            toast.error(readOnlyMessage);
            return;
        }
        if (runnerMode !== "managed") {
            toast.error(ui.autopilot.modeManagedOnlyHint);
            return;
        }
        if (autopilotBlockedByPack) {
            toast.error(ui.autopilot.blockedByPackHint);
            return;
        }
        if (!/^0x[a-fA-F0-9]{40}$/.test(autopilotOperator)) {
            toast.error(ui.autopilot.toast.invalidOperatorAddress);
            return;
        }
        if (!autopilotExpiresAt) {
            toast.error(ui.autopilot.toast.selectOperatorExpiry);
            return;
        }

        const expiresSec = Math.floor(
            new Date(autopilotExpiresAt).getTime() / 1000
        );
        if (!Number.isFinite(expiresSec) || expiresSec <= Math.floor(Date.now() / 1000)) {
            toast.error(ui.autopilot.toast.expiryFutureRequired);
            return;
        }

        try {
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
            const result = await enableAutopilot({
                operator: autopilotOperator as Address,
                expires: BigInt(expiresSec),
                deadline,
            });
            toast.success(ui.autopilot.toast.enabledSuccess, {
                description: `${ui.autopilot.toast.txPrefix}: ${result.txHash.slice(0, 10)}...`,
            });
        } catch (err) {
            toast.error(ui.autopilot.toast.enableFailed, {
                description:
                    err instanceof Error
                        ? err.message.slice(0, 140)
                        : ui.autopilot.toast.unknownError,
            });
        }
    };

    const handleDisableAutopilot = async () => {
        try {
            const result = await clearAutopilot();
            toast.success(ui.autopilot.toast.disabledSuccess, {
                description: `${ui.autopilot.toast.txPrefix}: ${result.txHash.slice(0, 10)}...`,
            });
        } catch (err) {
            toast.error(ui.autopilot.toast.disableFailed, {
                description:
                    err instanceof Error
                        ? err.message.slice(0, 140)
                        : ui.autopilot.toast.unknownError,
            });
        }
    };

    useEffect(() => {
        if (isExecuteSuccess && executeHash) {
            setRefreshKey((k) => k + 1);
        }
    }, [isExecuteSuccess, executeHash]);

    useEffect(() => {
        const leaseExpires = agent?.expires;
        if (!leaseExpires) return;
        const now = Math.floor(Date.now() / 1000);
        const defaultExpires = Math.min(leaseExpires, now + 7 * 24 * 3600);
        setAutopilotExpiresAt(formatLocalInput(defaultExpires));
    }, [agent?.expires]);

    // Show loading while fetching agent data
    if (isAgentLoading) {
        return (
            <AppShell>
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-burgundy)]"></div>
                </div>
            </AppShell>
        );
    }

    if (agentError) {
        return (
            <AppShell>
                <div className="max-w-lg mx-auto text-center py-20 space-y-4">
                    <ShieldAlert className="w-12 h-12 text-[var(--color-burgundy)] mx-auto" />
                    <h2 className="text-2xl font-serif font-bold text-[var(--color-burgundy)]">
                        {t.agent.console.page.title}
                    </h2>
                    <p className="text-muted-foreground">
                        {ui.errorLoadAgent}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono break-all">
                        {agentError.message}
                    </p>
                    <div className="flex justify-center gap-2 pt-2">
                        <Link
                            href={detailPath}
                            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
                        >
                            {ui.goAgentDetail}
                        </Link>
                        <Link
                            href="/docs"
                            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
                        >
                            {ui.openDocs}
                        </Link>
                    </div>
                </div>
            </AppShell>
        );
    }

    // Show unauthorized message if wallet is not connected or user has no access
    if (!hasAccess) {
        return (
            <AppShell>
                <div className="max-w-lg mx-auto text-center py-20 space-y-4">
                    <ShieldAlert className="w-12 h-12 text-[var(--color-burgundy)] mx-auto" />
                    <h2 className="text-2xl font-serif font-bold text-[var(--color-burgundy)]">
                        {t.agent.console.page.title}
                    </h2>
                    <p className="text-muted-foreground">
                        {!address
                            ? (t.agent.console.page.connectWallet || "Please connect your wallet to access the console.")
                            : (t.agent.console.page.noAccess || "You must be the owner or active renter of this agent to use the console.")}
                    </p>
                    <div className="rounded-lg border bg-muted/30 px-4 py-3 text-left text-xs text-muted-foreground">
                        <div className="font-medium text-foreground">{ui.nextStepTitle}</div>
                        <div className="pt-1">
                            {!address
                                ? ui.nextStepConnect
                                : ui.nextStepRent}
                        </div>
                        <div className="pt-1 font-mono break-all">
                            {!address
                                ? ui.nextStepPathConnect
                                : `${ui.nextStepPathRentPrefix}${detailPath} -> rent/extend -> ${consolePath}`}
                        </div>
                    </div>
                    <div className="flex justify-center gap-2 pt-2">
                        <Link
                            href={detailPath}
                            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
                        >
                            {ui.goAgentDetail}
                        </Link>
                        <Link
                            href="/me"
                            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
                        >
                            {t.common.nav.me}
                        </Link>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="max-w-3xl mx-auto space-y-6">
                <nav className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Link href="/" className="hover:text-foreground">
                        {t.common.nav.market}
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link href={detailPath} className="hover:text-foreground">
                        {ui.agentDetail}
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-foreground">{t.agent.detail.tabs.console}</span>
                </nav>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-[var(--color-burgundy)]">
                            {t.agent.console.page.title}
                        </h1>
                        <p className="text-muted-foreground">
                            {t.agent.console.page.subtitle}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium">{t.agent.console.page.agentId}: #{tokenId}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                            {agentAccount || (isAccountLoading ? t.agent.detail.loading : t.agent.console.page.unknown)}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                    <div>
                        <span className="font-medium text-foreground">{ui.currentRole}: </span>
                        {roleLabel}
                    </div>
                    <div className="pt-1">
                        {isRenter
                            ? ui.roleHintRenter
                            : isOwner
                                ? ui.roleHintOwner
                                : ui.roleHintGuest}
                    </div>
                </div>

                <StatusCard
                    tokenId={tokenId}
                    leaseStatus={leaseStatus}
                    leaseExpires={agent?.expires}
                    packStatus={packStatus}
                    vaultURI={agent?.metadata?.vaultURI}
                    vaultHash={agent?.metadata?.vaultHash as `0x${string}` | undefined}
                    runnerMode={runnerMode}
                    policySummary={{
                        maxDeadlineWindow: agent?.policy.maxDeadlineWindow ?? 0,
                        maxPathLength: agent?.policy.maxPathLength ?? 0,
                        allowedTokens: agent?.policy.allowedTokens.length ?? 0,
                        allowedSpenders: agent?.policy.allowedSpenders.length ?? 0,
                    }}
                    ui={ui.status}
                />

                {!isInteractiveConsole && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {readOnlyMessage}
                    </div>
                )}

                {autopilotBlockedByPack && (
                    <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {ui.packInvalidPolicyHint}
                    </div>
                )}

                <ActionBuilder
                    onSimulate={handleSimulate}
                    onExecute={handleExecute}
                    isSimulating={isSimulating}
                    isExecuting={isExecuting}
                    simulationResult={simulationResult}
                    simulationError={simulationError}
                    agentAccount={agentAccount}
                    enabledTemplates={enabledTemplates}
                    renterAddress={agent?.renter}
                    readOnly={!isInteractiveConsole}
                    readOnlyMessage={readOnlyMessage}
                />

                <AutopilotCard
                    ui={ui.autopilot}
                    runnerMode={runnerMode}
                    enableState={enableState}
                    operatorNonce={operatorNonce}
                    onchainOperator={onchainOperator}
                    operatorExpires={operatorExpires}
                    leaseExpires={agent?.expires}
                    autopilotOperator={autopilotOperator}
                    autopilotExpiresAt={autopilotExpiresAt}
                    runnerOperatorDefault={runnerOperatorDefault}
                    runnerStatus={runnerStatus}
                    runnerStatusLoading={isRunnerStatusLoading}
                    blockedByPack={autopilotBlockedByPack}
                    isInteractiveConsole={isInteractiveConsole}
                    isRenter={isRenter}
                    isOwner={isOwner}
                    isEnablingAutopilot={isEnablingAutopilot}
                    isClearingAutopilot={isClearingAutopilot}
                    onSetAutopilotOperator={setAutopilotOperator}
                    onSetAutopilotExpiresAt={setAutopilotExpiresAt}
                    onEnableAutopilot={handleEnableAutopilot}
                    onDisableAutopilot={handleDisableAutopilot}
                />

                <VaultPanel
                    agentAccount={agentAccount}
                    isRenter={isRenter}
                    isOwner={isOwner}
                    tokenId={tokenId}
                    refreshKey={refreshKey}
                    readOnly={!isInteractiveConsole}
                    allowWithdraw={false}
                />

                <TransactionHistory tokenId={tokenId} nfaAddress={nfaAddress} refreshKey={refreshKey} />
            </div>
        </AppShell>
    );
}
