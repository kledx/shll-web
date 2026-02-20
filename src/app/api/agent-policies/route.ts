import { NextResponse, NextRequest } from "next/server";
import { createPublicClient, http, getAddress, type Address } from "viem";
import { bsc, bscTestnet } from "viem/chains";

/**
 * /api/agent-policies — Read active policies directly from PolicyGuardV4 on-chain.
 *
 * Why not Indexer? Template-inherited policies don't emit InstancePolicyAdded events,
 * so the Indexer returns empty. Reading on-chain via getActivePolicies() is the
 * single source of truth.
 */

const POLICY_GUARD_V4 = (process.env.NEXT_PUBLIC_POLICY_GUARD_V4 ??
    "0x1ad3e0a263Ec11Cd4729a968031c47E6affA3476") as Address;

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "97");
const selectedChain = chainId === 56 ? bsc : bscTestnet;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? (chainId === 56
    ? "https://bsc-dataseed1.binance.org"
    : "https://data-seed-prebsc-1-s1.bnbchain.org:8545");

const client = createPublicClient({
    chain: selectedChain,
    transport: http(RPC_URL),
});

// Minimal ABI for the functions we need
const policyGuardV4Abi = [
    {
        name: "getActivePolicies",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "instanceId", type: "uint256" }],
        outputs: [{ name: "", type: "address[]" }],
    },
] as const;

// Known policy contract names (deployed by SetupV30Templates)
const KNOWN_POLICIES: Record<string, string> = {
    "0xc2f3c29ae106658b3b00adfd4193c9f3d2e11bc0": "ReceiverGuardPolicy",
    "0xe8dd89d1f3ba8cb098e5b423632b9d8d8cf51207": "SpendingLimitPolicy",
    "0x7a7c3e33062bd782e43aa731b1219996c34f607c": "TokenWhitelistPolicy",
    "0x8403a16ea036239aef00eabcd11f7cfa755ea87aa": "DexWhitelistPolicy",
    "0xc62dfc3304b15e6c7907fed0893c5288d2173770": "CooldownPolicy",
};

export async function GET(req: NextRequest) {
    const tokenId = req.nextUrl.searchParams.get("tokenId");
    if (!tokenId || !/^\d+$/.test(tokenId)) {
        return NextResponse.json({ error: "missing or invalid tokenId" }, { status: 400 });
    }

    try {
        const policies = await client.readContract({
            address: POLICY_GUARD_V4,
            abi: policyGuardV4Abi,
            functionName: "getActivePolicies",
            args: [BigInt(tokenId)],
        });

        const items = (policies as Address[]).map((addr) => {
            const lower = addr.toLowerCase();
            return {
                pluginAddress: getAddress(addr),
                pluginName: KNOWN_POLICIES[lower] ?? `Policy ${addr.slice(0, 10)}`,
                active: true,
                attachedAt: "",
            };
        });

        return NextResponse.json({
            tokenId,
            items,
            count: items.length,
        });
    } catch (error) {
        console.error("[AgentPolicies] RPC error:", error);
        return NextResponse.json({ error: "Failed to read on-chain policies" }, { status: 500 });
    }
}
