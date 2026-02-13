"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { RentalItem } from "@/hooks/useMyRentals";
import Link from "next/link";
import { Clock, ExternalLink, ArrowDownToLine, Loader2 } from "lucide-react";
import { useAgentAccount } from "@/hooks/useAgentAccount";
import { useDeposit } from "@/hooks/useDeposit";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Address } from "viem";

// Tokens available for deposit (must match PolicyGuard config)
const DEPOSIT_TOKENS = [
    { name: "BNB", symbol: "BNB", address: "", decimals: 18, isNative: true },
    { name: "USDT", symbol: "USDT", address: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", decimals: 18, isNative: false },
    { name: "WBNB", symbol: "WBNB", address: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", decimals: 18, isNative: false },
];

interface RentalCardProps {
    rental: RentalItem;
}

export function RentalCard({ rental }: RentalCardProps) {
    const { account: agentAccount } = useAgentAccount(rental.tokenId.toString());
    const tokenId = rental.tokenId.toString();

    // Deposit state
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const { depositNative, approveToken, depositToken, step: depositStep, isLoading: isDepositing, isSuccess: isDepositSuccess } = useDeposit();
    const [depositAsset, setDepositAsset] = useState<string>("BNB");
    const [depositAmount, setDepositAmount] = useState<string>("");
    const [nowSec, setNowSec] = useState<number | null>(null);

    // Auto-close dialog after deposit confirms
    useEffect(() => {
        if (isDepositSuccess) {
            const timer = setTimeout(() => {
                setIsDepositOpen(false);
                setDepositAmount("");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isDepositSuccess]);

    useEffect(() => {
        const updateNow = () => setNowSec(Math.floor(Date.now() / 1000));
        updateNow();
        const timer = setInterval(updateNow, 60_000);
        return () => clearInterval(timer);
    }, []);

    const handleDeposit = () => {
        if (!agentAccount || !depositAmount || parseFloat(depositAmount) <= 0) return;
        const token = DEPOSIT_TOKENS.find(t => t.name === depositAsset);
        if (!token) return;

        if (token.isNative) {
            depositNative(tokenId, depositAmount);
        } else {
            approveToken(token.address as Address, agentAccount as Address, depositAmount, token.decimals);
        }
    };

    const handleDepositAfterApprove = () => {
        if (!agentAccount || !depositAmount) return;
        const token = DEPOSIT_TOKENS.find(t => t.name === depositAsset);
        if (!token || token.isNative) return;
        depositToken(agentAccount as Address, token.address as Address, depositAmount, token.decimals);
    };

    const isExpired = !rental.isActive;
    const daysLeft = nowSec === null ? 0 : Math.ceil((Number(rental.expires) - nowSec) / 86400);

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const selectedToken = DEPOSIT_TOKENS.find(t => t.name === depositAsset);
    const isERC20 = selectedToken && !selectedToken.isNative;

    return (
        <Card className={`border ${isExpired ? 'border-gray-200 opacity-70' : 'border-[var(--color-burgundy)]/20'}`}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">Agent #{tokenId}</CardTitle>
                        <CardDescription className="text-xs font-mono mt-1">
                            {formatAddress(rental.agentAccount)}
                        </CardDescription>
                    </div>
                    <Chip variant={isExpired ? "default" : "burgundy"}>
                        {isExpired ? "Expired" : "Active"}
                    </Chip>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    <span>
                        {isExpired
                            ? `Expired on ${new Date(Number(rental.expires) * 1000).toLocaleDateString()}`
                            : `Expires in ${daysLeft} days`}
                    </span>
                </div>
                <div className="h-1 bg-gray-100 rounded overflow-hidden">
                    <div className={`h-full ${isExpired ? 'bg-gray-300' : 'bg-[var(--color-burgundy)]'} w-3/4`} />
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                {/* Deposit Dialog */}
                <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex-1 gap-2 border-[var(--color-burgundy)]/20 hover:bg-[var(--color-burgundy)]/5 text-[var(--color-burgundy)]"
                        >
                            <ArrowDownToLine className="w-4 h-4" /> Deposit
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Deposit to Agent #{tokenId}</DialogTitle>
                            <DialogDescription>
                                Send tokens to the Agent&apos;s vault.
                                {agentAccount && (
                                    <span className="block mt-1 font-mono text-xs">
                                        Account: {formatAddress(agentAccount)}
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
                            {isERC20 ? (
                                <>
                                    <Button onClick={handleDeposit} disabled={isDepositing || !depositAmount} variant="outline">
                                        {isDepositing && depositStep === "approving" ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                        1. Approve
                                    </Button>
                                    <Button onClick={handleDepositAfterApprove} disabled={isDepositing || !depositAmount}>
                                        {isDepositing && depositStep === "depositing" ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
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

                <Link href={`/agent/${rental.nfa}/${rental.tokenId}/console`} className="flex-1">
                    <Button variant={isExpired ? "outline" : "default"} className="w-full group">
                        Manage
                        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
