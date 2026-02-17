/**
 * Static mapping of on-chain group IDs to human-readable display info.
 * Keep in sync with PolicyGuardV3 setGroupMember() calls.
 */

import { Address } from "viem";
import { WBNB_ADDRESS, USDT_ADDRESS } from "./tokens";

export interface GroupInfo {
    name: string;
    nameZh: string;
    members: string[];   // human-readable member names
}

export const GROUP_REGISTRY: Record<number, GroupInfo> = {
    100: {
        name: "Token Whitelist",
        nameZh: "代币白名单",
        members: ["WBNB", "USDT"],
    },
    200: {
        name: "DEX Whitelist",
        nameZh: "DEX 白名单",
        members: ["PancakeSwap V2"],
    },
};

/**
 * Resolve a raw group ID to a display string.
 * Returns e.g. "WBNB, USDT" or falls back to "#100".
 */
export function resolveGroupDisplay(groupId: number | undefined, language: "zh" | "en" = "en"): string {
    if (groupId === undefined) return "—";
    const info = GROUP_REGISTRY[groupId];
    if (!info) return `#${groupId}`;
    return info.members.join(", ");
}

export function resolveGroupName(groupId: number | undefined, language: "zh" | "en" = "en"): string {
    if (groupId === undefined) return "—";
    const info = GROUP_REGISTRY[groupId];
    if (!info) return `Group #${groupId}`;
    return language === "zh" ? info.nameZh : info.name;
}

// ═══════════════════════════════════════════════════════════
//   TOKEN PERMISSION BITMAP — bit index → token info
// ═══════════════════════════════════════════════════════════

/**
 * Each slot maps a bitmap bit position to a tradeable token.
 * Admin must call PolicyGuardV3.setSchemaAllowedBits() with the combined mask
 * to enable these slots for a given policy.
 *
 * To add a new token:
 *   1. Append a new entry here with the next available `bit`
 *   2. Admin calls setSchemaAllowedBits with updated mask
 *   3. Users can then grant/revoke this bit from their Console
 */
export interface TokenPermissionSlot {
    bit: number;           // bit index (0-255)
    symbol: string;
    name: string;
    nameZh: string;
    address: Address;
    decimals: number;
}

export const TOKEN_PERMISSION_SLOTS: TokenPermissionSlot[] = [
    {
        bit: 0,
        symbol: "WBNB",
        name: "Wrapped BNB",
        nameZh: "包装 BNB",
        address: WBNB_ADDRESS,
        decimals: 18,
    },
    {
        bit: 1,
        symbol: "USDT",
        name: "Tether USD",
        nameZh: "USDT 稳定币",
        address: USDT_ADDRESS,
        decimals: 18,
    },
];

/**
 * Compute the combined allowedBits mask for all defined slots.
 * Admin should call: PolicyGuardV3.setSchemaAllowedBits(policyId, version, this value)
 */
export function computeAllowedBitsMask(): bigint {
    let mask = BigInt(0);
    for (const slot of TOKEN_PERMISSION_SLOTS) {
        mask |= BigInt(1) << BigInt(slot.bit);
    }
    return mask;
}

