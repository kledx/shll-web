"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { encodeFunctionData, parseUnits, Address, erc20Abi, isAddress } from "viem";
import { useTranslation } from "@/hooks/useTranslation";
import { useReadContract, useBalance } from "wagmi";
import {
    calcAmountOutMin,
    getOutputTokens,
    getSwapPairFlags,
    resolveExpectedOut,
    SwapTokenConfig,
} from "@/lib/console/swap-utils";
import { Action } from "./action-types";
import { TOKEN_MAP, WBNB_ADDRESS, ROUTER_ADDRESS } from "@/config/tokens";

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

const WBNB_ABI = [
    {
        inputs: [],
        name: "deposit",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "wad", type: "uint256" }],
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }
] as const;

// Token options — from centralized config
const TOKENS: Record<string, SwapTokenConfig> = Object.fromEntries(
    Object.entries(TOKEN_MAP).map(([k, v]) => [k, { address: v.address, decimals: v.decimals, isNative: v.isNative }])
);
const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0];

interface SwapTemplateProps {
    onActionGenerated: (action: Action) => void;
    agentAccount?: Address;
}

export function SwapTemplate({ onActionGenerated, agentAccount }: SwapTemplateProps) {
    const { t, language } = useTranslation();
    const [tokenIn, setTokenIn] = useState<string>("BNB");
    const [tokenOut, setTokenOut] = useState<string>("USDT");
    const [amountIn, setAmountIn] = useState<string>("0.001");
    const [slippage, setSlippage] = useState<string>("0.5");

    const tokenInConfig = TOKENS[tokenIn];
    const tokenOutConfig = TOKENS[tokenOut];
    const outputTokens = getOutputTokens(TOKENS, tokenIn);
    const {
        isWrapUnwrapPair,
        isWrap,
        isUnwrap,
        isRouterSwap,
        isUnsupportedPair,
    } = getSwapPairFlags(TOKENS, tokenIn, tokenOut);

    useEffect(() => {
        const options = getOutputTokens(TOKENS, tokenIn);
        if (options.length > 0 && !options.includes(tokenOut)) {
            setTokenOut(options[0]!);
        }
    }, [tokenIn, tokenOut]);

    // Amount with correct decimals
    const amountInWei = parseUnits(amountIn, tokenInConfig?.decimals || 18);
    const tokenInRouteAddress =
        tokenInConfig && (tokenInConfig.isNative ? WBNB_ADDRESS : tokenInConfig.address);
    const tokenOutRouteAddress =
        tokenOutConfig && (tokenOutConfig.isNative ? WBNB_ADDRESS : tokenOutConfig.address);
    const hasInvalidRouterPathAddress =
        isRouterSwap &&
        (!tokenInRouteAddress ||
            !tokenOutRouteAddress ||
            !isAddress(tokenInRouteAddress) ||
            !isAddress(tokenOutRouteAddress));
    const path =
        isRouterSwap && !hasInvalidRouterPathAddress
            ? [tokenInRouteAddress as Address, tokenOutRouteAddress as Address]
            : undefined;

    // Fetch Quote
    const { data: quoteData } = useReadContract({
        address: ROUTER_ADDRESS as Address,
        abi: ROUTER_ABI,
        functionName: "getAmountsOut",
        args: path && amountInWei > BigInt(0) ? [amountInWei, path] : undefined,
        query: {
            enabled: isRouterSwap && !!path && amountInWei > BigInt(0),
            refetchInterval: 10000
        }
    });

    // Verify quote corresponds to current input amount to prevent stale data
    const expectedOut = resolveExpectedOut({
        isWrapUnwrapPair,
        amountInWei,
        quoteData,
    });

    // Read allowance for ERC-20 tokens
    const { data: allowance } = useReadContract({
        address: tokenInConfig?.isNative ? undefined : tokenInConfig?.address as Address,
        abi: erc20Abi,
        functionName: "allowance",
        args: agentAccount ? [agentAccount, ROUTER_ADDRESS] : undefined,
        query: {
            enabled: !!agentAccount && !!tokenInConfig && !tokenInConfig.isNative && !isUnwrap,
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
    const isApproveNeeded =
        !!tokenInConfig &&
        !tokenInConfig.isNative &&
        !isUnwrap &&
        (allowance === undefined || allowance < amountInWei);

    const generateAction = () => {
        if (!agentAccount) return;

        if (!tokenInConfig || !tokenOutConfig) return;
        if (isUnsupportedPair) return;
        if (hasInvalidRouterPathAddress) return;

        if (isWrap) {
            const data = encodeFunctionData({
                abi: WBNB_ABI,
                functionName: "deposit",
                args: []
            });
            onActionGenerated({
                target: WBNB_ADDRESS as Address,
                value: amountInWei,
                data,
            });
            return;
        }

        if (isUnwrap) {
            const data = encodeFunctionData({
                abi: WBNB_ABI,
                functionName: "withdraw",
                args: [amountInWei]
            });
            onActionGenerated({
                target: WBNB_ADDRESS as Address,
                value: BigInt(0),
                data,
            });
            return;
        }

        if (!path) return;

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
        const amountOutMin = calcAmountOutMin(expectedOut, slippage);

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

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-[var(--color-paper)]/50">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>{t.agent.console.templates.swap.tokenIn}</Label>
                    <Select value={tokenIn} onValueChange={setTokenIn}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.keys(TOKENS).map(tk => (
                                <SelectItem key={tk} value={tk}>{tk} {TOKENS[tk].isNative ? `(${t.common.native})` : ""}</SelectItem>
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
                    💡 {t.agent.console.templates.swap.bnbNotice}
                </p>
            )}

            {isUnsupportedPair && (
                <p className="text-xs text-red-600">
                    {t.agent.console.templates.swap.unsupportedPair}
                </p>
            )}
            {hasInvalidRouterPathAddress && (
                <p className="text-xs text-red-600">
                    {language === "zh"
                        ? "代币地址配置无效，请检查 TOKEN_MAP / WBNB_ADDRESS。"
                        : "Invalid token address configuration. Check TOKEN_MAP / WBNB_ADDRESS."}
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
                disabled={!agentAccount || hasInsufficientBalance || isUnsupportedPair || hasInvalidRouterPathAddress}
                className="w-full"
                variant={hasInsufficientBalance ? "destructive" : "default"}
            >
                {isUnsupportedPair
                    ? t.agent.console.templates.swap.unsupportedPair
                    : hasInsufficientBalance
                        ? t.agent.console.templates.swap.insufficientBalance.replace("{token}", tokenIn)
                        : (isApproveNeeded ? t.agent.console.templates.swap.stepApprove.replace("{token}", tokenIn) : t.agent.console.templates.swap.generate)
                }
            </Button>

            {isApproveNeeded && !hasInsufficientBalance && !isUnsupportedPair && (
                <p className="text-xs text-muted-foreground text-center">
                    ℹ️ {t.agent.console.templates.swap.approveNotice.replace("{token}", tokenIn)} <br />
                    {t.agent.console.templates.swap.txNotice}
                </p>
            )}
        </div>
    );
}
