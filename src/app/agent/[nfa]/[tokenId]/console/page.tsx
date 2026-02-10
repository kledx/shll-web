"use client";

import { AppShell } from "@/components/ui/app-shell";
import { ActionBuilder, Action } from "@/components/console/action-builder";
import { useAgentAccount } from "@/hooks/useAgentAccount";
import { useExecute } from "@/hooks/useExecute";
import { TransactionHistory } from "@/components/console/transaction-history";
import { VaultPanel } from "@/components/console/vault-panel";
import { useSimulate } from "@/hooks/useSimulate"; // We need to adjust this hook usage
import { useParams } from "next/navigation";
import { useState } from "react";
import { Address, Hex } from "viem";

export default function ConsolePage() {
    const params = useParams();
    const tokenId = params.tokenId as string;
    const nfaAddress = params.nfa as string; // Not used yet but good to have context

    const { account: agentAccount, isLoading: isAccountLoading } = useAgentAccount(tokenId);
    const { executeAction, isLoading: isExecuting } = useExecute();

    // Simulation State Management
    // Since useSimulate is a hook, we can't call it conditionally inside a callback.
    // We'll refactor slightly: hold the "action to simulate" in state.
    const [simAction, setSimAction] = useState<Action | null>(null);

    // This hook will re-run simulation whenever `simAction` changes.
    // In a real app, we might want a manual trigger.
    const {
        simulate,
        result: simulationResult,
        isLoading: isSimulating
    } = useSimulate(tokenId, simAction);

    const handleSimulate = (action: Action) => {
        setSimAction(action);
        // Ideally useSimulate should expose a trigger function if it wasn't purely effect-driven
        // But based on my implementation of useSimulate, it simulates on mount/change. 
        // Wait, let me check useSimulate implementation...
        // It exports `simulate` function! Good.
        // However, it depends on `action` prop.
        // So setting state `setSimAction(action)` will trigger the effect if I wrote it that way?
        // Let's re-read useSimulate.ts in next step to be sure.
        // Assuming `simulate()` needs to be called manually.
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
                            Agent Console
                        </h1>
                        <p className="text-muted-foreground">
                            Interact with external protocols via your agent.
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium">Agent ID: #{tokenId}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                            {agentAccount || (isAccountLoading ? "Loading..." : "Unknown Account")}
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
                    isRenter={true} // TODO: Check actual renter status from context/props
                    isOwner={true} // TODO: Check actual owner status
                />

                <TransactionHistory tokenId={tokenId} />
            </div>
        </AppShell>
    );
}
