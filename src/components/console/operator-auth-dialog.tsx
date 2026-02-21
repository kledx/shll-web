"use client";

import { useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, ShieldX, Info } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAutopilot, EnableState } from "@/hooks/useAutopilot";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { Address, getAddress } from "viem";
import { toast } from "sonner";

interface OperatorAuthDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tokenId: string;
    nfaAddress?: string;
    /** Renter address (wallet) */
    renter: string;
    /** Rental expiry timestamp (seconds) */
    rentalExpiresAt?: bigint;
    /** Called after successful authorization or skip */
    onComplete?: (authorized: boolean) => void;
    /** Preferred operator from runner status endpoint */
    runnerOperator?: string;
}

// Inline bilingual copy for the authorization dialog
const copy = {
    en: {
        title: "Activate Your Agent",
        subtitle:
            "Your rental is confirmed! To let the Agent execute trades on your behalf, sign one more authorization.",
        allowTitle: "What this authorizes",
        allowItems: [
            "Runner can execute trades (swap, approve) for this Agent",
            "Every trade is validated by PolicyGuard safety rules",
            "Authorization auto-expires when your lease ends",
        ],
        denyTitle: "What this does NOT authorize",
        denyItems: [
            "Cannot withdraw your vault funds",
            "Cannot transfer your Agent NFT",
            "Cannot change or bypass your safety policies",
        ],
        analogy:
            "Think of it as giving a valet your car key — they can drive within a GPS fence, but cannot sell the car or empty the trunk.",
        authorize: "Authorize & Start",
        skip: "Skip for now",
        skipHint:
            "You can enable autopilot later from the Agent Console.",
        signing: "Waiting for signature…",
        submitting: "Submitting to runner…",
        pending: "Confirming on-chain…",
        confirmed: "Authorized! Redirecting…",
        error: "Authorization failed",
    },
    zh: {
        title: "激活你的 Agent",
        subtitle:
            "租赁已确认！要让 Agent 代你执行交易，请签署一次授权。",
        allowTitle: "此授权允许",
        allowItems: [
            "Runner 可代此 Agent 执行交易（swap、approve）",
            "每笔交易都经 PolicyGuard 安全规则验证",
            "授权在租期结束时自动失效",
        ],
        denyTitle: "此授权不允许",
        denyItems: [
            "不能提取你的金库资金",
            "不能转移你的 Agent NFT",
            "不能修改或绕过你的安全策略",
        ],
        analogy:
            "就像给代驾一把受限车钥匙 —— 他可以在 GPS 围栏内驾驶，但不能卖车或清空后备箱。",
        authorize: "授权并启动",
        skip: "暂不授权",
        skipHint: "你可以稍后在 Agent 控制台手动启用 Autopilot。",
        signing: "等待签名…",
        submitting: "正在提交至 Runner…",
        pending: "链上确认中…",
        confirmed: "已授权！正在跳转…",
        error: "授权失败",
    },
} as const;

type CopyLang = (typeof copy)["en"] | (typeof copy)["zh"];

function stateLabel(state: EnableState, t: CopyLang): string {
    switch (state) {
        case "SIGNING":
            return t.signing;
        case "SUBMITTING":
            return t.submitting;
        case "ONCHAIN_PENDING":
            return t.pending;
        case "ONCHAIN_CONFIRMED":
            return t.confirmed;
        default:
            return "";
    }
}

export function OperatorAuthDialog({
    open,
    onOpenChange,
    tokenId,
    nfaAddress,
    renter,
    rentalExpiresAt,
    onComplete,
    runnerOperator,
}: OperatorAuthDialogProps) {
    const { language } = useTranslation();
    const t = language === "zh" ? copy.zh : copy.en;
    const [busy, setBusy] = useState(false);

    const { enableAutopilot, enableState, error } = useAutopilot({
        tokenId,
        renter,
        nfaAddress,
    });

    const handleAuthorize = useCallback(async () => {
        const preferredOperator =
            (runnerOperator || "").trim() ||
            getRuntimeEnv("NEXT_PUBLIC_RUNNER_OPERATOR", "").trim();
        let operatorAddr = "";
        try {
            operatorAddr = preferredOperator ? getAddress(preferredOperator) : "";
        } catch {
            operatorAddr = "";
        }
        if (!operatorAddr) {
            toast.error(language === "zh"
                ? "未配置 Runner Operator 地址"
                : "Runner operator address not configured");
            return;
        }
        setBusy(true);
        try {
            // Default expiry: rental expiry or 30 days from now
            const defaultExpiry = BigInt(Math.floor(Date.now() / 1000) + 30 * 86400);
            const expires = rentalExpiresAt && rentalExpiresAt > BigInt(0)
                ? rentalExpiresAt
                : defaultExpiry;
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1h deadline

            await enableAutopilot({
                operator: operatorAddr as Address,
                expires,
                deadline,
            });
            onComplete?.(true);
        } catch {
            // Error is captured via enableState / error
        } finally {
            setBusy(false);
        }
    }, [enableAutopilot, rentalExpiresAt, onComplete, runnerOperator, language]);

    const handleSkip = useCallback(() => {
        onOpenChange(false);
        onComplete?.(false);
    }, [onOpenChange, onComplete]);

    const isProcessing = busy || ["SIGNING", "SUBMITTING", "ONCHAIN_PENDING"].includes(enableState);
    const isSuccess = enableState === "ONCHAIN_CONFIRMED";
    const isError = enableState === "ERROR";

    return (
        <Dialog open={open} onOpenChange={isProcessing ? undefined : onOpenChange}>
            <DialogContent className="max-w-md sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        {t.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed">
                        {t.subtitle}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* What it authorizes */}
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                            <ShieldCheck className="h-4 w-4" />
                            {t.allowTitle}
                        </div>
                        <ul className="space-y-1 text-sm text-emerald-700/90">
                            {t.allowItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="mt-0.5 text-emerald-500">✓</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* What it does NOT authorize */}
                    <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-red-700">
                            <ShieldX className="h-4 w-4" />
                            {t.denyTitle}
                        </div>
                        <ul className="space-y-1 text-sm text-red-700/90">
                            {t.denyItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="mt-0.5 text-red-500">✗</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Analogy */}
                    <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        <p className="text-sm text-blue-700/90">{t.analogy}</p>
                    </div>

                    {/* State indicator */}
                    {isProcessing && (
                        <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {stateLabel(enableState, t)}
                        </div>
                    )}
                    {isSuccess && (
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                            <ShieldCheck className="h-4 w-4" />
                            {t.confirmed}
                        </div>
                    )}
                    {isError && error && (
                        <div className="text-sm text-red-600">
                            {t.error}: {error}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <Button
                        variant="ghost"
                        onClick={handleSkip}
                        disabled={isProcessing}
                        className="text-sm text-[var(--color-muted-foreground)]"
                    >
                        {t.skip}
                    </Button>
                    <Button
                        onClick={handleAuthorize}
                        disabled={isProcessing || isSuccess}
                        className="gap-2"
                    >
                        {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ShieldCheck className="h-4 w-4" />
                        )}
                        {t.authorize}
                    </Button>
                </DialogFooter>

                {!isProcessing && !isSuccess && (
                    <p className="text-center text-sm text-[var(--color-muted-foreground)]">
                        {t.skipHint}
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}
