"use client";

import { AppShell } from "@/components/ui/app-shell";
import { ActionBuilder, Action } from "@/components/console/action-builder";
import { useAgentAccount } from "@/hooks/useAgentAccount";
import { useAgent } from "@/hooks/useAgent";
import { useExecute } from "@/hooks/useExecute";
import { TransactionHistory } from "@/components/console/transaction-history";
import { VaultPanel } from "@/components/console/vault-panel";
import { useSimulate } from "@/hooks/useSimulate";
import { useConnection } from "wagmi";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { ShieldAlert } from "lucide-react";

export default function ConsolePage() {
    const { t } = useTranslation();
    const params = useParams();
    const tokenId = params.tokenId as string;
    const nfaAddress = params.nfa as string;

    const { address } = useConnection();
    const { data: agent, isLoading: isAgentLoading } = useAgent(tokenId);
    const { account: agentAccount, isLoading: isAccountLoading } = useAgentAccount(tokenId);
    const { executeAction, isLoading: isExecuting } = useExecute();

    // Derive permissions from on-chain data
    const isOwner = !!address && !!agent && address.toLowerCase() === agent.owner.toLowerCase();
    const isRenter = !!address && !!agent && address.toLowerCase() === agent.renter.toLowerCase();
    const hasAccess = isOwner || isRenter;

    // Simulation State Management
    const [simAction, setSimAction] = useState<Action | null>(null);

    const {
        simulate,
        result: simulationResult,
        isLoading: isSimulating
    } = useSimulate(tokenId, simAction);

    const handleSimulate = (action: Action) => {
        setSimAction(action);
        setTimeout(() => {
            simulate();
        }, 0);
    };

    const handleExecute = (action: Action) => {
        executeAction(tokenId, action);
    };

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
                    agentAccount={agentAccount}
                />

                <VaultPanel
                    agentAccount={agentAccount}
                    isRenter={isRenter}
                    isOwner={isOwner}
                />

                <TransactionHistory tokenId={tokenId} />
            </div>
        </AppShell>
    );
}
