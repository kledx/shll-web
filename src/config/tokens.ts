// Centralized token registry for BSC Testnet
// All addresses must match PolicyGuard allowlist configuration
// To add a new token: append here and re-apply PolicyGuard config on-chain

import { Address } from "viem";

export interface TokenConfig {
    symbol: string;
    name: string;
    address: Address;
    decimals: number;
    isNative: boolean;
}

// BSC Testnet token addresses — single source of truth
export const WBNB_ADDRESS =
    "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd" as const;
export const USDT_ADDRESS =
    "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd" as const;

// PancakeRouter V2 (BSC Testnet)
export const ROUTER_ADDRESS =
    "0xD99D1c33F9fC3444f8101754aBC46c52416550D1" as const;

/**
 * Full token list used across deposit, vault, and swap UIs.
 * Order: native first, then ERC-20 alphabetically.
 */
export const KNOWN_TOKENS: TokenConfig[] = [
    {
        symbol: "BNB",
        name: "BNB",
        address: "" as Address,
        decimals: 18,
        isNative: true,
    },
    {
        symbol: "USDT",
        name: "USDT",
        address: USDT_ADDRESS,
        decimals: 18,
        isNative: false,
    },
    {
        symbol: "WBNB",
        name: "WBNB",
        address: WBNB_ADDRESS,
        decimals: 18,
        isNative: false,
    },
];

/**
 * Map keyed by symbol, for quick lookups in swap-template etc.
 */
export const TOKEN_MAP: Record<string, TokenConfig> = Object.fromEntries(
    KNOWN_TOKENS.map((t) => [t.symbol, t])
);

/**
 * Only ERC-20 tokens (for vault balance reads).
 */
export const ERC20_TOKENS = KNOWN_TOKENS.filter((t) => !t.isNative);
