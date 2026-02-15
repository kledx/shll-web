"use client";

import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { Address, Hex, decodeAbiParameters, keccak256, slice, toBytes } from "viem";
import { CONTRACTS } from "../config/contracts";

const SWAP_EXACT_TOKENS: Hex = "0x38ed1739";
const SWAP_EXACT_ETH: Hex = "0x7ff36ab5";
const APPROVE: Hex = "0x095ea7b3";
const KEY_MAX_SLIPPAGE_BPS = keccak256(toBytes("MAX_SLIPPAGE_BPS"));

type GuardFunctionName =
    | "targetAllowed"
    | "selectorAllowed"
    | "tokenAllowed"
    | "spenderAllowed"
    | "limits";

export interface PreflightViolation {
    code: string;
    messageZh: string;
    messageEn: string;
    // Reserved for admin tooling; renter-facing UI should not expose these directly.
    fixCommand?: string;
    fixAction?: {
        type: "add_target" | "add_selector" | "add_token" | "add_spender";
        params: Record<string, string>;
    };
}

export interface PreflightResult {
    violations: PreflightViolation[];
    isChecking: boolean;
    isReady: boolean;
}

function extractSelector(data: Hex): Hex {
    if (data.length < 10) return "0x00000000";
    return slice(data, 0, 4) as Hex;
}

function parseSwapPath(data: Hex): Address[] {
    try {
        const decoded = decodeAbiParameters(
            [
                { type: "uint256" },
                { type: "uint256" },
                { type: "address[]" },
                { type: "address" },
                { type: "uint256" },
            ],
            ("0x" + data.slice(10)) as Hex
        );
        return (decoded[2] as Address[]) || [];
    } catch {
        return [];
    }
}

function parseApproveSpender(data: Hex): Address | null {
    try {
        const decoded = decodeAbiParameters(
            [{ type: "address" }, { type: "uint256" }],
            ("0x" + data.slice(10)) as Hex
        );
        return decoded[0] as Address;
    } catch {
        return null;
    }
}

export function usePolicyPreflight(
    action: { target: Address; value: bigint; data: Hex } | null
): PreflightResult {
    const guardAddress = CONTRACTS.PolicyGuard.address;
    const guardAbi = CONTRACTS.PolicyGuard.abi;

    const selector = useMemo(
        () => (action ? extractSelector(action.data) : ("0x00000000" as Hex)),
        [action]
    );
    const isSwap = selector === SWAP_EXACT_TOKENS;
    const isSwapETH = selector === SWAP_EXACT_ETH;
    const isApprove = selector === APPROVE;

    const swapPath = useMemo(() => {
        if (!action || !isSwap) return [];
        return parseSwapPath(action.data);
    }, [action, isSwap]);

    const approveSpender = useMemo(() => {
        if (!action || !isApprove) return null;
        return parseApproveSpender(action.data);
    }, [action, isApprove]);

    const contracts = useMemo(() => {
        if (!action) return [];

        const calls: Array<{
            address: Address;
            abi: typeof guardAbi;
            functionName: GuardFunctionName;
            args: readonly unknown[];
        }> = [];

        calls.push({
            address: guardAddress,
            abi: guardAbi,
            functionName: "targetAllowed",
            args: [action.target],
        });

        calls.push({
            address: guardAddress,
            abi: guardAbi,
            functionName: "selectorAllowed",
            args: [action.target, selector],
        });

        for (const token of swapPath) {
            calls.push({
                address: guardAddress,
                abi: guardAbi,
                functionName: "tokenAllowed",
                args: [token],
            });
        }

        if (isApprove && approveSpender) {
            calls.push({
                address: guardAddress,
                abi: guardAbi,
                functionName: "spenderAllowed",
                args: [action.target, approveSpender],
            });
        }

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

    const { data: results, isLoading } = useReadContracts({
        contracts,
        query: {
            enabled: contracts.length > 0,
            staleTime: 30_000,
            gcTime: 5 * 60_000,
        },
    });

    const violations = useMemo((): PreflightViolation[] => {
        if (!results || !action) return [];

        const v: PreflightViolation[] = [];
        let idx = 0;

        if (results[idx] && results[idx].result === false) {
            v.push({
                code: "TARGET_NOT_ALLOWED",
                messageZh: "当前策略暂不支持该目标合约，请更换模板或交易对后再试。",
                messageEn: "This target is blocked by current policy. Try another template or trading pair.",
            });
        }
        idx++;

        if (results[idx] && results[idx].result === false) {
            v.push({
                code: "SELECTOR_NOT_ALLOWED",
                messageZh: "当前策略暂不支持该动作类型，请尝试其他操作。",
                messageEn: "This action type is blocked by current policy. Try a different operation.",
            });
        }
        idx++;

        for (let i = 0; i < swapPath.length; i++) {
            if (results[idx] && results[idx].result === false) {
                v.push({
                    code: "TOKEN_NOT_ALLOWED",
                    messageZh: "当前策略不支持该代币组合，请更换输入或输出代币。",
                    messageEn: "This token pair is blocked by current policy. Please select different tokens.",
                });
            }
            idx++;
        }

        if (isApprove && approveSpender) {
            if (results[idx] && results[idx].result === false) {
                v.push({
                    code: "SPENDER_NOT_ALLOWED",
                    messageZh: "当前策略不支持该授权路径，请更换操作后再试。",
                    messageEn: "This approval route is blocked by current policy. Try a different action.",
                });
            }
        }

        return v;
    }, [results, action, swapPath, isApprove, approveSpender]);

    return {
        violations,
        isChecking: isLoading,
        isReady: !!action && !isLoading,
    };
}
