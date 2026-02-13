"use client";

import { useReadContracts } from "wagmi";
import { Address, Hex, keccak256, toBytes, slice, decodeAbiParameters } from "viem";
import { CONTRACTS } from "../config/contracts";
import { useMemo } from "react";

// Known selectors matching PolicyKeys.sol
const SWAP_EXACT_TOKENS: Hex = "0x38ed1739";
const SWAP_EXACT_ETH: Hex = "0x7ff36ab5";
const APPROVE: Hex = "0x095ea7b3";
const REPAY_BORROW_BEHALF: Hex = "0x2608f818";

// Slippage limit key
const KEY_MAX_SLIPPAGE_BPS = keccak256(toBytes("MAX_SLIPPAGE_BPS"));

export interface PreflightViolation {
    code: string;
    messageZh: string;
    messageEn: string;
    fixCommand?: string;
    fixAction?: {
        type: 'add_target' | 'add_selector' | 'add_token' | 'add_spender';
        params: Record<string, string>;
    };
}

export interface PreflightResult {
    violations: PreflightViolation[];
    isChecking: boolean;
    isReady: boolean;
}

/**
 * Extract selector from calldata (first 4 bytes)
 */
function extractSelector(data: Hex): Hex {
    if (data.length < 10) return "0x00000000";
    return slice(data, 0, 4) as Hex;
}

/**
 * Parse swap path tokens from swapExactTokensForTokens calldata
 */
function parseSwapPath(data: Hex): Address[] {
    try {
        // swapExactTokensForTokens(uint256,uint256,address[],address,uint256)
        const decoded = decodeAbiParameters(
            [
                { type: "uint256" }, // amountIn
                { type: "uint256" }, // amountOutMin
                { type: "address[]" }, // path
                { type: "address" }, // to
                { type: "uint256" }, // deadline
            ],
            ("0x" + data.slice(10)) as Hex
        );
        return (decoded[2] as Address[]) || [];
    } catch {
        return [];
    }
}

/**
 * Parse approve spender from approve calldata
 */
function parseApproveSpender(data: Hex): Address | null {
    try {
        const decoded = decodeAbiParameters(
            [
                { type: "address" }, // spender
                { type: "uint256" }, // amount
            ],
            ("0x" + data.slice(10)) as Hex
        );
        return decoded[0] as Address;
    } catch {
        return null;
    }
}

/**
 * usePolicyPreflight — Pre-check policy permissions BEFORE simulation
 * Reads on-chain PolicyGuard allowlists and returns a list of violations
 */
export function usePolicyPreflight(action: { target: Address; value: bigint; data: Hex } | null): PreflightResult {
    const guardAddress = CONTRACTS.PolicyGuard.address;
    const guardAbi = CONTRACTS.PolicyGuard.abi;

    // Parse action parameters
    const selector = action ? extractSelector(action.data) : ("0x00000000" as Hex);
    const isSwap = selector === SWAP_EXACT_TOKENS;
    const isSwapETH = selector === SWAP_EXACT_ETH;
    const isApprove = selector === APPROVE;
    const swapPath = action && isSwap ? parseSwapPath(action.data) : [];
    const approveSpender = action && isApprove ? parseApproveSpender(action.data) : null;

    // Build multicall contracts array
    const contracts = useMemo(() => {
        if (!action) return [];

        const calls: Array<{
            address: Address;
            abi: typeof guardAbi;
            functionName: string;
            args: unknown[];
        }> = [];

        // 0: targetAllowed(action.target)
        calls.push({
            address: guardAddress,
            abi: guardAbi,
            functionName: "targetAllowed",
            args: [action.target],
        });

        // 1: selectorAllowed(action.target, selector)
        calls.push({
            address: guardAddress,
            abi: guardAbi,
            functionName: "selectorAllowed",
            args: [action.target, selector],
        });

        // 2-N: tokenAllowed for each token in swap path
        for (const token of swapPath) {
            calls.push({
                address: guardAddress,
                abi: guardAbi,
                functionName: "tokenAllowed",
                args: [token],
            });
        }

        // Spender check for approve
        if (isApprove && approveSpender) {
            calls.push({
                address: guardAddress,
                abi: guardAbi,
                functionName: "spenderAllowed",
                args: [action.target, approveSpender],
            });
        }

        // MAX_SLIPPAGE_BPS limit
        if (isSwap || isSwapETH) {
            calls.push({
                address: guardAddress,
                abi: guardAbi,
                functionName: "limits",
                args: [KEY_MAX_SLIPPAGE_BPS],
            });
        }

        return calls;
    }, [action, guardAddress, guardAbi, selector, isSwap, isSwapETH, isApprove, swapPath, approveSpender]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: results, isLoading } = useReadContracts({
        contracts: contracts as any,
        query: {
            enabled: contracts.length > 0,
            staleTime: 30_000,      // 30 seconds - don't refetch within this time
            gcTime: 5 * 60_000,     // 5 minutes - cache time (formerly cacheTime)
        },
    });

    // Build violations from results
    const violations = useMemo((): PreflightViolation[] => {
        if (!results || !action) return [];

        const v: PreflightViolation[] = [];
        let idx = 0;

        // 0: targetAllowed
        if (results[idx] && results[idx].result === false) {
            v.push({
                code: "TARGET_NOT_ALLOWED",
                messageZh: `目标合约 ${action.target.slice(0, 10)}... 不在白名单`,
                messageEn: `Target ${action.target.slice(0, 10)}... not in allowlist`,
                fixCommand: `forge script script/ApplyPolicy.s.sol --sig "addTarget(address)" ${action.target} --rpc-url $RPC_URL --broadcast`,
                fixAction: {
                    type: 'add_target',
                    params: { address: action.target },
                },
            });
        }
        idx++;

        // 1: selectorAllowed
        if (results[idx] && results[idx].result === false) {
            v.push({
                code: "SELECTOR_NOT_ALLOWED",
                messageZh: `函数选择器 ${selector} 不在白名单`,
                messageEn: `Selector ${selector} not in allowlist`,
                fixCommand: `forge script script/ApplyPolicy.s.sol --sig "addSelector(address,bytes4)" ${action.target} ${selector} --rpc-url $RPC_URL --broadcast`,
                fixAction: {
                    type: 'add_selector',
                    params: { target: action.target, selector },
                },
            });
        }
        idx++;

        // Token checks
        for (let i = 0; i < swapPath.length; i++) {
            if (results[idx] && results[idx].result === false) {
                v.push({
                    code: "TOKEN_NOT_ALLOWED",
                    messageZh: `代币 ${swapPath[i].slice(0, 10)}... 不在白名单`,
                    messageEn: `Token ${swapPath[i].slice(0, 10)}... not in allowlist`,
                    fixCommand: `forge script script/ApplyPolicy.s.sol --sig "addToken(address)" ${swapPath[i]} --rpc-url $RPC_URL --broadcast`,
                    fixAction: {
                        type: 'add_token',
                        params: { address: swapPath[i] },
                    },
                });
            }
            idx++;
        }

        // Spender check
        if (isApprove && approveSpender) {
            if (results[idx] && results[idx].result === false) {
                v.push({
                    code: "SPENDER_NOT_ALLOWED",
                    messageZh: `授权对象 ${approveSpender.slice(0, 10)}... 不在白名单`,
                    messageEn: `Spender ${approveSpender.slice(0, 10)}... not in allowlist`,
                    fixCommand: `forge script script/ApplyPolicy.s.sol --sig "addSpender(address,address)" ${action.target} ${approveSpender} --rpc-url $RPC_URL --broadcast`,
                    fixAction: {
                        type: 'add_spender',
                        params: { token: action.target, spender: approveSpender },
                    },
                });
            }
            idx++;
        }

        return v;
    }, [results, action, selector, isApprove, approveSpender, swapPath]);

    return {
        violations,
        isChecking: isLoading,
        isReady: !!action && !isLoading,
    };
}
