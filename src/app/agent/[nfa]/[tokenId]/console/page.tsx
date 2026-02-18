"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useAgentAccount } from "@/hooks/useAgentAccount";
import { useAgent } from "@/hooks/useAgent";
import { TransactionHistory } from "@/components/console/transaction-history";
import { StatusCard, LeaseStatus } from "@/components/console/status-card";
import { AutopilotCard } from "@/components/console/agent-controls";
import { useAccount } from "wagmi";
import { useParams } from "next/navigation";
import { type ComponentProps, type ReactNode, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronRight, ShieldAlert } from "lucide-react";
import { useAutopilot } from "@/hooks/useAutopilot";
// useCapabilityPack removed — V3 uses composable policies
import { useAutopilotStatus } from "@/hooks/useAutopilotStatus";
import { getConsoleCopy } from "@/lib/console/console-copy";
import { VaultPanel } from "@/components/console/vault-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Address, zeroAddress } from "viem";
import Link from "next/link";
import { PageTransition } from "@/components/layout/page-transition";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { GuardrailsPanel } from "@/components/console/guardrails-panel";
import { ConsoleGuide } from "@/components/console/console-guide";
import { useInstanceConfig } from "@/hooks/useInstanceConfig";
import { AgentDashboard } from "@/components/console/agent-dashboard";
import { StrategyConfig } from "@/components/console/strategy-config";
import { useAgentDashboard } from "@/hooks/useAgentDashboard";

export default function ConsolePage() {
    const { t, language } = useTranslation();
    const params = useParams();
    const tokenId = params.tokenId as string;
    const nfaAddress = params.nfa as string;
    const detailPath = `/agent/${nfaAddress}/${tokenId}`;
    const consolePath = `${detailPath}/console`;
    const runnerOperatorDefault = getRuntimeEnv("NEXT_PUBLIC_RUNNER_OPERATOR", "");
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
    // V1 capabilityPack removed — V3 uses composable policies
    const { data: policyConfigData } = useInstanceConfig(tokenId);

    // Derive permissions from on-chain data
    const isOwner = !!address && !!agent && address.toLowerCase() === agent.owner.toLowerCase();
    const isRenter = !!address && !!agent && address.toLowerCase() === agent.renter.toLowerCase();
    const hasAccess = isOwner || isRenter;
    const hasRenter = !!agent && agent.renter.toLowerCase() !== zeroAddress.toLowerCase();
    const ui = getConsoleCopy(language);
    const roleLabel = isOwner
        ? ui.roleLabels.owner
        : isRenter
            ? ui.roleLabels.renter
            : ui.roleLabels.guest;

    const nowSec = Math.floor(Date.now() / 1000);
    const leaseStatus: LeaseStatus = !hasRenter
        ? "NOT_RENTED"
        : (agent?.expires || 0) > nowSec
            ? "RENTED_ACTIVE"
            : "RENTED_EXPIRED";
    const isRentedActive = leaseStatus === "RENTED_ACTIVE";
    const isInteractiveConsole = isRenter && isRentedActive;
    const readOnlyMessage = ui.readOnlyMessage;

    // V3: runnerMode is always "managed"
    const runnerMode = "managed" as const;

    const [refreshKey, setRefreshKey] = useState(0);

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
    const { data: dashboardData } = useAgentDashboard(tokenId, refreshKey);
    // V3: no pack blocking
    const [autopilotOperator, setAutopilotOperator] = useState<string>(
        getRuntimeEnv("NEXT_PUBLIC_RUNNER_OPERATOR", "")
    );
    const [autopilotExpiresAt, setAutopilotExpiresAt] = useState<string>("");
    const runnerOperatorLocked = (runnerStatus?.runnerOperator || runnerOperatorDefault || "").trim();
    const leaseExpiryLockedSec = agent?.expires ?? 0;

    const mapEnableAutopilotError = (error: unknown): string => {
        const raw =
            error instanceof Error
                ? error.message
                : typeof error === "string"
                    ? error
                    : ui.autopilot.toast.unknownError;
        const lower = raw.toLowerCase();

        // tokenNotAllowedByRunner removed — V3 has no static token allowlist
        if (
            lower.includes("gas required exceeds allowance") ||
            lower.includes("insufficient funds")
        ) {
            return ui.autopilotErrors.insufficientGas;
        }
        if (lower.includes("request took too long") || lower.includes("timeout")) {
            return ui.autopilotErrors.rpcTimeout;
        }
        if (lower.includes("permit.operator must equal runner operator address")) {
            return ui.autopilotErrors.operatorMismatch;
        }
        if (lower.includes("chainid mismatch")) {
            return ui.autopilotErrors.chainIdMismatch;
        }
        if (lower.includes("nfaaddress mismatch")) {
            const expected = raw.match(/expected\s+(0x[a-fA-F0-9]{40})/)?.[1] || ui.autopilotErrors.unknownExpectedAddress;
            return ui.autopilotErrors.nfaAddressMismatch(expected, nfaAddress);
        }
        return raw.slice(0, 160);
    };
    const sectionLabels = ui.sectionLabels;

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
        // V3.0: runnerMode and pack checks removed — runner handles strategy directly
        if (!/^0x[a-fA-F0-9]{40}$/.test(runnerOperatorLocked)) {
            toast.error(ui.autopilot.toast.invalidOperatorAddress);
            return;
        }
        if (!Number.isFinite(leaseExpiryLockedSec) || leaseExpiryLockedSec <= Math.floor(Date.now() / 1000)) {
            toast.error(ui.autopilot.toast.expiryFutureRequired);
            return;
        }

        try {
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
            const result = await enableAutopilot({
                operator: runnerOperatorLocked as Address,
                expires: BigInt(leaseExpiryLockedSec),
                deadline,
            });
            toast.success(ui.autopilot.toast.enabledSuccess, {
                description: `${ui.autopilot.toast.txPrefix}: ${result.txHash.slice(0, 10)}...`,
            });
            setRefreshKey((k) => k + 1);
        } catch (err) {
            toast.error(ui.autopilot.toast.enableFailed, {
                description: mapEnableAutopilotError(err),
            });
        }
    };

    const handleDisableAutopilot = async () => {
        try {
            const result = await clearAutopilot();
            toast.success(ui.autopilot.toast.disabledSuccess, {
                description: `${ui.autopilot.toast.txPrefix}: ${result.txHash.slice(0, 10)}...`,
            });
            setRefreshKey((k) => k + 1);
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
        const leaseExpires = agent?.expires;
        if (!leaseExpires) return;
        setAutopilotExpiresAt(formatLocalInput(leaseExpires));
    }, [agent?.expires]);

    useEffect(() => {
        if (!runnerOperatorLocked) return;
        setAutopilotOperator(runnerOperatorLocked);
    }, [runnerOperatorLocked]);

    // Show loading while fetching agent data
    if (isAgentLoading) {
        return (
            <AppShell>
                <div className="flex justify-center rounded-2xl border border-[var(--color-border)] bg-white/70 p-10 md:p-12 shadow-[var(--shadow-soft)]">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-primary)]"></div>
                </div>
            </AppShell>
        );
    }

    if (agentError) {
        return (
            <AppShell>
                <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-[var(--color-border)] bg-white/70 p-8 md:p-10 text-center shadow-[var(--shadow-soft)]">
                    <ShieldAlert className="mx-auto h-12 w-12 text-[var(--color-primary)]" />
                    <h2 className="text-2xl font-serif font-bold text-[var(--color-primary)]">
                        {t.agent.console.page.title}
                    </h2>
                    <p className="text-[var(--color-muted-foreground)]">
                        {ui.errorLoadAgent}
                    </p>
                    <p className="break-all font-mono text-xs text-[var(--color-muted-foreground)]">
                        {agentError.message}
                    </p>
                    <div className="flex justify-center gap-2 pt-2">
                        <Link
                            href={detailPath}
                            className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm hover:bg-[var(--color-secondary)]"
                        >
                            {ui.goAgentDetail}
                        </Link>
                        <Link
                            href="/docs"
                            className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm hover:bg-[var(--color-secondary)]"
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
                <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-[var(--color-border)] bg-white/70 p-8 md:p-10 text-center shadow-[var(--shadow-soft)]">
                    <ShieldAlert className="mx-auto h-12 w-12 text-[var(--color-primary)]" />
                    <h2 className="text-2xl font-serif font-bold text-[var(--color-primary)]">
                        {t.agent.console.page.title}
                    </h2>
                    <p className="text-[var(--color-muted-foreground)]">
                        {!address
                            ? t.agent.console.page.connectWallet
                            : hasRenter
                                ? ui.consoleBlockedRentedByOther
                                : ui.consoleBlockedNotRented}
                    </p>
                    <PageSection tone="muted" className="text-left text-xs text-[var(--color-muted-foreground)]">
                        <div className="font-medium text-[var(--color-foreground)]">{ui.nextStepTitle}</div>
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
                    </PageSection>
                    <div className="flex justify-center gap-2 pt-2">
                        <Link
                            href={detailPath}
                            className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm hover:bg-[var(--color-secondary)]"
                        >
                            {ui.goAgentDetail}
                        </Link>
                        <Link
                            href="/me"
                            className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm hover:bg-[var(--color-secondary)]"
                        >
                            {t.common.nav.me}
                        </Link>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell fullWidth>
            <PageTransition className="space-y-6">
                <nav className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
                    <Link href="/market" className="hover:text-[var(--color-primary)]">
                        {t.common.nav.market}
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link href={detailPath} className="hover:text-[var(--color-primary)]">
                        {ui.agentDetail}
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-[var(--color-foreground)]">{t.agent.detail.tabs.console}</span>
                </nav>
                <PageHeader
                    title={t.agent.console.page.title}
                    subtitle={t.agent.console.page.subtitle}
                    rightSlot={
                        <>
                            <div className="text-sm font-medium">{t.agent.console.page.agentId}: #{tokenId}</div>
                            <div className="font-mono text-xs text-[var(--color-muted-foreground)]">
                                {agentAccount || (isAccountLoading ? t.agent.detail.loading : t.agent.console.page.unknown)}
                            </div>
                        </>
                    }
                />

                <PageSection tone="muted" className="text-xs text-[var(--color-muted-foreground)]">
                    <div>
                        <span className="font-medium text-[var(--color-foreground)]">{ui.currentRole}: </span>
                        {roleLabel}
                    </div>
                    <div className="pt-1">
                        {isRenter
                            ? ui.roleHintRenter
                            : isOwner
                                ? ui.roleHintOwner
                                : ui.roleHintGuest}
                    </div>
                </PageSection>

                {/* ═══ Quick Guide Banner ═══ */}
                <ConsoleGuide guide={ui.guide} tokenId={tokenId} />

                {/* ═══ Mobile View: 3 Tabs ═══ */}
                <div className="lg:hidden">
                    <Tabs defaultValue="control" className="w-full">
                        <TabsList className="grid h-12 w-full grid-cols-3 rounded-xl border border-[var(--color-border)] bg-white/72 p-1">
                            <TabsTrigger value="control" className="text-sm font-semibold">{sectionLabels.control}</TabsTrigger>
                            <TabsTrigger value="vault" className="text-sm font-semibold">{sectionLabels.vault}</TabsTrigger>
                            <TabsTrigger value="history" className="text-sm font-semibold">{sectionLabels.history}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="control" className="mt-4 space-y-4">
                            <ConsoleControlSection
                                ui={ui}
                                runnerMode={runnerMode}
                                enableState={enableState}
                                operatorNonce={operatorNonce}
                                onchainOperator={onchainOperator}
                                operatorExpires={operatorExpires}
                                agent={agent}
                                autopilotOperator={autopilotOperator}
                                autopilotExpiresAt={autopilotExpiresAt}
                                runnerOperatorDefault={runnerOperatorDefault}
                                runnerStatus={runnerStatus}
                                isRunnerStatusLoading={isRunnerStatusLoading}
                                autopilotBlockedByPack={false}
                                isInteractiveConsole={isInteractiveConsole}
                                isRenter={isRenter}
                                isOwner={isOwner}
                                isEnablingAutopilot={isEnablingAutopilot}
                                isClearingAutopilot={isClearingAutopilot}
                                setAutopilotOperator={setAutopilotOperator}
                                setAutopilotExpiresAt={setAutopilotExpiresAt}
                                handleEnableAutopilot={handleEnableAutopilot}
                                handleDisableAutopilot={handleDisableAutopilot}
                                tokenId={tokenId}
                                dashboardStrategy={dashboardData?.strategy ?? null}
                                language={language === "zh" ? "zh" : "en"}
                                refreshKey={refreshKey}
                                onStrategyChanged={() => setRefreshKey((k) => k + 1)}
                            />
                            {/* Settings folded into Control tab on mobile */}
                            <GuardrailsPanel
                                tokenId={tokenId}
                                policyId={policyConfigData?.policyId}
                                version={policyConfigData?.version}
                                isInteractive={isInteractiveConsole}
                                language={language === "zh" ? "zh" : "en"}
                            />
                        </TabsContent>

                        <TabsContent value="vault" className="mt-4">
                            <VaultPanel
                                agentAccount={agentAccount}
                                isRenter={isRenter}
                                isOwner={isOwner}
                                tokenId={tokenId}
                                refreshKey={refreshKey}
                                readOnly={!isInteractiveConsole}
                                allowWithdraw={isInteractiveConsole}
                            />
                        </TabsContent>

                        <TabsContent value="history" className="mt-4">
                            <TransactionHistory tokenId={tokenId} nfaAddress={nfaAddress} refreshKey={refreshKey} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* ═══ Desktop View: 2-Column Grid ═══ */}
                <div className="hidden lg:grid lg:grid-cols-[3fr_2fr] lg:gap-8">
                    {/* Left Column: Primary Operations */}
                    <div className="space-y-6">
                        {/* Autopilot (collapsible, first position) */}
                        <CollapsibleSection
                            title={ui.autopilot.title}
                            desc={ui.sectionDesc.autopilot}
                            defaultOpen={true}
                        >
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
                                lockOperatorInput
                                lockExpiryInput
                                blockedByPack={false}
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
                        </CollapsibleSection>

                        {/* Execution Parameters — only for DCA agents (based on on-chain agentType) */}
                        {agent?.agentType === "DCA" && (
                            <CollapsibleSection
                                title={language === "zh" ? "执行参数" : "Execution Parameters"}
                                desc={language === "zh" ? "配置 DCA 策略的交易参数。" : "Configure DCA strategy trading parameters."}
                                defaultOpen={!dashboardData?.strategy}
                            >
                                <StrategyConfig
                                    tokenId={tokenId}
                                    agentType="dca"
                                    currentStrategy={dashboardData?.strategy ? {
                                        strategyType: dashboardData.strategy.strategyType,
                                        enabled: dashboardData.strategy.enabled,
                                        strategyParams: dashboardData.strategy.strategyParams,
                                        minIntervalMs: dashboardData.strategy.minIntervalMs,
                                    } : null}
                                    isInteractive={isInteractiveConsole}
                                    language={language === "zh" ? "zh" : "en"}
                                    onSaved={() => setRefreshKey((k) => k + 1)}
                                />
                            </CollapsibleSection>
                        )}

                        {/* Policy Settings (collapsible) */}
                        <section className="space-y-2">
                            <GuardrailsPanel
                                tokenId={tokenId}
                                policyId={policyConfigData?.policyId}
                                version={policyConfigData?.version}
                                isInteractive={isInteractiveConsole}
                                language={language === "zh" ? "zh" : "en"}
                            />
                        </section>
                    </div>

                    {/* Right Column: Info Panel (Tabbed) */}
                    <div>
                        <Tabs defaultValue="dashboard" className="w-full">
                            <TabsList className="grid h-10 w-full grid-cols-4 rounded-lg border border-[var(--color-border)] bg-white/72 p-0.5">
                                <TabsTrigger value="dashboard" className="text-sm font-semibold">{language === "zh" ? "仪表盘" : "Dashboard"}</TabsTrigger>
                                <TabsTrigger value="status" className="text-sm font-semibold">{ui.status.title}</TabsTrigger>
                                <TabsTrigger value="vault" className="text-sm font-semibold">{sectionLabels.vault}</TabsTrigger>
                                <TabsTrigger value="history" className="text-sm font-semibold">{sectionLabels.history}</TabsTrigger>
                            </TabsList>

                            <TabsContent value="dashboard" className="mt-3 space-y-4">
                                <AgentDashboard
                                    tokenId={tokenId}
                                    refreshKey={refreshKey}
                                    language={language === "zh" ? "zh" : "en"}
                                />
                            </TabsContent>

                            <TabsContent value="status" className="mt-3 space-y-4">
                                <p className="text-xs text-[var(--color-muted-foreground)]">{ui.sectionDesc.status}</p>
                                <StatusCard
                                    tokenId={tokenId}
                                    leaseStatus={leaseStatus}
                                    leaseExpires={agent?.expires}
                                    agentType={agent?.agentType}
                                    language={language === "zh" ? "zh" : "en"}
                                />
                            </TabsContent>

                            <TabsContent value="vault" className="mt-3 space-y-4">
                                <p className="text-xs text-[var(--color-muted-foreground)]">{ui.sectionDesc.vault}</p>
                                <VaultPanel
                                    agentAccount={agentAccount}
                                    isRenter={isRenter}
                                    isOwner={isOwner}
                                    tokenId={tokenId}
                                    refreshKey={refreshKey}
                                    readOnly={!isInteractiveConsole}
                                    allowWithdraw={isInteractiveConsole}
                                />
                            </TabsContent>

                            <TabsContent value="history" className="mt-3 space-y-4">
                                <p className="text-xs text-[var(--color-muted-foreground)]">{ui.sectionDesc.history}</p>
                                <TransactionHistory tokenId={tokenId} nfaAddress={nfaAddress} refreshKey={refreshKey} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </PageTransition>
        </AppShell>
    );
}

// Section header with description for desktop layout
function SectionHeader({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="space-y-0.5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                {title}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)]/70">{desc}</p>
        </div>
    );
}

// Collapsible section with header bar, description, and animated expand/collapse
function CollapsibleSection({
    title,
    desc,
    defaultOpen = true,
    children,
}: {
    title: string;
    desc: string;
    defaultOpen?: boolean;
    children: ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <section className="rounded-xl border border-[var(--color-border)] bg-white/60 overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50/60 transition-colors"
            >
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                        {title}
                    </h3>
                    <p className="text-xs text-[var(--color-muted-foreground)]/70 mt-0.5">{desc}</p>
                </div>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[var(--color-muted-foreground)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && <div className="px-4 pb-4">{children}</div>}
        </section>
    );
}

// Helper component for Mobile Control Tab
function ConsoleControlSection({
    ui, runnerMode, enableState, operatorNonce, onchainOperator, operatorExpires, agent,
    autopilotOperator, autopilotExpiresAt, runnerOperatorDefault, runnerStatus, isRunnerStatusLoading,
    autopilotBlockedByPack, isInteractiveConsole, isRenter, isOwner, isEnablingAutopilot, isClearingAutopilot,
    setAutopilotOperator, setAutopilotExpiresAt, handleEnableAutopilot, handleDisableAutopilot,
    tokenId, dashboardStrategy, language, refreshKey, onStrategyChanged,
}: ConsoleControlSectionProps) {
    return (
        <div className="space-y-4">
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
                lockOperatorInput
                lockExpiryInput
                blockedByPack={false}
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

            <AgentDashboard
                tokenId={tokenId}
                refreshKey={refreshKey}
                language={language}
            />

            {/* Execution Parameters — only for DCA agents */}
            {dashboardStrategy?.strategyType === "dca" && (
                <StrategyConfig
                    tokenId={tokenId}
                    agentType={dashboardStrategy.strategyType}
                    currentStrategy={{
                        strategyType: dashboardStrategy.strategyType,
                        enabled: dashboardStrategy.enabled,
                        strategyParams: dashboardStrategy.strategyParams,
                        minIntervalMs: dashboardStrategy.minIntervalMs,
                    }}
                    isInteractive={isInteractiveConsole}
                    language={language}
                    onSaved={onStrategyChanged}
                />
            )}
        </div>
    );
}

type ConsoleControlSectionProps = {
    ui: ReturnType<typeof getConsoleCopy>;
    runnerMode: "managed" | "manual" | "external";
    enableState: ComponentProps<typeof AutopilotCard>["enableState"];
    operatorNonce: bigint;
    onchainOperator: string | null;
    operatorExpires: bigint;
    agent?: { expires?: number; renter?: string } | null;
    autopilotOperator: string;
    autopilotExpiresAt: string;
    runnerOperatorDefault?: string;
    runnerStatus: ComponentProps<typeof AutopilotCard>["runnerStatus"];
    isRunnerStatusLoading: boolean;
    autopilotBlockedByPack?: boolean;
    isInteractiveConsole: boolean;
    isRenter: boolean;
    isOwner: boolean;
    isEnablingAutopilot: boolean;
    isClearingAutopilot: boolean;
    setAutopilotOperator: (value: string) => void;
    setAutopilotExpiresAt: (value: string) => void;
    handleEnableAutopilot: () => void;
    handleDisableAutopilot: () => void;
    tokenId: string;
    dashboardStrategy: {
        strategyType: string;
        enabled: boolean;
        strategyParams: Record<string, unknown>;
        minIntervalMs: number;
    } | null;
    language: "en" | "zh";
    refreshKey: number;
    onStrategyChanged: () => void;
};
