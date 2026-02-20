import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { bsc, bscTestnet } from 'viem/chains';
import { CONTRACTS } from '@/config/contracts';

interface AgentMetadataResult {
    persona?: string;
    experience?: string;
    voiceHash?: string;
    animationURI?: string;
    vaultURI?: string;
    vaultHash?: string;
}

interface PersonaJson {
    name?: string;
    description?: string;
}

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '97');
const selectedChain = chainId === 56 ? bsc : bscTestnet;
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || (chainId === 56
    ? 'https://bsc-dataseed1.binance.org'
    : 'https://bsc-testnet.publicnode.com');

const client = createPublicClient({
    chain: selectedChain,
    transport: http(rpcUrl),
});

function parsePersona(personaRaw: string | undefined, tokenId: string): PersonaJson {
    if (!personaRaw) {
        return { name: `Agent #${tokenId}`, description: "A ShellAgent AI entity." };
    }
    try {
        const parsed = JSON.parse(personaRaw) as PersonaJson;
        return {
            name: parsed.name || `Agent #${tokenId}`,
            description: parsed.description || "A ShellAgent AI entity.",
        };
    } catch (error) {
        console.error("Failed to parse persona JSON", error);
        return { name: `Agent #${tokenId}`, description: "A ShellAgent AI entity." };
    }
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return "Unknown error";
}

function getErrorStatus(error: unknown): number {
    if (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        (error as { name?: unknown }).name === "ContractFunctionExecutionError"
    ) {
        return 404;
    }
    return 500;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: tokenId } = await params;

    try {
        // 1. Fetch metadata from AgentNFA contract
        const result = await client.readContract({
            address: CONTRACTS.AgentNFA.address as Address,
            abi: CONTRACTS.AgentNFA.abi,
            functionName: 'getAgentMetadata',
            args: [BigInt(tokenId)],
        }) as AgentMetadataResult;
        const persona = parsePersona(result.persona, tokenId);

        // 2. Construct standard ERC-721 Metadata
        // Note: NFAScan and others look for 'name', 'description', 'image', and 'attributes'
        const metadata = {
            name: persona.name || `Agent #${tokenId}`,
            description: persona.description || "A ShellAgent AI entity.",
            image: result.animationURI || "", // Ideally this is a thumbnail, but animationURI is what we have
            animation_url: result.animationURI || "",
            external_url: `https://shll.run/agent/${CONTRACTS.AgentNFA.address}/${tokenId}`,
            attributes: [
                { trait_type: "Experience", value: result.experience || "Fresh" },
                { trait_type: "Voice", value: result.voiceHash || "Default" },
            ],
            // Raw BAP-578 Data
            shll_metadata: {
                voiceHash: result.voiceHash,
                vaultURI: result.vaultURI,
                vaultHash: result.vaultHash,
            }
        };

        return NextResponse.json(metadata, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error: unknown) {
        console.error(`[Metadata API] Error fetching for ID ${tokenId}:`, error);
        return NextResponse.json(
            {
                error: "Agent fetch failed",
                message: getErrorMessage(error),
                tokenId
            },
            { status: getErrorStatus(error) }
        );
    }
}
