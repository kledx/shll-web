// Centralized token registry for BSC Testnet
// All addresses must match PolicyGuard allowlist configuration
// To add a new token:
//   Option A: append to DEFAULT_TOKENS below and re-apply PolicyGuard config on-chain
//   Option B: set NEXT_PUBLIC_EXTRA_TOKENS env var (format: SYMBOL:Name:0xAddr:decimals;...)

import { Address } from "viem";
import { getRuntimeEnv } from "@/lib/runtime-env";

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
 * Built-in token list. Native first, then ERC-20 alphabetically.
 */
const DEFAULT_TOKENS: TokenConfig[] = [
    {
        symbol: "BNB",
        name: "BNB",
        // Use wrapped native address as canonical underlying for routing/comparisons.
        address: WBNB_ADDRESS as Address,
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
 * Parse extra tokens from env var.
 * Format: "SYMBOL:Name:0xAddress:decimals;SYMBOL2:Name2:0xAddr2:decimals2"
 * All extra tokens are treated as ERC-20 (isNative = false).
 */
function parseExtraTokens(): TokenConfig[] {
    const raw = getRuntimeEnv("NEXT_PUBLIC_EXTRA_TOKENS", "");
    if (!raw.trim()) return [];
    const results: TokenConfig[] = [];
    for (const entry of raw.split(";")) {
        const trimmed = entry.trim();
        if (!trimmed) continue;
        const parts = trimmed.split(":");
        if (parts.length < 4) {
            console.warn(`[tokens] Skipping malformed NEXT_PUBLIC_EXTRA_TOKENS entry: "${trimmed}"`);
            continue;
        }
        const [symbol, name, address, decimalsStr] = parts;
        const decimals = Number.parseInt(decimalsStr, 10);
        if (!symbol || !name || !address?.startsWith("0x") || !Number.isFinite(decimals)) {
            console.warn(`[tokens] Skipping invalid NEXT_PUBLIC_EXTRA_TOKENS entry: "${trimmed}"`);
            continue;
        }
        results.push({
            symbol: symbol.trim(),
            name: name.trim(),
            address: address.trim() as Address,
            decimals,
            isNative: false,
        });
    }
    return results;
}

/**
 * Full token list: built-in defaults + env-configured extras.
 * Duplicates (same symbol already in defaults) are skipped.
 */
export const KNOWN_TOKENS: TokenConfig[] = (() => {
    const extras = parseExtraTokens();
    const existingSymbols = new Set(DEFAULT_TOKENS.map((t) => t.symbol));
    const deduped = extras.filter((t) => {
        if (existingSymbols.has(t.symbol)) {
            console.warn(`[tokens] Skipping duplicate NEXT_PUBLIC_EXTRA_TOKENS symbol: "${t.symbol}"`);
            return false;
        }
        existingSymbols.add(t.symbol);
        return true;
    });
    return [...DEFAULT_TOKENS, ...deduped];
})();

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
