"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { encodeFunctionData, parseUnits, Address, erc20Abi } from "viem";
import { Action } from "./action-builder";
import { useTranslation } from "@/hooks/useTranslation";
import { useReadContract, useBalance } from "wagmi";

// PancakeRouter ABI (partial — swap functions)
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
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
            { "internalType": "address[]", "name": "path", "type": "address[]" }
        ],
        "name": "getAmountsOut",
        "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
            { "internalType": "address[]", "name": "path", "type": "address[]" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "name": "swapExactETHForTokens",
        "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
        "stateMutability": "payable",
        "type": "function"
    }
] as const;

// BSC Testnet token config — addresses must match PolicyGuard allowlist
const WBNB_ADDRESS = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";

// Token options including native BNB
const TOKENS: Record<string, { address: string; decimals: number; isNative: boolean }> = {
    "BNB": { address: WBNB_ADDRESS, decimals: 18, isNative: true },
    "USDT": { address: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", decimals: 18, isNative: false },
    "WBNB": { address: WBNB_ADDRESS, decimals: 18, isNative: false },
};

const ROUTER_ADDRESS = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1"; // PancakeRouter V2 Testnet
const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0];

interface SwapTemplateProps {
    onActionGenerated: (action: Action) => void;
    agentAccount?: Address;
}

export function SwapTemplate({ onActionGenerated, agentAccount }: SwapTemplateProps) {
    const { t } = useTranslation();
    const [tokenIn, setTokenIn] = useState<string>("BNB");
    const [tokenOut, setTokenOut] = useState<string>("USDT");
    const [amountIn, setAmountIn] = useState<string>("0.001");
    const [slippage, setSlippage] = useState<string>("0.5");

    const tokenInConfig = TOKENS[tokenIn];
    const tokenOutConfig = TOKENS[tokenOut];

    // Amount with correct decimals
    const amountInWei = parseUnits(amountIn, tokenInConfig?.decimals || 18);
    const path = tokenInConfig && tokenOutConfig ? [tokenInConfig.address, tokenOutConfig.address] as Address[] : undefined;

    // Fetch Quote
    const { data: quoteData } = useReadContract({
        address: ROUTER_ADDRESS as Address,
        abi: ROUTER_ABI,
        functionName: "getAmountsOut",
        args: path && amountInWei > BigInt(0) ? [amountInWei, path] : undefined,
        query: {
            enabled: !!path && amountInWei > BigInt(0),
            refetchInterval: 10000
        }
    });

    // Verify quote corresponds to current input amount to prevent stale data
    const expectedOut = quoteData && quoteData[0] === amountInWei ? quoteData[1] : BigInt(0);

    // Read allowance for ERC-20 tokens
    const { data: allowance } = useReadContract({
        address: tokenInConfig?.isNative ? undefined : tokenInConfig?.address as Address,
        abi: erc20Abi,
        functionName: "allowance",
        args: agentAccount ? [agentAccount, ROUTER_ADDRESS] : undefined,
        query: {
            enabled: !!agentAccount && !!tokenInConfig && !tokenInConfig.isNative,
            refetchInterval: 5000
        }
    });

    // Read balance for sufficiency check
    const { data: ethBalance } = useBalance({
        address: agentAccount,
        query: { enabled: !!agentAccount && tokenInConfig?.isNative }
    });

    const { data: tokenBalance } = useReadContract({
        address: tokenInConfig?.isNative ? undefined : tokenInConfig?.address as Address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: agentAccount ? [agentAccount] : undefined,
        query: {
            enabled: !!agentAccount && !!tokenInConfig && !tokenInConfig.isNative,
            refetchInterval: 5000
        }
    });

    const currentBalance = tokenInConfig?.isNative ? ethBalance?.value : tokenBalance;
    const hasInsufficientBalance = currentBalance !== undefined && amountInWei > currentBalance;
    const isApproveNeeded = tokenInConfig && !tokenInConfig.isNative && (allowance === undefined || allowance < amountInWei);

    const generateAction = () => {
        if (!agentAccount) return;

        if (!tokenInConfig || !tokenOutConfig || !path) return;

        if (isApproveNeeded) {
            // Generate Approve Action
            const data = encodeFunctionData({
                abi: erc20Abi,
                functionName: "approve",
                args: [ROUTER_ADDRESS, amountInWei]
            });

            const action: Action = {
                target: tokenInConfig.address as Address,
                value: BigInt(0),
                data,
            };
            onActionGenerated(action);
            return;
        }

        // Slippage: amountOutMin = expectedOut * (1 - slippage%)
        // If no quote, fallback to 0 (unsafe but allows execution for testing) or prevent
        const estimatedOut = expectedOut > BigInt(0) ? expectedOut : BigInt(0);

        const slippageBps = Math.round(parseFloat(slippage) * 100);
        const amountOutMin = estimatedOut - (estimatedOut * BigInt(slippageBps)) / BigInt(10000);

        // Deadline (20 mins)
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

        let data: `0x${string}`;
        let value: bigint;

        if (tokenInConfig.isNative) {
            // Native BNB → use swapExactETHForTokens (BNB sent as msg.value)
            data = encodeFunctionData({
                abi: ROUTER_ABI,
                functionName: "swapExactETHForTokens",
                args: [amountOutMin, path, agentAccount, deadline]
            });
            value = amountInWei; // BNB amount goes into action.value
        } else {
            // ERC-20 → use swapExactTokensForTokens
            data = encodeFunctionData({
                abi: ROUTER_ABI,
                functionName: "swapExactTokensForTokens",
                args: [amountInWei, amountOutMin, path, agentAccount, deadline]
            });
            value = BigInt(0);
        }

        const action: Action = {
            target: ROUTER_ADDRESS as Address,
            value,
            data,
        };

        onActionGenerated(action);
    };

    // Filter out same token in output options
    const outputTokens = Object.keys(TOKENS).filter(t => t !== tokenIn);

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-[var(--color-paper)]/50">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>{t.agent.console.templates.swap.tokenIn}</Label>
                    <Select value={tokenIn} onValueChange={(v) => { setTokenIn(v); if (v === tokenOut) setTokenOut(outputTokens[0] || ""); }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.keys(TOKENS).map(tk => (
                                <SelectItem key={tk} value={tk}>{tk} {TOKENS[tk].isNative ? "(Native)" : ""}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>{t.agent.console.templates.swap.tokenOut}</Label>
                    <Select value={tokenOut} onValueChange={setTokenOut}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {outputTokens.map(tk => (
                                <SelectItem key={tk} value={tk}>{tk}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {tokenIn === "BNB" && (
                <p className="text-xs text-muted-foreground">
                    💡 Uses <code>swapExactETHForTokens</code> — swaps native BNB from the vault directly.
                </p>
            )}

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

            <Button
                onClick={generateAction}
                disabled={!agentAccount || hasInsufficientBalance}
                className="w-full"
                variant={hasInsufficientBalance ? "destructive" : "default"}
            >
                {hasInsufficientBalance
                    ? `Insufficient ${tokenIn} Balance`
                    : (isApproveNeeded ? `Step 1: Approve ${tokenIn}` : t.agent.console.templates.swap.generate)
                }
            </Button>

            {isApproveNeeded && !hasInsufficientBalance && (
                <p className="text-xs text-muted-foreground text-center">
                    ℹ️ You must approve the Router to spend your {tokenIn} before swapping. <br />
                    This is transaction 1 of 2. After approval confirms, click again to Swap.
                </p>
            )}
        </div>
    );
}
