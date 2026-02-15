"use client";

import { AppShell } from "@/components/ui/app-shell";
import { PolicySummary } from "@/components/business/policy-summary";
import { ActionPanel } from "@/components/business/action-panel";
import { useAccount } from "wagmi";
import { useParams } from "next/navigation";
import { Chip } from "@/components/ui/chip";
import { ChevronRight, Clock, ShieldCheck, User } from "lucide-react";
import { useAgent } from "@/hooks/useAgent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionHistory } from "@/components/console/transaction-history";
import { VaultPanel } from "@/components/console/vault-panel";
import { useAgentAccount } from "@/hooks/useAgentAccount";
import { Copy } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";

function CopyButton({ text }: { text: string }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        // Toast would go here
    };
    return (
        <button
            type="button"
            onClick={handleCopy}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)]"
            aria-label="Copy address"
        >
            <Copy className="h-3 w-3" />
        </button>
    );
}

export default function AgentDetailPage() {
    const params = useParams();
    const nfaAddress = params.nfa as string;
    const tokenId = params.tokenId as string;
    const { address } = useAccount();
    const { t } = useTranslation();

    const { data: agent, isLoading } = useAgent(tokenId, nfaAddress);
    const { account: agentAccount } = useAgentAccount(tokenId, nfaAddress);

    if (isLoading) {
        return (
            <AppShell>
                <div className="flex justify-center rounded-2xl border border-[var(--color-border)] bg-white/70 p-20 shadow-[var(--shadow-soft)]">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
                </div>
            </AppShell>
        );
    }

    if (!agent) {
        return (
            <AppShell>
                <div className="rounded-2xl border border-[var(--color-border)] bg-white/70 p-20 text-center shadow-[var(--shadow-soft)]">
                    <p className="text-xl text-[var(--color-muted-foreground)]">{t.agent.detail.notFound}</p>
                </div>
            </AppShell>
        );
    }

    const isOwner = address?.toLowerCase() === agent.owner.toLowerCase();
    const isRenter = address?.toLowerCase() === agent.renter.toLowerCase();

    return (
        <AppShell>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
                <div className="space-y-6">
                    <nav className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
                        <Link href="/" className="hover:text-[var(--color-primary)]">
                            {t.common.nav.market}
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-[var(--color-foreground)]">{agent.name}</span>
                    </nav>

                    <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white/72 p-6 shadow-[var(--shadow-soft)]">
                        <div className="flex flex-wrap items-center gap-2">
                            <Chip variant="sticker" className="text-sm">#{tokenId}</Chip>
                            <Chip variant={agent.status === "active" ? "burgundy" : "secondary"}>
                                {agent.status === "active"
                                    ? t.agent.detail.status.active.toUpperCase()
                                    : t.agent.detail.status.inactive.toUpperCase()}
                            </Chip>
                        </div>

                        <h1 className="page-title">
                            {agent.name}
                        </h1>

                        <p className="page-subtitle text-base">
                            {agent.description}
                        </p>

                        <div className="grid gap-3 pt-1 text-sm md:grid-cols-3">
                            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/40 p-3 text-[var(--color-muted-foreground)]">
                                <div className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide">
                                    <User className="h-4 w-4" />
                                    {t.agent.detail.status.owner}
                                </div>
                                <div className="flex items-center font-mono text-xs text-[var(--color-foreground)]">
                                    {agent.owner.slice(0, 6)}...{agent.owner.slice(-4)}
                                    <CopyButton text={agent.owner} />
                                </div>
                            </div>
                            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/40 p-3 text-[var(--color-muted-foreground)]">
                                <div className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide">
                                    <Clock className="h-4 w-4" />
                                    {t.agent.detail.status.minLease.replace("{days}", agent.minDays.toString())}
                                </div>
                            </div>
                            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/40 p-3 text-[var(--color-muted-foreground)]">
                                <div className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide">
                                    <ShieldCheck className="h-4 w-4" />
                                    {t.agent.detail.status.policyActive}
                                </div>
                            </div>
                        </div>
                    </section>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="mb-4 h-12 rounded-xl border border-[var(--color-border)] bg-white/72">
                            <TabsTrigger value="overview" className="px-6 py-2.5">
                                {t.agent.detail.tabs.overview}
                            </TabsTrigger>
                            <TabsTrigger value="history" className="px-6 py-2.5">
                                {t.agent.detail.tabs.history}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-5">
                            {(isOwner || isRenter) && (
                                <section className="rounded-2xl border border-[var(--color-border)] bg-white/72 p-4 shadow-[var(--shadow-soft)]">
                                    <VaultPanel
                                        agentAccount={agentAccount}
                                        isRenter={isRenter}
                                        isOwner={isOwner}
                                        tokenId={tokenId}
                                        readOnly
                                    />
                                </section>
                            )}

                            <PolicySummary rules={agent.policy} />
                        </TabsContent>

                        <TabsContent value="history">
                            <TransactionHistory tokenId={tokenId} />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="h-fit lg:sticky lg:top-24">
                    <ActionPanel
                        nfaAddress={nfaAddress}
                        tokenId={tokenId}
                        isActive={agent.status === "active"}
                        isOwner={isOwner}
                        isRenter={isRenter}
                        pricePerDay={agent.pricePerDay.split(" ")[0]}
                        pricePerDayRaw={agent.pricePerDayRaw}
                        minDays={agent.minDays}
                        listingId={agent.listingId}
                    />
                </div>
            </div>
        </AppShell>
    );
}
