"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";
import { Address } from "viem";
import { useVaultBalances } from "@/hooks/useVaultBalances";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWithdraw } from "@/hooks/useWithdraw";
import { useDeposit } from "@/hooks/useDeposit";
import { useTranslation } from "@/hooks/useTranslation";
import { useAccount } from "wagmi";

// Tokens available for deposit (must match PolicyGuard config)
const DEPOSIT_TOKENS: { name: string; symbol: string; address: string; decimals: number; isNative: boolean }[] = [
    { name: "BNB", symbol: "BNB", address: "", decimals: 18, isNative: true },
    { name: "USDT", symbol: "USDT", address: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", decimals: 18, isNative: false },
    { name: "WBNB", symbol: "WBNB", address: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", decimals: 18, isNative: false },
];

interface VaultPanelProps {
    agentAccount?: Address;
    isRenter: boolean;
    isOwner: boolean;
    tokenId: string;
}

export function VaultPanel({ agentAccount, isRenter, isOwner, tokenId }: VaultPanelProps) {
    const { t } = useTranslation();
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
    const [selectedAsset, setSelectedAsset] = useState<string>("Native Token");
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

        const asset = assets.find(a => a.name === selectedAsset);
        if (!asset) return;

        const amountBigInt = BigInt(Math.floor(parseFloat(withdrawAmount || "0") * 1e18));

        if (asset.isNative) {
            // Contract requires to == msg.sender (user's wallet)
            withdrawNative(agentAccount, amountBigInt, userAddress as Address);
        } else if (asset.address) {
            withdrawToken(agentAccount, asset.address, amountBigInt, userAddress as Address);
        }
    };

    const canWithdraw = isRenter || isOwner;
    const selectedDepositToken = DEPOSIT_TOKENS.find(t => t.name === depositAsset);
    const isERC20Deposit = selectedDepositToken && !selectedDepositToken.isNative;

    return (
        <Card className="border-[var(--color-burgundy)]/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-serif">{t.agent.vault.title}</CardTitle>
                    <CardDescription>{t.agent.vault.desc}</CardDescription>
                </div>
                <div className="flex gap-2">
                    {/* Deposit Dialog */}
                    <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <ArrowDownToLine className="w-4 h-4" /> {t.agent.vault.deposit}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Deposit to Agent Vault</DialogTitle>
                                <DialogDescription>
                                    Send tokens to the Agent&apos;s isolated account.
                                    {agentAccount && (
                                        <span className="block mt-1 font-mono text-xs">
                                            Account: {agentAccount.slice(0, 8)}...{agentAccount.slice(-6)}
                                        </span>
                                    )}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Token</Label>
                                    <Select onValueChange={setDepositAsset} defaultValue={depositAsset}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select token" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DEPOSIT_TOKENS.map(token => (
                                                <SelectItem key={token.name} value={token.name}>
                                                    {token.symbol} {token.isNative ? "(Native)" : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Amount</Label>
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
                                            1. Approve
                                        </Button>
                                        <Button
                                            onClick={handleDepositAfterApprove}
                                            disabled={isDepositing || !depositAmount}
                                        >
                                            {isDepositing && depositStep === "depositing" ? (
                                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                            ) : null}
                                            2. Deposit
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={handleDeposit} disabled={isDepositing || !depositAmount}>
                                        {isDepositing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                        Deposit BNB
                                    </Button>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Withdraw Dialog */}
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
                                    <Select onValueChange={setSelectedAsset} defaultValue={selectedAsset}>
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
                                    <Input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={e => setWithdrawAmount(e.target.value)}
                                        className="col-span-3"
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button onClick={handleWithdraw} disabled={isWithdrawing}>
                                    {isWithdrawing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                    {t.agent.vault.dialog.confirm}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
                                        <span className="text-xs font-bold text-[var(--color-burgundy)]">{asset.symbol[0]}</span>
                                    </div>
                                    <div>
                                        <div className="font-medium">{asset.symbol}</div>
                                        <div className="text-xs text-muted-foreground">{asset.isNative ? t.agent.vault.assets.native : t.agent.vault.assets.erc20}</div>
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
