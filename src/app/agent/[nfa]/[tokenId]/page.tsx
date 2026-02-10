"use client";

import { AppShell } from "@/components/ui/app-shell";
import { PolicySummary } from "@/components/business/policy-summary";
import { ActionPanel } from "@/components/business/action-panel";
import { useAccount } from "wagmi";
import { useParams } from "next/navigation";
import { Chip } from "@/components/ui/chip";
import { Clock, ShieldCheck, User } from "lucide-react";
import { useAgent } from "@/hooks/useAgent";

export default function AgentDetailPage() {
    const params = useParams();
    const nfaAddress = params.nfa as string;
    const tokenId = params.tokenId as string;
    const { address } = useAccount();

    const { data: agent, isLoading } = useAgent(nfaAddress, tokenId);

    if (isLoading || !agent) {
        return (
            <AppShell>
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-burgundy)]"></div>
                </div>
            </AppShell>
        );
    }

    const isOwner = address?.toLowerCase() === agent.owner.toLowerCase();
    const isRenter = address?.toLowerCase() === agent.renter.toLowerCase();

    return (
        <AppShell>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column: Information */}
                <div className="md:col-span-2 space-y-6">

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
                                <User className="w-4 h-4" /> Owner: {agent.owner}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" /> Min Lease: {agent.minDays} days
                            </div>
                            <div className="flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4" /> Policy Active
                            </div>
                        </div>
                    </div>

                    <PolicySummary rules={agent.policy} />
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
                        />
                    </div>
                </div>

            </div>
        </AppShell>
    );
}
