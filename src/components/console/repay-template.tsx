"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { encodeFunctionData, parseUnits, Address } from "viem";
import { useTranslation } from "@/hooks/useTranslation";
import { Action } from "./action-types";

// Venus vToken ABI (partial)
const VTOKEN_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "borrower", "type": "address" },
            { "internalType": "uint256", "name": "repayAmount", "type": "uint256" }
        ],
        "name": "repayBorrowBehalf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// Config
const vUSDT = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8"; // Venus USDT (Testnet mock)

interface RepayTemplateProps {
    onActionGenerated: (action: Action) => void;
    renterAddress?: string; // Current renter is the borrower
}

export function RepayTemplate({ onActionGenerated, renterAddress }: RepayTemplateProps) {
    const { t } = useTranslation();
    const [amount, setAmount] = useState<string>("100");

    const generateAction = () => {
        if (!renterAddress) return;

        // 1. Amount
        const repayAmount = parseUnits(amount, 18);

        // 2. Encode Calldata
        const data = encodeFunctionData({
            abi: VTOKEN_ABI,
            functionName: "repayBorrowBehalf",
            args: [renterAddress as Address, repayAmount]
        });

        // 3. Create Action
        const action: Action = {
            target: vUSDT as Address,
            value: BigInt(0),
            data: data
        };

        onActionGenerated(action);
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-[var(--color-paper)]/50">
            <div className="space-y-2">
                <Label>{t.agent.console.templates.repay.amount}</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                <p className="text-xs text-muted-foreground">
                    {t.agent.console.templates.repay.borrower.replace("{address}", renterAddress || "N/A")}
                </p>
            </div>

            <Button onClick={generateAction} disabled={!renterAddress} className="w-full" variant="secondary">
                {t.agent.console.templates.repay.generate}
            </Button>
        </div>
    );
}
