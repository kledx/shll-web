"use client";

import { AppShell } from "@/components/ui/app-shell";
import { ActionBuilder, Action } from "@/components/console/action-builder";
import { useAgentAccount } from "@/hooks/useAgentAccount";
import { useAgent } from "@/hooks/useAgent";
import { useExecute } from "@/hooks/useExecute";
import { TransactionHistory } from "@/components/console/transaction-history";
import { VaultPanel } from "@/components/console/vault-panel";
import { useSimulate } from "@/hooks/useSimulate";
import { useAccount } from "wagmi";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { ShieldAlert } from "lucide-react";
import { useAutopilot } from "@/hooks/useAutopilot";
import { toast } from "sonner";
import { Address } from "viem";

export default function ConsolePage() {
    const { t } = useTranslation();
    const params = useParams();
    const tokenId = params.tokenId as string;
    const nfaAddress = params.nfa as string;

    const { address } = useAccount();
    const { data: agent, isLoading: isAgentLoading } = useAgent(tokenId, nfaAddress);
    const { account: agentAccount, isLoading: isAccountLoading } = useAgentAccount(tokenId, nfaAddress);
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
        isSubmitting: isEnablingAutopilot,
        isClearingAutopilot,
    } = useAutopilot({ tokenId, renter: agent?.renter, nfaAddress });
    const [autopilotOperator, setAutopilotOperator] = useState<string>(
        process.env.NEXT_PUBLIC_RUNNER_OPERATOR || ""
    );
    const [autopilotExpiresAt, setAutopilotExpiresAt] = useState<string>("");

    const handleSimulate = (action: Action) => {
        setSimAction(action);
        setTimeout(() => {
            simulate();
        }, 0);
    };

    const handleExecute = (action: Action) => {
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
        if (!/^0x[a-fA-F0-9]{40}$/.test(autopilotOperator)) {
            toast.error("Invalid operator address");
            return;
        }
        if (!autopilotExpiresAt) {
            toast.error("Please select operator expiry");
            return;
        }

        const expiresSec = Math.floor(
            new Date(autopilotExpiresAt).getTime() / 1000
        );
        if (!Number.isFinite(expiresSec) || expiresSec <= Math.floor(Date.now() / 1000)) {
            toast.error("Operator expiry must be in the future");
            return;
        }

        try {
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
            const result = await enableAutopilot({
                operator: autopilotOperator as Address,
                expires: BigInt(expiresSec),
                deadline,
            });
            toast.success("Autopilot enabled", {
                description: `Tx: ${result.txHash.slice(0, 10)}...`,
            });
        } catch (err) {
            toast.error("Enable autopilot failed", {
                description:
                    err instanceof Error
                        ? err.message.slice(0, 140)
                        : "Unknown error",
            });
        }
    };

    const handleDisableAutopilot = async () => {
        try {
            const result = await clearAutopilot();
            toast.success("Autopilot disabled", {
                description: `Tx: ${result.txHash.slice(0, 10)}...`,
            });
        } catch (err) {
            toast.error("Disable autopilot failed", {
                description:
                    err instanceof Error
                        ? err.message.slice(0, 140)
                        : "Unknown error",
            });
        }
    };

    useEffect(() => {
        if (isExecuteSuccess && executeHash) {
            setRefreshKey((k) => k + 1);
        }
    }, [isExecuteSuccess, executeHash]);

    useEffect(() => {
        if (!agent) return;
        const now = Math.floor(Date.now() / 1000);
        const defaultExpires = Math.min(agent.expires || now + 3600, now + 7 * 24 * 3600);
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
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="max-w-3xl mx-auto space-y-6">
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

                <ActionBuilder
                    onSimulate={handleSimulate}
                    onExecute={handleExecute}
                    isSimulating={isSimulating}
                    isExecuting={isExecuting}
                    simulationResult={simulationResult}
                    simulationError={simulationError}
                    agentAccount={agentAccount}
                />

                <div className="rounded-xl border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Autopilot</h2>
                        <span className="text-xs text-muted-foreground">
                            Nonce: {operatorNonce.toString()}
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        On-chain operator: {onchainOperator || "not set"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Operator expires:{" "}
                        {operatorExpires > BigInt(0)
                            ? new Date(Number(operatorExpires) * 1000).toLocaleString()
                            : "not set"}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Operator Address</label>
                            <input
                                className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                                value={autopilotOperator}
                                onChange={(e) => setAutopilotOperator(e.target.value)}
                                placeholder="0x..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Operator Expires</label>
                            <input
                                type="datetime-local"
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                value={autopilotExpiresAt}
                                onChange={(e) => setAutopilotExpiresAt(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleEnableAutopilot}
                        disabled={!isRenter || isEnablingAutopilot}
                        className="inline-flex items-center rounded-md bg-[var(--color-burgundy)] text-white px-4 py-2 text-sm disabled:opacity-50"
                    >
                        {isEnablingAutopilot ? "Enabling..." : "Enable Autopilot (Sign)"}
                    </button>
                    <button
                        type="button"
                        onClick={handleDisableAutopilot}
                        disabled={isClearingAutopilot || !isOwner && !isRenter}
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm disabled:opacity-50"
                    >
                        {isClearingAutopilot ? "Disabling..." : "Disable Autopilot"}
                    </button>
                    {!isRenter && (
                        <div className="text-xs text-muted-foreground">
                            Only active renter can sign operator permit.
                        </div>
                    )}
                </div>

                <VaultPanel
                    agentAccount={agentAccount}
                    isRenter={isRenter}
                    isOwner={isOwner}
                    tokenId={tokenId}
                    refreshKey={refreshKey}
                />

                <TransactionHistory tokenId={tokenId} refreshKey={refreshKey} />
            </div>
        </AppShell>
    );
}
