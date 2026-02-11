"use client";

import { AppShell } from "@/components/ui/app-shell";
import { PolicySummary } from "@/components/business/policy-summary";
import { ActionPanel } from "@/components/business/action-panel";
import { useAccount } from "wagmi";
import { useParams } from "next/navigation";
import { Chip } from "@/components/ui/chip";
import { Clock, ShieldCheck, User } from "lucide-react";
import { useAgent } from "@/hooks/useAgent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionHistory } from "@/components/console/transaction-history";
import { VaultPanel } from "@/components/console/vault-panel";
import { useAgentAccount } from "@/hooks/useAgentAccount";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

function CopyButton({ text }: { text: string }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        // Toast would go here
    };
    return (
        <button onClick={handleCopy} className="hover:text-[var(--color-burgundy)] transition-colors">
            <Copy className="w-3 h-3 ml-1" />
        </button>
    );
}

export default function AgentDetailPage() {
    const params = useParams();
    const nfaAddress = params.nfa as string;
    const tokenId = params.tokenId as string;
    const { address } = useAccount();

    const { data: agent, isLoading } = useAgent(tokenId);
    const { account: agentAccount } = useAgentAccount(tokenId);

    if (isLoading) {
        return (
            <AppShell>
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-burgundy)]"></div>
                </div>
            </AppShell>
        );
    }

    if (!agent) {
        return (
            <AppShell>
                <div className="flex justify-center p-20">
                    <p className="text-xl text-muted-foreground">Agent not found.</p>
                </div>
            </AppShell>
        );
    }

    const isOwner = address?.toLowerCase() === agent.owner.toLowerCase();
    const isRenter = address?.toLowerCase() === agent.renter.toLowerCase();

    return (
        <AppShell>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column: Information with Tabs */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="mb-6 w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                            <TabsTrigger
                                value="overview"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-burgundy)] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-burgundy)] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
                            >
                                History & Records
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Chip variant="sticker" className="text-sm">#{tokenId}</Chip>
                                    <Chip variant={agent.status === 'active' ? 'default' : 'secondary'}>
                                        {agent.status.toUpperCase()}
                                    </Chip>
                                </div>

                                <h1 className="text-4xl font-serif font-bold text-[var(--color-burgundy)]">
                                    {agent.name}
                                </h1>

                                <p className="text-lg text-muted-foreground">
                                    {agent.description}
                                </p>

                                <div className="flex flex-wrap gap-4 text-sm font-mono text-muted-foreground pt-2">
                                    <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        <span>Owner: {agent.owner.slice(0, 6)}...{agent.owner.slice(-4)}</span>
                                        <CopyButton text={agent.owner} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> Min Lease: {agent.minDays} days
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ShieldCheck className="w-4 h-4" /> Policy Active
                                    </div>
                                </div>
                            </div>

                            {/* Vault Summary in Overview */}
                            <VaultPanel
                                agentAccount={agentAccount}
                                isRenter={isRenter}
                                isOwner={isOwner}
                            />

                            <PolicySummary rules={agent.policy} />
                        </TabsContent>

                        <TabsContent value="history">
                            <TransactionHistory tokenId={tokenId} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Action */}
                <div className="md:col-span-1">
                    <div className="sticky top-24">
                        <ActionPanel
                            nfaAddress={nfaAddress}
                            tokenId={tokenId}
                            isActive={agent.status === 'active'}
                            isOwner={isOwner}
                            isRenter={isRenter}
                            pricePerDay={agent.pricePerDay.split(' ')[0]} // Strip " BNB"
                            minDays={agent.minDays}
                        />
                    </div>
                </div>

            </div>
        </AppShell>
    );
}
