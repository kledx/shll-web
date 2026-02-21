"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { AlertTriangle, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSection } from "@/components/layout/page-section";
import { CHAIN_NAME, SUPPORTED_CHAIN_ID } from "@/config/wagmi";
import { useTranslation } from "@/hooks/useTranslation";
import { useClaimRentalIncome } from "@/hooks/useClaimRentalIncome";

function formatDisplayAmount(value: string): string {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "0";
    return numeric.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function ClaimIncomeCard() {
    const { language } = useTranslation();
    const { isConnected, chain } = useAccount();
    const {
        pendingAmount,
        pendingFormatted,
        isBalanceLoading,
        isClaiming,
        claimIncome,
    } = useClaimRentalIncome();

    const isWrongChain = Boolean(
        isConnected && chain && chain.id !== SUPPORTED_CHAIN_ID
    );

    const title =
        language === "zh" ? "可提现租金收入" : "Claimable Rental Income";
    const subtitle =
        language === "zh"
            ? "由 ListingManager 累计，需手动 Claim 到钱包。"
            : "Accrued in ListingManager and claimable to your wallet.";

    const displayAmount = useMemo(
        () => `${formatDisplayAmount(pendingFormatted)} BNB`,
        [pendingFormatted]
    );

    const disabled =
        !isConnected ||
        isWrongChain ||
        pendingAmount <= BigInt(0) ||
        isClaiming;

    let helper = "";
    if (!isConnected) {
        helper =
            language === "zh"
                ? "请先连接钱包后再提现。"
                : "Connect your wallet to claim income.";
    } else if (isWrongChain) {
        helper =
            language === "zh"
                ? `请切换到 ${CHAIN_NAME} 后再提现。`
                : `Switch to ${CHAIN_NAME} to claim.`;
    } else if (pendingAmount <= BigInt(0)) {
        helper =
            language === "zh"
                ? "当前没有可提现余额。"
                : "No claimable balance right now.";
    } else {
        helper =
            language === "zh"
                ? "提现后会自动刷新余额。"
                : "Balance will refresh after confirmation.";
    }

    return (
        <PageSection tone="default" compact className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-base font-semibold">{title}</h3>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                        {subtitle}
                    </p>
                </div>
                {isWrongChain && (
                    <div className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {language === "zh" ? "网络错误" : "Wrong network"}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                    <span className="text-2xl font-semibold tracking-tight">
                        {isBalanceLoading ? "..." : displayAmount}
                    </span>
                </div>
                <Button
                    onClick={claimIncome}
                    disabled={disabled}
                    className="min-w-36"
                >
                    {isClaiming ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {language === "zh" ? "提现中" : "Claiming"}
                        </>
                    ) : language === "zh" ? (
                        "提现到钱包"
                    ) : (
                        "Claim to Wallet"
                    )}
                </Button>
            </div>

            <p className="text-xs text-[var(--color-muted-foreground)]">
                {helper}
            </p>
        </PageSection>
    );
}
