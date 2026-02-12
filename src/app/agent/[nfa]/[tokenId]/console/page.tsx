"use client";

import { AppShell } from "@/components/ui/app-shell";
import { ActionBuilder, Action } from "@/components/console/action-builder";
import { useAgentAccount } from "@/hooks/useAgentAccount";
import { useExecute } from "@/hooks/useExecute";
import { TransactionHistory } from "@/components/console/transaction-history";
import { VaultPanel } from "@/components/console/vault-panel";
import { useSimulate } from "@/hooks/useSimulate";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function ConsolePage() {
    const { t } = useTranslation();
    const params = useParams();
    const tokenId = params.tokenId as string;
    const nfaAddress = params.nfa as string;

    const { account: agentAccount, isLoading: isAccountLoading } = useAgentAccount(tokenId);
    const { executeAction, isLoading: isExecuting } = useExecute();

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
                    isRenter={true} // TODO: Check actual renter status
                    isOwner={true} // TODO: Check actual owner status
                />

                <TransactionHistory tokenId={tokenId} />
            </div>
        </AppShell>
    );
}
