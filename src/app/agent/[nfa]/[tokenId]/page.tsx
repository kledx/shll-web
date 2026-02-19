"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PolicySummary } from "@/components/business/policy-summary";
import { ActionPanel } from "@/components/business/action-panel";
import { AgentSettings } from "@/components/business/agent-settings";
import { useAccount } from "wagmi";
import { useParams } from "next/navigation";
import { Chip } from "@/components/ui/chip";
import { ChevronRight, Clock, ShieldCheck, User, BrainCircuit } from "lucide-react";
import { useAgent } from "@/hooks/useAgent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionHistory } from "@/components/console/transaction-history";
import { VaultPanel } from "@/components/console/vault-panel";
import { useAgentAccount } from "@/hooks/useAgentAccount";
import { Copy } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { RiskPanel } from "@/components/agent/risk-panel";
import { FAQSection } from "@/components/agent/faq-section";
import { PageTransition } from "@/components/layout/page-transition";
import { PageSection } from "@/components/layout/page-section";

function CopyButton({ text }: { text: string }) {
    const { language } = useTranslation();
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        // Toast would go here
    };
    return (
        <button
            type="button"
            onClick={handleCopy}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)]"
            aria-label={language === "zh" ? "复制地址" : "Copy address"}
        >
            <span className="sr-only">Copy</span>
            <Copy className="h-3 w-3" />
        </button>
    );
}

export default function AgentDetailPage() {
    const params = useParams();
    const nfaAddress = params.nfa as string;
    const tokenId = params.tokenId as string;
    const { address } = useAccount();
    const { t, language } = useTranslation();

    const { data: agent, isLoading, error } = useAgent(tokenId, nfaAddress);
    const { account: agentAccount } = useAgentAccount(tokenId, nfaAddress);

    if (isLoading) {
        return (
            <AppShell>
                <div className="flex justify-center rounded-2xl border border-[var(--color-border)] bg-white/70 p-10 md:p-12 shadow-[var(--shadow-soft)]">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
                </div>
            </AppShell>
        );
    }

    if (!agent && error) {
        return (
            <AppShell>
                <div className="rounded-2xl border border-[var(--color-border)] bg-white/70 p-10 md:p-12 text-center shadow-[var(--shadow-soft)]">
                    <p className="text-xl text-[var(--color-muted-foreground)]">{t.agent.detail.notFound}</p>
                    <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{String(error.message || error)}</p>
                </div>
            </AppShell>
        );
    }

    if (!agent) {
        return (
            <AppShell>
                <div className="rounded-2xl border border-[var(--color-border)] bg-white/70 p-10 md:p-12 text-center shadow-[var(--shadow-soft)]">
                    <p className="text-xl text-[var(--color-muted-foreground)]">{t.agent.detail.notFound}</p>
                </div>
            </AppShell>
        );
    }

    const isOwner = address?.toLowerCase() === agent.owner.toLowerCase();
    const isRenter = address?.toLowerCase() === agent.renter.toLowerCase();
    const isValidOwner = /^0x[a-fA-F0-9]{40}$/.test(agent.owner);
    const ownerDisplay = isValidOwner
        ? `${agent.owner.slice(0, 6)}...${agent.owner.slice(-4)}`
        : "-";
    const minLeaseDisplay = agent.isListed
        ? t.agent.detail.status.minLease.replace("{days}", agent.minDays.toString())
        : t.agent.detail.status.notListed;

    return (
        <AppShell fullWidth>
            <PageTransition className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
                <div className="space-y-6">
                    <nav className="flex items-center gap-1 text-sm text-[var(--color-muted-foreground)]">
                        <Link href="/market" className="hover:text-[var(--color-primary)]">
                            {t.common.nav.market}
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-[var(--color-foreground)]">{agent.name}</span>
                    </nav>

                    <PageSection as="section" className="space-y-4">
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
                                <div className="mb-1 flex items-center gap-1 text-sm uppercase tracking-wide">
                                    <User className="h-4 w-4" />
                                    {t.agent.detail.status.owner}
                                </div>
                                <div className="flex items-center font-mono text-sm text-[var(--color-foreground)]">
                                    {ownerDisplay}
                                    {isValidOwner && <CopyButton text={agent.owner} />}
                                </div>
                            </div>
                            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/40 p-3 text-[var(--color-muted-foreground)]">
                                <div className="mb-1 flex items-center gap-1 text-sm uppercase tracking-wide">
                                    <Clock className="h-4 w-4" />
                                    {minLeaseDisplay}
                                </div>
                            </div>
                            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/40 p-3 text-[var(--color-muted-foreground)]">
                                <div className="mb-1 flex items-center gap-1 text-sm uppercase tracking-wide">
                                    <ShieldCheck className="h-4 w-4" />
                                    {t.agent.detail.status.policyActive}
                                </div>
                            </div>
                        </div>
                    </PageSection>

                    {/* Renter CTA — prominent link to Console */}
                    {isRenter && (
                        <Link
                            href={`/agent/${nfaAddress}/${tokenId}/console`}
                            className="flex items-center justify-between rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-5 py-4 shadow-sm transition-all hover:shadow-md hover:border-violet-300 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-violet-100 p-2 text-violet-600 group-hover:bg-violet-200 transition-colors">
                                    <BrainCircuit className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-violet-900">
                                        {language === "zh" ? "打开控制台" : "Open Console"}
                                    </div>
                                    <div className="text-sm text-violet-600">
                                        {language === "zh" ? "管理您的 Agent、发送指令、查看余额" : "Manage your agent, send instructions, view vault"}
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-violet-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    )}

                    {/* RISK PANEL */}
                    <RiskPanel />


                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="mb-4 h-12 rounded-xl border border-[var(--color-border)] bg-white/72">
                            <TabsTrigger value="overview" className="px-6 py-2.5">
                                {t.agent.detail.tabs.overview}
                            </TabsTrigger>
                            <TabsTrigger value="history" className="px-6 py-2.5">
                                {t.agent.detail.tabs.history}
                            </TabsTrigger>
                            <TabsTrigger value="faq" className="px-6 py-2.5">
                                {t.agent.detail.tabs.faq}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-5">
                            {(isOwner || isRenter) && (
                                <PageSection as="section" compact>
                                    <VaultPanel
                                        agentAccount={agentAccount}
                                        isRenter={isRenter}
                                        isOwner={isOwner}
                                        tokenId={tokenId}
                                        readOnly
                                    />
                                </PageSection>
                            )}

                            <PolicySummary rules={agent.policy} v14Policy={agent.v14Policy} />

                            {(isOwner || isRenter) && (
                                <AgentSettings
                                    tokenId={BigInt(tokenId)}
                                    isRenter={isRenter}
                                    isOwner={isOwner}
                                    v14Params={agent.v14Policy}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="history">
                            <TransactionHistory tokenId={tokenId} />
                        </TabsContent>

                        <TabsContent value="faq">
                            <FAQSection />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="h-fit lg:sticky lg:top-24">
                    <ActionPanel
                        nfaAddress={nfaAddress}
                        tokenId={tokenId}
                        isActive={agent.status === "active"}
                        isListed={agent.isListed}
                        isTemplateListing={agent.isTemplateListing}
                        isOwner={isOwner}
                        isRenter={isRenter}
                        pricePerDay={agent.pricePerDay.split(" ")[0]}
                        pricePerDayRaw={agent.pricePerDayRaw}
                        minDays={agent.minDays}
                        listingId={agent.listingId}
                    />
                </div>
            </PageTransition>
        </AppShell>
    );
}
