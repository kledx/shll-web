import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { bscTestnet } from 'viem/chains';
import { CONTRACTS } from '@/config/contracts';

// Using a reliable public RPC for the backend API
const client = createPublicClient({
    chain: bscTestnet,
    transport: http('https://bsc-testnet.publicnode.com'),
});

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
        }) as any;

        // result: { persona, experience, voiceHash, animationURI, vaultURI, vaultHash }
        let persona = { name: `Agent #${tokenId}`, description: "A ShellAgent AI entity." };
        try {
            if (result.persona) {
                persona = JSON.parse(result.persona);
            }
        } catch (e) {
            console.error("Failed to parse persona JSON", e);
        }

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
    } catch (error: any) {
        console.error(`[Metadata API] Error fetching for ID ${tokenId}:`, error);
        return NextResponse.json(
            {
                error: "Agent fetch failed",
                message: error.message || "Unknown error",
                tokenId
            },
            { status: error.name === 'ContractFunctionExecutionError' ? 404 : 500 }
        );
    }
}
