"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { encodeFunctionData, parseUnits, Address } from "viem";
import { Action } from "./action-builder";

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
    const [amount, setAmount] = useState<string>("100");

    const generateAction = () => {
        if (!renterAddress) return;

        // 1. Amount
        const repayAmount = parseUnits(amount, 18);

        // 2. Encode Calldata
        // Note: In MVP we simplify. Ideally this is a batch: Approve USDT -> Repay vUSDT
        // Here we just generate the repay action for the template demonstration.
        // User would click "Add to Batch" in a full implementation.
        // For now, let's assume approval is done or we just generate the repay call.

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
                <Label>Repay Amount (USDT)</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                <p className="text-xs text-muted-foreground">Repaying loan for borrower: {renterAddress}</p>
            </div>

            <Button onClick={generateAction} disabled={!renterAddress} className="w-full" variant="secondary">
                Generate Repay Action
            </Button>
        </div>
    );
}
