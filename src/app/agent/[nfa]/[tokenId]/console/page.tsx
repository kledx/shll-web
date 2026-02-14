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
import { ChevronRight, ShieldAlert } from "lucide-react";
import { useAutopilot } from "@/hooks/useAutopilot";
import { toast } from "sonner";
import { Address } from "viem";
import Link from "next/link";

export default function ConsolePage() {
    const { t, language } = useTranslation();
    const params = useParams();
    const tokenId = params.tokenId as string;
    const nfaAddress = params.nfa as string;
    const detailPath = `/agent/${nfaAddress}/${tokenId}`;
    const consolePath = `${detailPath}/console`;
    const runnerOperatorDefault = process.env.NEXT_PUBLIC_RUNNER_OPERATOR || "";

    const { address } = useAccount();
    const { data: agent, isLoading: isAgentLoading, error: agentError } = useAgent(tokenId, nfaAddress);
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
    const roleLabel = isOwner
        ? (language === "zh" ? "所有者" : "Owner")
        : isRenter
            ? (language === "zh" ? "当前租户" : "Active Renter")
            : (language === "zh" ? "无权限" : "No Access");
    const ui = language === "zh"
        ? {
            errorLoadAgent: "加载 Agent 链上数据失败。",
            goAgentDetail: "返回 Agent 详情",
            openDocs: "打开文档",
            nextStepTitle: "下一步建议",
            nextStepConnect: "先连接钱包，再重新进入控制台。",
            nextStepRent: "请先在 Agent 详情页完成租用/续租，再返回控制台。",
            nextStepPathConnect: "/me -> 连接钱包 -> 返回控制台",
            nextStepPathRentPrefix: "路径: ",
            agentDetail: "Agent 详情",
            currentRole: "当前角色",
            roleHintOwner: "你可以查看记录和关闭 Autopilot，但只有当前租户可以签名开启。",
            roleHintRenter: "你可以模拟、执行，并通过签名开启 Autopilot。",
            roleHintGuest: "请切换到所有者/租户钱包，或先完成租用。",
            autopilot: {
                title: "Autopilot",
                nonce: "Nonce",
                onchainOperator: "链上 Operator",
                operatorExpires: "Operator 过期时间",
                notSet: "未设置",
                operatorAddress: "Operator 地址",
                useDefaultRunner: "使用默认 Runner 地址",
                operatorExpiresInput: "Operator 过期时间",
                hint: "提示: operator 应填写 Runner 地址，过期时间不要超过租期。",
                enabling: "启用中...",
                enable: "启用 Autopilot (签名)",
                disabling: "关闭中...",
                disable: "关闭 Autopilot",
                renterOnlyHint: "仅当前租户可签名 Operator Permit。",
                toast: {
                    invalidOperatorAddress: "Operator 地址格式无效",
                    selectOperatorExpiry: "请选择 Operator 过期时间",
                    expiryFutureRequired: "Operator 过期时间必须晚于当前时间",
                    enabledSuccess: "Autopilot 已启用",
                    enableFailed: "启用 Autopilot 失败",
                    disabledSuccess: "Autopilot 已关闭",
                    disableFailed: "关闭 Autopilot 失败",
                    unknownError: "未知错误",
                    txPrefix: "交易",
                },
            },
        }
        : {
            errorLoadAgent: "Failed to load agent on-chain data.",
            goAgentDetail: "Go to Agent Detail",
            openDocs: "Open Docs",
            nextStepTitle: "What to do next",
            nextStepConnect: "Connect wallet first, then reopen this console.",
            nextStepRent: "Rent or extend first on Agent Detail, then come back to Console.",
            nextStepPathConnect: "/me -> connect wallet -> back to console",
            nextStepPathRentPrefix: "Path: ",
            agentDetail: "Agent Detail",
            currentRole: "Current Role",
            roleHintOwner: "You can inspect history and disable autopilot, but only active renter can sign enable permit.",
            roleHintRenter: "You can simulate, execute, and enable autopilot with signature.",
            roleHintGuest: "Switch to owner/renter wallet or rent this agent first.",
            autopilot: {
                title: "Autopilot",
                nonce: "Nonce",
                onchainOperator: "On-chain operator",
                operatorExpires: "Operator expires",
                notSet: "not set",
                operatorAddress: "Operator Address",
                useDefaultRunner: "Use default runner operator",
                operatorExpiresInput: "Operator Expires",
                hint: "Tip: operator should be the runner address. Expiry should not exceed your rental period.",
                enabling: "Enabling...",
                enable: "Enable Autopilot (Sign)",
                disabling: "Disabling...",
                disable: "Disable Autopilot",
                renterOnlyHint: "Only active renter can sign operator permit.",
                toast: {
                    invalidOperatorAddress: "Invalid operator address",
                    selectOperatorExpiry: "Please select operator expiry",
                    expiryFutureRequired: "Operator expiry must be in the future",
                    enabledSuccess: "Autopilot enabled",
                    enableFailed: "Enable autopilot failed",
                    disabledSuccess: "Autopilot disabled",
                    disableFailed: "Disable autopilot failed",
                    unknownError: "Unknown error",
                    txPrefix: "Tx",
                },
            },
        };

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
            toast.error(ui.autopilot.toast.invalidOperatorAddress);
            return;
        }
        if (!autopilotExpiresAt) {
            toast.error(ui.autopilot.toast.selectOperatorExpiry);
            return;
        }

        const expiresSec = Math.floor(
            new Date(autopilotExpiresAt).getTime() / 1000
        );
        if (!Number.isFinite(expiresSec) || expiresSec <= Math.floor(Date.now() / 1000)) {
            toast.error(ui.autopilot.toast.expiryFutureRequired);
            return;
        }

        try {
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
            const result = await enableAutopilot({
                operator: autopilotOperator as Address,
                expires: BigInt(expiresSec),
                deadline,
            });
            toast.success(ui.autopilot.toast.enabledSuccess, {
                description: `${ui.autopilot.toast.txPrefix}: ${result.txHash.slice(0, 10)}...`,
            });
        } catch (err) {
            toast.error(ui.autopilot.toast.enableFailed, {
                description:
                    err instanceof Error
                        ? err.message.slice(0, 140)
                        : ui.autopilot.toast.unknownError,
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

    if (agentError) {
        return (
            <AppShell>
                <div className="max-w-lg mx-auto text-center py-20 space-y-4">
                    <ShieldAlert className="w-12 h-12 text-[var(--color-burgundy)] mx-auto" />
                    <h2 className="text-2xl font-serif font-bold text-[var(--color-burgundy)]">
                        {t.agent.console.page.title}
                    </h2>
                    <p className="text-muted-foreground">
                        {ui.errorLoadAgent}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono break-all">
                        {agentError.message}
                    </p>
                    <div className="flex justify-center gap-2 pt-2">
                        <Link
                            href={detailPath}
                            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
                        >
                            {ui.goAgentDetail}
                        </Link>
                        <Link
                            href="/docs"
                            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
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
                    <div className="rounded-lg border bg-muted/30 px-4 py-3 text-left text-xs text-muted-foreground">
                        <div className="font-medium text-foreground">{ui.nextStepTitle}</div>
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
                            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
                        >
                            {ui.goAgentDetail}
                        </Link>
                        <Link
                            href="/me"
                            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
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
            <div className="max-w-3xl mx-auto space-y-6">
                <nav className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Link href="/" className="hover:text-foreground">
                        {t.common.nav.market}
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link href={detailPath} className="hover:text-foreground">
                        {ui.agentDetail}
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-foreground">{t.agent.detail.tabs.console}</span>
                </nav>
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

                <div className="rounded-lg border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                    <div>
                        <span className="font-medium text-foreground">{ui.currentRole}: </span>
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
                        <h2 className="text-lg font-semibold">{ui.autopilot.title}</h2>
                        <span className="text-xs text-muted-foreground">
                            {ui.autopilot.nonce}: {operatorNonce.toString()}
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {ui.autopilot.onchainOperator}: {onchainOperator || ui.autopilot.notSet}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {ui.autopilot.operatorExpires}:{" "}
                        {operatorExpires > BigInt(0)
                            ? new Date(Number(operatorExpires) * 1000).toLocaleString()
                            : ui.autopilot.notSet}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">{ui.autopilot.operatorAddress}</label>
                            <input
                                className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                                value={autopilotOperator}
                                onChange={(e) => setAutopilotOperator(e.target.value)}
                                placeholder="0x..."
                            />
                            {runnerOperatorDefault && (
                                <button
                                    type="button"
                                    onClick={() => setAutopilotOperator(runnerOperatorDefault)}
                                    className="text-xs text-[var(--color-burgundy)] hover:underline"
                                >
                                    {ui.autopilot.useDefaultRunner}
                                </button>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">{ui.autopilot.operatorExpiresInput}</label>
                            <input
                                type="datetime-local"
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                value={autopilotExpiresAt}
                                onChange={(e) => setAutopilotExpiresAt(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {ui.autopilot.hint}
                    </div>
                    <button
                        type="button"
                        onClick={handleEnableAutopilot}
                        disabled={!isRenter || isEnablingAutopilot || !agent}
                        className="inline-flex items-center rounded-md bg-[var(--color-burgundy)] text-white px-4 py-2 text-sm disabled:opacity-50"
                    >
                        {isEnablingAutopilot
                            ? ui.autopilot.enabling
                            : ui.autopilot.enable}
                    </button>
                    <button
                        type="button"
                        onClick={handleDisableAutopilot}
                        disabled={isClearingAutopilot || !isOwner && !isRenter}
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm disabled:opacity-50"
                    >
                        {isClearingAutopilot
                            ? ui.autopilot.disabling
                            : ui.autopilot.disable}
                    </button>
                    {!isRenter && (
                        <div className="text-xs text-muted-foreground">
                            {ui.autopilot.renterOnlyHint}
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
