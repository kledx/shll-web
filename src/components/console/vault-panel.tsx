"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Copy, Loader2 } from "lucide-react";
import { Address } from "viem";
import { useVaultBalances, Asset } from "@/hooks/useVaultBalances";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWithdraw } from "@/hooks/useWithdraw";
import { useAccount } from "wagmi";

interface VaultPanelProps {
    agentAccount?: Address;
    isRenter: boolean;
    isOwner: boolean;
}

export function VaultPanel({ agentAccount, isRenter, isOwner }: VaultPanelProps) {
    const { assets, isLoading } = useVaultBalances(agentAccount);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

    // Withdraw State
    const { withdrawNative, withdrawToken, isLoading: isWithdrawing, isSuccess: isWithdrawSuccess } = useWithdraw();
    const { address: userAddress } = useAccount();
    const [selectedAsset, setSelectedAsset] = useState<string>("Native Token");
    const [withdrawAmount, setWithdrawAmount] = useState<string>("");
    const [withdrawAddress, setWithdrawAddress] = useState<string>(userAddress || "");

    const handleCopyAddress = () => {
        if (agentAccount) {
            navigator.clipboard.writeText(agentAccount);
            // In a real app, show toast
        }
    };

    const handleWithdraw = () => {
        if (!agentAccount || !withdrawAddress) return;

        // Find selected asset
        const asset = assets.find(a => a.name === selectedAsset);
        if (!asset) return;

        // Parse amount (simplified for MVP)
        // In reality, use parseUnits with asset.decimals
        // Here assuming 18 decimals for all
        const amountBigInt = BigInt(parseFloat(withdrawAmount) * 1e18);

        if (asset.isNative) {
            withdrawNative(agentAccount, amountBigInt, withdrawAddress as Address);
        } else if (asset.address) {
            withdrawToken(agentAccount, asset.address, amountBigInt, withdrawAddress as Address);
        }
    };

    const canWithdraw = isRenter || isOwner;

    return (
        <Card className="border-[var(--color-burgundy)]/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-serif">Vault Balance</CardTitle>
                    <CardDescription>Assets held by the Agent Account.</CardDescription>
                </div>
                <div className="flex gap-2">
                    {/* Deposit (Simple Copy) */}
                    <Button variant="outline" size="sm" onClick={handleCopyAddress} className="gap-2">
                        <ArrowDownToLine className="w-4 h-4" /> Deposit
                    </Button>

                    {/* Withdraw (Modal) */}
                    <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary" size="sm" disabled={!canWithdraw} className="gap-2">
                                <ArrowUpFromLine className="w-4 h-4" /> Withdraw
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Withdraw Assets</DialogTitle>
                                <DialogDescription>
                                    Transfer funds from the Agent Account to your wallet.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Asset</Label>
                                    <Select onValueChange={setSelectedAsset} defaultValue={selectedAsset}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select asset" />
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
                                    <Label className="text-right">Amount</Label>
                                    <Input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={e => setWithdrawAmount(e.target.value)}
                                        className="col-span-3"
                                        placeholder="0.0"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">To</Label>
                                    <Input
                                        value={withdrawAddress}
                                        onChange={e => setWithdrawAddress(e.target.value)}
                                        className="col-span-3 font-mono text-xs"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button onClick={handleWithdraw} disabled={isWithdrawing}>
                                    {isWithdrawing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                    Confirm Withdraw
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
                        {assets.length === 0 && <p className="text-sm text-muted-foreground">No assets found.</p>}
                        {assets.map((asset, i) => (
                            <div key={i} className="flex items-center justify-between p-2 border rounded bg-muted/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-burgundy)]/10 flex items-center justify-center">
                                        <span className="text-xs font-bold text-[var(--color-burgundy)]">{asset.symbol[0]}</span>
                                    </div>
                                    <div>
                                        <div className="font-medium">{asset.symbol}</div>
                                        <div className="text-xs text-muted-foreground">{asset.isNative ? "Native" : "ERC20"}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono">{parseFloat(asset.balance).toFixed(4)}</div>
                                    {/* <div className="text-xs text-muted-foreground">~$0.00</div> */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
