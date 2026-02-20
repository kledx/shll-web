"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";
import { Address, parseUnits } from "viem";
import { useVaultBalances } from "@/hooks/useVaultBalances";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWithdraw } from "@/hooks/useWithdraw";
import { useDeposit } from "@/hooks/useDeposit";
import { useTranslation } from "@/hooks/useTranslation";
import { useAccount } from "wagmi";
import { getConsoleCopy } from "@/lib/console/console-copy";
import { KNOWN_TOKENS } from "@/config/tokens";

// Tokens available for deposit — from centralized config
const DEPOSIT_TOKENS = KNOWN_TOKENS;

interface VaultPanelProps {
    agentAccount?: Address;
    isRenter: boolean;
    isOwner: boolean;
    tokenId: string;
    refreshKey?: number;
    readOnly?: boolean;
    allowWithdraw?: boolean;
}

export function VaultPanel({
    agentAccount,
    isRenter,
    isOwner,
    tokenId,
    refreshKey = 0,
    readOnly = false,
    allowWithdraw = false,
}: VaultPanelProps) {
    const { t, language } = useTranslation();
    const ui = getConsoleCopy(language).vault;
    const { address: userAddress } = useAccount();
    const { assets, isLoading, refetch } = useVaultBalances(agentAccount);

    // Deposit State
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const { depositNative, approveToken, depositToken, step: depositStep, isLoading: isDepositing, isSuccess: isDepositSuccess } = useDeposit();
    const [depositAsset, setDepositAsset] = useState<string>("BNB");
    const [depositAmount, setDepositAmount] = useState<string>("");

    // Withdraw State
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const { withdrawNative, withdrawToken, isLoading: isWithdrawing, isSuccess: isWithdrawSuccess } = useWithdraw();
    const [selectedAsset, setSelectedAsset] = useState<string>("");
    const [withdrawAmount, setWithdrawAmount] = useState<string>("");

    // Auto-refresh balances and close dialogs after deposit or withdraw confirms
    useEffect(() => {
        if (isDepositSuccess) {
            const timer = setTimeout(() => {
                refetch();
                setIsDepositOpen(false);
                setDepositAmount("");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isDepositSuccess, refetch]);

    useEffect(() => {
        if (isWithdrawSuccess) {
            const timer = setTimeout(() => {
                refetch();
                setIsWithdrawOpen(false);
                setWithdrawAmount("");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isWithdrawSuccess, refetch]);

    // Refresh vault balances after execute() confirmed on console page
    useEffect(() => {
        if (refreshKey <= 0) return;
        const timer = setTimeout(() => {
            refetch();
        }, 1500);
        return () => clearTimeout(timer);
    }, [refreshKey, refetch]);

    const handleDeposit = () => {
        if (!agentAccount || !depositAmount || parseFloat(depositAmount) <= 0) return;

        const token = DEPOSIT_TOKENS.find(t => t.name === depositAsset);
        if (!token) return;

        if (token.isNative) {
            // Native BNB: call AgentNFA.fundAgent(tokenId) {value: amount}
            depositNative(tokenId, depositAmount);
        } else {
            if (depositStep === "idle" || depositStep === "approving") {
                // ERC-20 Step 1: approve, then deposit
                // For simplicity, we do approve first. User clicks again for deposit.
                approveToken(token.address as Address, agentAccount, depositAmount, token.decimals);
            }
        }
    };

    // After approval confirmed, deposit the token
    const handleDepositAfterApprove = () => {
        if (!agentAccount || !depositAmount) return;
        const token = DEPOSIT_TOKENS.find(t => t.name === depositAsset);
        if (!token || token.isNative) return;
        depositToken(agentAccount, token.address as Address, depositAmount, token.decimals);
    };

    const handleWithdraw = () => {
        if (!agentAccount || !userAddress) return;

        const asset = assets.find(a => a.name === effectiveSelectedAsset);
        if (!asset) return;

        const amountBigInt = parseUnits(withdrawAmount || "0", asset.decimals);

        if (asset.isNative) {
            // Contract requires to == msg.sender (user's wallet)
            withdrawNative(agentAccount, amountBigInt, userAddress as Address);
        } else if (asset.address) {
            withdrawToken(agentAccount, asset.address, amountBigInt, userAddress as Address);
        }
    };

    const canDeposit = !readOnly && isRenter;
    const canWithdraw = allowWithdraw && !readOnly && isRenter;
    const selectedDepositToken = DEPOSIT_TOKENS.find(t => t.name === depositAsset);
    const isERC20Deposit = selectedDepositToken && !selectedDepositToken.isNative;
    const effectiveSelectedAsset = selectedAsset || assets[0]?.name || "";

    return (
        <Card className="border-[var(--color-burgundy)]/10">
            <CardHeader className="flex flex-col gap-3 space-y-0 pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-serif">{t.agent.vault.title}</CardTitle>
                    <CardDescription>{t.agent.vault.desc}</CardDescription>
                    {readOnly && (
                        <div className="text-sm text-amber-700">
                            {ui.readOnlyHint}
                        </div>
                    )}
                    {!allowWithdraw && (
                        <div className="text-sm text-muted-foreground">
                            {ui.safeModeHint}
                        </div>
                    )}
                    {!readOnly && isOwner && !isRenter && (
                        <div className="text-sm text-muted-foreground">
                            Owner cannot operate vault directly; only active renter can deposit/withdraw.
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    {/* Deposit Dialog */}
                    {canDeposit && (
                        <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <ArrowDownToLine className="w-4 h-4" /> {t.agent.vault.deposit}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{ui.depositDialogTitle}</DialogTitle>
                                    <DialogDescription>
                                        {ui.depositDialogDesc}
                                        {agentAccount && (
                                            <span className="block mt-1 font-mono text-sm">
                                                {ui.accountLabel}: {agentAccount.slice(0, 8)}...{agentAccount.slice(-6)}
                                            </span>
                                        )}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">{ui.tokenLabel}</Label>
                                        <Select onValueChange={setDepositAsset} defaultValue={depositAsset}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder={ui.selectToken} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DEPOSIT_TOKENS.map(token => (
                                                    <SelectItem key={token.name} value={token.name}>
                                                        {token.symbol} {token.isNative ? ui.nativeTag : ""}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">{ui.amountLabel}</Label>
                                        <Input
                                            type="number"
                                            value={depositAmount}
                                            onChange={e => setDepositAmount(e.target.value)}
                                            className="col-span-3"
                                            placeholder="0.0"
                                            step="0.001"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="flex gap-2">
                                    {isERC20Deposit ? (
                                        <>
                                            <Button
                                                onClick={handleDeposit}
                                                disabled={isDepositing || !depositAmount}
                                                variant="outline"
                                            >
                                                {isDepositing && depositStep === "approving" ? (
                                                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                                ) : null}
                                                {ui.approveStep}
                                            </Button>
                                            <Button
                                                onClick={handleDepositAfterApprove}
                                                disabled={isDepositing || !depositAmount}
                                            >
                                                {isDepositing && depositStep === "depositing" ? (
                                                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                                ) : null}
                                                {ui.depositStep}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button onClick={handleDeposit} disabled={isDepositing || !depositAmount}>
                                            {isDepositing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                            {ui.depositNative}
                                        </Button>
                                    )}
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Withdraw Dialog */}
                    {allowWithdraw && (
                        <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" size="sm" disabled={!canWithdraw} className="gap-2">
                                    <ArrowUpFromLine className="w-4 h-4" /> {t.agent.vault.withdraw}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t.agent.vault.dialog.title}</DialogTitle>
                                    <DialogDescription>
                                        {t.agent.vault.dialog.desc}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">{t.agent.vault.dialog.assetLabel}</Label>
                                        <Select
                                            value={effectiveSelectedAsset}
                                            onValueChange={setSelectedAsset}
                                            disabled={assets.length === 0}
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder={t.agent.vault.dialog.select} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assets.map(asset => (
                                                    <SelectItem key={asset.name} value={asset.name}>
                                                        {asset.symbol} (Bal: {parseFloat(asset.balance).toFixed(4)})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">{t.agent.vault.dialog.amountLabel}</Label>
                                        <div className="col-span-3 flex gap-2">
                                            <Input
                                                type="number"
                                                value={withdrawAmount}
                                                onChange={e => setWithdrawAmount(e.target.value)}
                                                placeholder="0.0"
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    const asset = assets.find(a => a.name === effectiveSelectedAsset);
                                                    if (asset) setWithdrawAmount(asset.balance);
                                                }}
                                            >
                                                Max
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button onClick={handleWithdraw} disabled={!canWithdraw || isWithdrawing}>
                                        {isWithdrawing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                        {t.agent.vault.dialog.confirm}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : (
                    <div className="space-y-4">
                        {assets.length === 0 && <p className="text-sm text-muted-foreground">{t.agent.vault.assets.noAssets}</p>}
                        {assets.map((asset, i) => (
                            <div key={i} className="flex items-center justify-between p-2 border rounded bg-muted/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-burgundy)]/10 flex items-center justify-center">
                                        <span className="text-sm font-bold text-[var(--color-burgundy)]">{asset.symbol[0]}</span>
                                    </div>
                                    <div>
                                        <div className="font-medium">{asset.symbol}</div>
                                        <div className="text-sm text-muted-foreground">{asset.isNative ? t.agent.vault.assets.native : t.agent.vault.assets.erc20}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono">{parseFloat(asset.balance).toFixed(4)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
