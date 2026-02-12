"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { encodeFunctionData, parseUnits, Address } from "viem";
import { Action } from "./action-builder";
import { useTranslation } from "@/hooks/useTranslation";

// PancakeRouter ABI (partial)
const ROUTER_ABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
            { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
            { "internalType": "address[]", "name": "path", "type": "address[]" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "name": "swapExactTokensForTokens",
        "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// Mock Addresses (replace with real config later)
// BSC Testnet Addresses
const TOKENS = {
    "USDT": "0x66E972502A34A625828C544a1914E8D8cc2A9dE5",
    "WBNB": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    "DAI": "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F9a0F92"
};

const ROUTER_ADDRESS = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1"; // PancakeRouter V2 Testnet

interface SwapTemplateProps {
    onActionGenerated: (action: Action) => void;
    agentAccount?: Address;
}

export function SwapTemplate({ onActionGenerated, agentAccount }: SwapTemplateProps) {
    const { t } = useTranslation();
    const [tokenIn, setTokenIn] = useState<string>("USDT");
    const [tokenOut, setTokenOut] = useState<string>("WBNB");
    const [amountIn, setAmountIn] = useState<string>("10");

    const generateAction = () => {
        if (!agentAccount) return;

        // 1. Path
        const path = [TOKENS[tokenIn as keyof typeof TOKENS], TOKENS[tokenOut as keyof typeof TOKENS]] as Address[];

        // 2. Amount (assuming 18 decimals for simplicity in mock)
        const amountInWei = parseUnits(amountIn, 18);
        const amountOutMin = parseUnits("0", 18); // TODO: Calculate min output based on slippage (0 for MVP)

        // 3. Deadline (20 mins)
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

        // 4. Encode Calldata
        const data = encodeFunctionData({
            abi: ROUTER_ABI,
            functionName: "swapExactTokensForTokens",
            args: [amountInWei, amountOutMin, path, agentAccount, deadline]
        });

        // 5. Create Action
        const action: Action = {
            target: ROUTER_ADDRESS as Address,
            value: BigInt(0),
            data: data
        };

        onActionGenerated(action);
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-[var(--color-paper)]/50">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>{t.agent.console.templates.swap.tokenIn}</Label>
                    <Select value={tokenIn} onValueChange={setTokenIn}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.keys(TOKENS).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>{t.agent.console.templates.swap.tokenOut}</Label>
                    <Select value={tokenOut} onValueChange={setTokenOut}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.keys(TOKENS).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>{t.agent.console.templates.swap.amountIn}</Label>
                <Input type="number" value={amountIn} onChange={e => setAmountIn(e.target.value)} />
            </div>

            <Button onClick={generateAction} disabled={!agentAccount} className="w-full">
                {t.agent.console.templates.swap.generate}
            </Button>
        </div>
    );
}
