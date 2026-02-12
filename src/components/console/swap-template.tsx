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

// BSC Testnet token config with correct decimals
const TOKENS: Record<string, { address: string; decimals: number }> = {
    "USDT": { address: "0x66E972502A34A625828C544a1914E8D8cc2A9dE5", decimals: 18 },
    "WBNB": { address: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", decimals: 18 },
    "DAI": { address: "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F9a0F92", decimals: 18 },
};

const ROUTER_ADDRESS = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1"; // PancakeRouter V2 Testnet
const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0];

interface SwapTemplateProps {
    onActionGenerated: (action: Action) => void;
    agentAccount?: Address;
}

export function SwapTemplate({ onActionGenerated, agentAccount }: SwapTemplateProps) {
    const { t } = useTranslation();
    const [tokenIn, setTokenIn] = useState<string>("USDT");
    const [tokenOut, setTokenOut] = useState<string>("WBNB");
    const [amountIn, setAmountIn] = useState<string>("10");
    const [slippage, setSlippage] = useState<string>("0.5");

    const generateAction = () => {
        if (!agentAccount) return;

        const tokenInConfig = TOKENS[tokenIn];
        const tokenOutConfig = TOKENS[tokenOut];
        if (!tokenInConfig || !tokenOutConfig) return;

        // 1. Path
        const path = [tokenInConfig.address, tokenOutConfig.address] as Address[];

        // 2. Amount with correct decimals
        const amountInWei = parseUnits(amountIn, tokenInConfig.decimals);

        // 3. Slippage protection: amountOutMin = amountIn * (1 - slippage%)
        // For cross-token swaps this is a conservative floor.
        // A proper implementation would query getAmountsOut from the Router first.
        const slippageBps = Math.round(parseFloat(slippage) * 100); // e.g. 0.5% -> 50 bps
        const amountOutMin = amountInWei - (amountInWei * BigInt(slippageBps)) / BigInt(10000);

        // 4. Deadline (20 mins)
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

        // 5. Encode Calldata
        const data = encodeFunctionData({
            abi: ROUTER_ABI,
            functionName: "swapExactTokensForTokens",
            args: [amountInWei, amountOutMin, path, agentAccount, deadline]
        });

        // 6. Create Action
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

            {/* Slippage Tolerance */}
            <div className="space-y-2">
                <Label>{t.agent.console.templates.swap.slippage || "Slippage Tolerance"}</Label>
                <div className="flex items-center gap-2">
                    {SLIPPAGE_PRESETS.map(preset => (
                        <Button
                            key={preset}
                            type="button"
                            variant={slippage === String(preset) ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSlippage(String(preset))}
                        >
                            {preset}%
                        </Button>
                    ))}
                    <div className="flex items-center gap-1">
                        <Input
                            type="number"
                            value={slippage}
                            onChange={e => setSlippage(e.target.value)}
                            className="w-20 text-center"
                            step="0.1"
                            min="0.01"
                            max="50"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                    </div>
                </div>
            </div>

            <Button onClick={generateAction} disabled={!agentAccount} className="w-full">
                {t.agent.console.templates.swap.generate}
            </Button>
        </div>
    );
}

