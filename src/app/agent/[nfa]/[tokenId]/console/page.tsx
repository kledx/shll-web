"use client";

import { AppShell } from "@/components/ui/app-shell";
import { ActionBuilder } from "@/components/console/action-builder";
import { Action, TemplateKey } from "@/components/console/action-types";
import { useAgentAccount } from "@/hooks/useAgentAccount";
import { useAgent } from "@/hooks/useAgent";
import { useExecute } from "@/hooks/useExecute";
import { TransactionHistory } from "@/components/console/transaction-history";
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
import { VaultPanel } from "@/components/console/vault-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        const templateMap: Record<string, TemplateKey> = {
            "swap": "swap",
            "swap.pancakev2": "swap",
            "repay": "repay",
            "repay.venus": "repay",
            "raw": "raw",
        };

        const normalizeTemplate = (value: string): TemplateKey | null => {
            const key = value.trim().toLowerCase();
            return templateMap[key] ?? null;
        };

        if (packStatus !== "PACK_VALID") {
            return [];
        }

        const rawEnabled = capabilityPack.capabilities?.rawEnabled === true;
        const templates = (capabilityPack.capabilities?.consoleTemplates || [])
            .map(normalizeTemplate)
            .filter((item): item is TemplateKey => item !== null)
            .filter((item) => item !== "raw" || rawEnabled);

        const deduped = Array.from(new Set(templates));
        return deduped;
    }, [capabilityPack.capabilities?.consoleTemplates, capabilityPack.capabilities?.rawEnabled, packStatus]);

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
    const isAutopilotOn = runnerStatus?.autopilot?.enabled === true;
    const strictPackValid = packStatus === "PACK_VALID";
    const manualExecuteEnabledByPack = capabilityPack.capabilities?.manualExecuteEnabled;
    const disableWhenAutopilotOn =
        capabilityPack.capabilities?.manualExecuteDisableWhenAutopilotOn ?? true;
    const executeAllowedByMode = (() => {
        if (runnerMode === "external") {
            return manualExecuteEnabledByPack === true;
        }
        return manualExecuteEnabledByPack ?? true;
    })();
    const executeDisabledByAutopilot =
        (runnerMode === "managed" || runnerMode === "external") &&
        disableWhenAutopilotOn &&
        isAutopilotOn;
    const executeDisabledByMode = !executeAllowedByMode;
    const executeDisabled = executeDisabledByAutopilot || executeDisabledByMode;
    const executeDisabledByModeMessage = language === "zh"
        ? (
            runnerMode === "external"
                ? "External 模式默认禁用手动 Execute，请在 capability pack 中显式开启。"
                : "当前 capability pack 已禁用手动 Execute。"
        )
        : (
            runnerMode === "external"
                ? "External mode disables manual Execute by default. Enable it explicitly in capability pack."
                : "Manual Execute is disabled by capability pack policy."
        );
    const executeDisabledMessage = executeDisabledByAutopilot
        ? ui.executeDisabledByAutopilot
        : executeDisabledByMode
            ? executeDisabledByModeMessage
            : undefined;
    const showActionBuilder =
        strictPackValid && enabledTemplates.length > 0 && isInteractiveConsole;
    const actionBuilderHiddenHint = !strictPackValid
        ? (language === "zh"
            ? "能力包校验失败，交易构建器已隐藏。"
            : "Capability pack validation failed. Transaction builder is hidden.")
        : enabledTemplates.length === 0
            ? (language === "zh"
                ? "能力包未声明可用模板。"
                : "No supported console templates in capability pack.")
            : null;
    const autopilotBlockedByPack = !strictPackValid;
    const [autopilotOperator, setAutopilotOperator] = useState<string>(
        process.env.NEXT_PUBLIC_RUNNER_OPERATOR || ""
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

        if (lower.includes("tokenid not allowed by runner")) {
            return language === "zh"
                ? "Runner 未放行该 Agent。请在 runner 配置 `ALLOWED_TOKEN_IDS` 中加入当前 tokenId。"
                : "Runner has not allowed this agent. Add the tokenId to runner `ALLOWED_TOKEN_IDS`.";
        }
        if (
            lower.includes("gas required exceeds allowance") ||
            lower.includes("insufficient funds")
        ) {
            return language === "zh"
                ? "Runner 操作地址 gas 不足。请给 Runner Operator 地址充值测试 BNB 后重试。"
                : "Runner operator has insufficient gas. Fund the runner operator address and retry.";
        }
        if (lower.includes("request took too long") || lower.includes("timeout")) {
            return language === "zh"
                ? "RPC 请求超时。请切换到更稳定的 RPC 节点后重试。"
                : "RPC request timed out. Switch to a more stable RPC endpoint and retry.";
        }
        if (lower.includes("permit.operator must equal runner operator address")) {
            return language === "zh"
                ? "Permit 中的 operator 与 Runner 实际地址不一致，请使用 Runner 当前地址。"
                : "Permit operator does not match runner operator address. Use the current runner operator.";
        }
        if (lower.includes("chainid mismatch")) {
            return language === "zh"
                ? "链 ID 不匹配，请确认前端、Runner、钱包都在同一网络。"
                : "Chain ID mismatch. Ensure frontend, runner, and wallet are on the same network.";
        }
        if (lower.includes("nfaaddress mismatch")) {
            const expected = raw.match(/expected\s+(0x[a-fA-F0-9]{40})/)?.[1];
            return language === "zh"
                ? `AgentNFA 地址不匹配。Runner 期望 ${expected || "未知地址"}，当前页面为 ${nfaAddress}。`
                : `AgentNFA address mismatch. Runner expects ${expected || "unknown address"}, current page uses ${nfaAddress}.`;
        }
        return raw.slice(0, 160);
    };
    const actionScopeHint =
        language === "zh"
            ? "动作模板用于声明当前 Agent 的可执行动作/权限边界，并不放权。所有链上执行仍会被 PolicyGuard 二次校验。"
            : "Action templates define this agent's allowed action/permission boundary. They do not bypass controls. Every on-chain execution is still enforced by PolicyGuard.";
    const sectionLabels = language === "zh"
        ? {
            control: "控制",
            vault: "金库",
            history: "历史",
        }
        : {
            control: "Control",
            vault: "Vault",
            history: "History",
        };
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
        if (executeDisabled) {
            toast.error(executeDisabledMessage || ui.executeDisabledByAutopilot);
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
        if (runnerMode === "manual") {
            toast.error(ui.autopilot.modeManagedOnlyHint);
            return;
        }
        if (autopilotBlockedByPack) {
            toast.error(ui.autopilot.blockedByPackHint);
            return;
        }
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
                <div className="flex justify-center rounded-2xl border border-[var(--color-border)] bg-white/70 p-20 shadow-[var(--shadow-soft)]">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-primary)]"></div>
                </div>
            </AppShell>
        );
    }

    if (agentError) {
        return (
            <AppShell>
                <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-[var(--color-border)] bg-white/70 p-10 text-center shadow-[var(--shadow-soft)]">
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
                <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-[var(--color-border)] bg-white/70 p-10 text-center shadow-[var(--shadow-soft)]">
                    <ShieldAlert className="mx-auto h-12 w-12 text-[var(--color-primary)]" />
                    <h2 className="text-2xl font-serif font-bold text-[var(--color-primary)]">
                        {t.agent.console.page.title}
                    </h2>
                    <p className="text-[var(--color-muted-foreground)]">
                        {!address
                            ? (t.agent.console.page.connectWallet || "Please connect your wallet to access the console.")
                            : (t.agent.console.page.noAccess || "You must be the owner or active renter of this agent to use the console.")}
                    </p>
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/45 px-4 py-3 text-left text-xs text-[var(--color-muted-foreground)]">
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
                    </div>
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
        <AppShell>
            <div className="mx-auto max-w-4xl space-y-6">
                <nav className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
                    <Link href="/" className="hover:text-[var(--color-primary)]">
                        {t.common.nav.market}
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link href={detailPath} className="hover:text-[var(--color-primary)]">
                        {ui.agentDetail}
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-[var(--color-foreground)]">{t.agent.detail.tabs.console}</span>
                </nav>
                <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-white/72 p-6 shadow-[var(--shadow-soft)] md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="page-title text-3xl">
                            {t.agent.console.page.title}
                        </h1>
                        <p className="page-subtitle mt-2 text-sm md:text-base">
                            {t.agent.console.page.subtitle}
                        </p>
                    </div>
                    <div className="text-left md:text-right">
                        <div className="text-sm font-medium">{t.agent.console.page.agentId}: #{tokenId}</div>
                        <div className="font-mono text-xs text-[var(--color-muted-foreground)]">
                            {agentAccount || (isAccountLoading ? t.agent.detail.loading : t.agent.console.page.unknown)}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/45 px-4 py-3 text-xs text-[var(--color-muted-foreground)]">
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

                <Tabs defaultValue="control" className="w-full">
                    <TabsList className="grid h-12 w-full grid-cols-3 rounded-xl border border-[var(--color-border)] bg-white/72 p-1">
                        <TabsTrigger
                            value="control"
                            className="text-sm font-semibold"
                        >
                            {sectionLabels.control}
                        </TabsTrigger>
                        <TabsTrigger
                            value="vault"
                            className="text-sm font-semibold"
                        >
                            {sectionLabels.vault}
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="text-sm font-semibold"
                        >
                            {sectionLabels.history}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="control" className="mt-4 space-y-4">
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

                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/40 px-4 py-3 text-xs text-[var(--color-muted-foreground)]">
                            {actionScopeHint}
                        </div>

                        {showActionBuilder ? (
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
                                executeDisabled={executeDisabled}
                                executeDisabledMessage={executeDisabledMessage}
                                templateBoundaryHint={ui.templateBoundaryHint}
                            />
                        ) : actionBuilderHiddenHint ? (
                            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                {actionBuilderHiddenHint}
                            </div>
                        ) : null}
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
        </AppShell>
    );
}


