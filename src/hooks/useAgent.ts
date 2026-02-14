import { useReadContracts } from "wagmi";
import { Address, formatEther, keccak256, toBytes } from "viem";
import { CONTRACTS } from "../config/contracts";

export interface AgentData {
    tokenId: string;
    nfaAddress: string;
    owner: string;
    name: string;
    description: string;
    pricePerDay: string;
    pricePerDayRaw: bigint;
    minDays: number;
    status: "active" | "rented" | "paused" | "terminated";
    renter: string;
    expires: number;
    listingId: string;
    isListed: boolean;
    policy: {
        maxDeadlineWindow: number;
        maxPathLength: number;
        maxSwapAmountIn: string;
        maxApproveAmount: string;
        maxRepayAmount: string;
        allowedTokens: string[];
        allowedSpenders: string[];
    };
    metadata: {
        persona: string;
        experience: string;
        voiceHash: string;
        animationURI: string;
        vaultURI: string;
        vaultHash: string;
    };
    state: {
        balance: string;
        status: number;
        logicAddress: string;
        lastActionTimestamp: number;
    }
}

// Policy Keys
const KEY_MAX_DEADLINE = keccak256(toBytes("MAX_DEADLINE_WINDOW"));
const KEY_MAX_PATH = keccak256(toBytes("MAX_PATH_LENGTH"));
const KEY_MAX_SWAP = keccak256(toBytes("MAX_SWAP_AMOUNT_IN"));
const KEY_MAX_APPROVE = keccak256(toBytes("MAX_APPROVE_AMOUNT"));
const KEY_MAX_REPAY = keccak256(toBytes("MAX_REPAY_AMOUNT"));

interface MetadataStruct {
    persona?: string;
    experience?: string;
    voiceHash?: string;
    animationURI?: string;
    vaultURI?: string;
    vaultHash?: string;
}

interface StateStruct {
    balance?: bigint;
    status?: bigint | number;
    logicAddress?: Address;
    lastActionTimestamp?: bigint | number;
}

interface ParsedPersona {
    name?: string;
    description?: string;
    role?: string;
}

export function useAgent(tokenId: string, nfaAddressInput?: string) {
    const nfaAddress = (nfaAddressInput || CONTRACTS.AgentNFA.address) as Address;
    const listingManagerAddress = CONTRACTS.ListingManager.address;
    const policyGuardAddress = CONTRACTS.PolicyGuard.address;
    const isValidTokenId = /^\d+$/.test(tokenId || "");
    const isValidNfaAddress = /^0x[a-fA-F0-9]{40}$/.test(nfaAddress);
    const isValidListingManager = /^0x[a-fA-F0-9]{40}$/.test(listingManagerAddress);
    const isValidPolicyGuard = /^0x[a-fA-F0-9]{40}$/.test(policyGuardAddress);
    const canQuery = isValidTokenId && isValidNfaAddress && isValidListingManager && isValidPolicyGuard;
    const tokenIdBigInt = canQuery ? BigInt(tokenId) : BigInt(0);

    const { data: reads, isLoading, error } = useReadContracts({
        contracts: [
            // 0: Owner
            {
                address: nfaAddress,
                abi: CONTRACTS.AgentNFA.abi,
                functionName: "ownerOf",
                args: [tokenIdBigInt],
            },
            // 1: User (Renter)
            {
                address: nfaAddress,
                abi: CONTRACTS.AgentNFA.abi,
                functionName: "userOf",
                args: [tokenIdBigInt],
            },
            // 2: User Expires
            {
                address: nfaAddress,
                abi: CONTRACTS.AgentNFA.abi,
                functionName: "userExpires",
                args: [tokenIdBigInt],
            },
            // 3: Metadata (BAP-578)
            {
                address: nfaAddress,
                abi: CONTRACTS.AgentNFA.abi,
                functionName: "getAgentMetadata",
                args: [tokenIdBigInt],
            },
            // 4: State (BAP-578)
            {
                address: nfaAddress,
                abi: CONTRACTS.AgentNFA.abi,
                functionName: "getState",
                args: [tokenIdBigInt],
            },
            // 5: Get Listing ID
            {
                address: listingManagerAddress,
                abi: CONTRACTS.ListingManager.abi,
                functionName: "getListingId",
                args: [nfaAddress, tokenIdBigInt],
            },
            // 6: Policy: Max Deadline
            {
                address: policyGuardAddress,
                abi: CONTRACTS.PolicyGuard.abi,
                functionName: "limits",
                args: [KEY_MAX_DEADLINE],
            },
            // 7: Policy: Max Path
            {
                address: policyGuardAddress,
                abi: CONTRACTS.PolicyGuard.abi,
                functionName: "limits",
                args: [KEY_MAX_PATH],
            },
            // 8: Policy: Max Swap
            {
                address: policyGuardAddress,
                abi: CONTRACTS.PolicyGuard.abi,
                functionName: "limits",
                args: [KEY_MAX_SWAP],
            },
            // 9: Policy: Max Approve
            {
                address: policyGuardAddress,
                abi: CONTRACTS.PolicyGuard.abi,
                functionName: "limits",
                args: [KEY_MAX_APPROVE],
            },
            // 10: Policy: Max Repay
            {
                address: policyGuardAddress,
                abi: CONTRACTS.PolicyGuard.abi,
                functionName: "limits",
                args: [KEY_MAX_REPAY],
            },
        ],
        query: {
            enabled: canQuery,
        }
    });

    // Special handling for Listing (need listingId first)
    const listingId = reads?.[5]?.result as `0x${string}`;
    const { data: listingData } = useReadContracts({
        contracts: [{
            address: listingManagerAddress,
            abi: CONTRACTS.ListingManager.abi,
            functionName: "listings",
            args: [listingId || "0x0000000000000000000000000000000000000000000000000000000000000000"],
        }],
        query: {
            enabled: !!listingId && listingId !== "0x0000000000000000000000000000000000000000000000000000000000000000"
        }
    });

    if (!canQuery) {
        return {
            data: null,
            isLoading: false,
            error: new Error("Invalid tokenId or contract address"),
        };
    }

    if (isLoading) {
        return { data: null, isLoading: true, error };
    }

    if (error) {
        return { data: null, isLoading: false, error };
    }

    if (!reads) {
        return {
            data: null,
            isLoading: false,
            error: new Error("No on-chain data returned"),
        };
    }

    const owner = reads[0].result as Address;
    const user = reads[1].result as Address;
    const userExpires = reads[2].result as bigint;
    const metadata = (reads[3].result as MetadataStruct | undefined) ?? {};
    const state = (reads[4].result as StateStruct | undefined) ?? {};

    // Listing Read
    const listing = listingData?.[0]?.result as readonly unknown[] | undefined;
    const listingActive = Boolean(listing?.[5]);
    const listingPricePerDay = typeof listing?.[3] === "bigint" ? listing[3] : BigInt(0);
    const listingMinDays = typeof listing?.[4] === "bigint" ? Number(listing[4]) : 0;

    // Policy Limits
    const maxDeadline = reads[6].result as bigint;
    const maxPath = reads[7].result as bigint;
    const maxSwap = reads[8].result as bigint;
    const maxApprove = reads[9].result as bigint;
    const maxRepay = reads[10].result as bigint;

    // Parse Metadata JSON
    const fallbackName = `Agent #${tokenId}`;
    let parsedPersona = {
        name: fallbackName,
        description: metadata?.experience || "No metadata",
        role: "Agent"
    };
    try {
        const rawPersona = metadata?.persona?.trim();
        if (rawPersona) {
            const parsed = JSON.parse(rawPersona) as ParsedPersona | string;
            if (typeof parsed === "string") {
                parsedPersona.name = parsed || fallbackName;
            } else {
                parsedPersona = {
                    name: parsed.name ?? fallbackName,
                    description: parsed.description ?? parsedPersona.description,
                    role: parsed.role ?? "Agent",
                };
            }
        }
    } catch (e) {
        if (metadata?.persona?.trim()) {
            parsedPersona.name = metadata.persona.trim();
        }
        console.warn("Failed to parse persona JSON", e);
    }

    // Determine status
    // BAP-578 Status: 0=Active, 1=Paused, 2=Terminated
    const bapStatus = state?.status || 0;
    let uiStatus: AgentData["status"] = "active";
    if (bapStatus === 1) uiStatus = "paused";
    if (bapStatus === 2) uiStatus = "terminated";
    if (uiStatus === "active" && user && user !== "0x0000000000000000000000000000000000000000") {
        uiStatus = "rented";
    }

    // Format Data
    const agentData: AgentData = {
        tokenId,
        nfaAddress,
        owner: owner || "",
        name: parsedPersona.name,
        description: parsedPersona.description,
        pricePerDay: listingActive ? formatEther(listingPricePerDay) + " BNB" : "Not Listed",
        pricePerDayRaw: listingPricePerDay,
        minDays: listingActive ? listingMinDays : 0,
        status: uiStatus,
        renter: user || "0x0000000000000000000000000000000000000000",
        expires: Number(userExpires || 0),
        listingId: listingId || "",
        isListed: listingActive,
        policy: {
            maxDeadlineWindow: Number(maxDeadline || 0),
            maxPathLength: Number(maxPath || 0),
            maxSwapAmountIn: maxSwap ? formatEther(maxSwap) + " tokens" : "Unlimited",
            maxApproveAmount: maxApprove ? formatEther(maxApprove) + " tokens" : "Unlimited",
            maxRepayAmount: maxRepay ? formatEther(maxRepay) + " tokens" : "Unlimited",
            allowedTokens: [], // Global
            allowedSpenders: [] // Global
        },
        metadata: {
            persona: metadata?.persona || "",
            experience: metadata?.experience || "",
            voiceHash: metadata?.voiceHash || "",
            animationURI: metadata?.animationURI || "",
            vaultURI: metadata?.vaultURI || "",
            vaultHash: metadata?.vaultHash || "",
        },
        state: {
            balance: state?.balance ? formatEther(state.balance) : "0",
            status: Number(state?.status || 0),
            logicAddress: state?.logicAddress || "",
            lastActionTimestamp: Number(state?.lastActionTimestamp || 0)
        }
    };

    return { data: agentData, isLoading: false, error };
}
