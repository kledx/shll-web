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
    isTemplateListing: boolean;
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

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
const ZERO_LISTING_ID = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

type ContractRead = {
    status?: "success" | "failure";
    result?: unknown;
};

function isReadSuccess<T>(read: ContractRead | undefined): read is ContractRead & { status: "success"; result: T } {
    return read?.status === "success";
}

function getTupleField(tuple: unknown, key: string, index: number): unknown {
    if (!tuple || (typeof tuple !== "object" && !Array.isArray(tuple))) return undefined;
    const keyed = (tuple as Record<string, unknown>)[key];
    if (keyed !== undefined) return keyed;
    if (Array.isArray(tuple)) return tuple[index];
    return undefined;
}

function toBigIntOrZero(value: unknown): bigint {
    if (typeof value === "bigint") return value;
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) return BigInt(Math.trunc(value));
    if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value);
    return BigInt(0);
}

function toNumberOrZero(value: unknown): number {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "bigint") return Number(value);
    return 0;
}

function pickText(primary: unknown, fallback: unknown): string {
    const a = typeof primary === "string" ? primary.trim() : "";
    if (a) return a;
    const b = typeof fallback === "string" ? fallback.trim() : "";
    return b;
}

function pickVaultHash(primary: unknown, fallback: unknown): string {
    const a = typeof primary === "string" ? primary.trim() : "";
    if (a && a.toLowerCase() !== ZERO_HASH) return a;
    const b = typeof fallback === "string" ? fallback.trim() : "";
    if (b) return b;
    return a;
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
            // 11: templateOf (for instance metadata fallback)
            {
                address: nfaAddress,
                abi: CONTRACTS.AgentNFA.abi,
                functionName: "templateOf",
                args: [tokenIdBigInt],
            },
        ],
        query: {
            enabled: canQuery,
        }
    });

    const templateIdResult = reads?.[11] as ContractRead | undefined;
    const templateId =
        isReadSuccess<bigint>(templateIdResult) &&
            typeof templateIdResult.result === "bigint" &&
            templateIdResult.result > BigInt(0)
            ? templateIdResult.result
            : undefined;

    const { data: templateMetadataData } = useReadContracts({
        contracts: [{
            address: nfaAddress,
            abi: CONTRACTS.AgentNFA.abi,
            functionName: "getAgentMetadata",
            args: [templateId ?? BigInt(0)],
        }],
        query: {
            enabled: templateId !== undefined,
        }
    });

    // Special handling for Listing (need listingId first)
    const listingIdResult = reads?.[5] as ContractRead | undefined;
    const listingId = isReadSuccess<`0x${string}`>(listingIdResult) && typeof listingIdResult.result === "string"
        ? listingIdResult.result
        : undefined;

    const { data: listingData } = useReadContracts({
        contracts: [{
            address: listingManagerAddress,
            abi: CONTRACTS.ListingManager.abi,
            functionName: "listings",
            args: [listingId || ZERO_LISTING_ID],
        }],
        query: {
            enabled: !!listingId && listingId !== ZERO_LISTING_ID
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

    const ownerResult = reads[0] as ContractRead | undefined;
    if (!isReadSuccess<Address>(ownerResult) || typeof ownerResult.result !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(ownerResult.result)) {
        return {
            data: null,
            isLoading: false,
            error: new Error("Failed to read token owner"),
        };
    }
    const owner = ownerResult.result as Address;

    const userResult = reads[1] as ContractRead | undefined;
    const expiresResult = reads[2] as ContractRead | undefined;
    const metadataResult = reads[3] as ContractRead | undefined;
    const stateResult = reads[4] as ContractRead | undefined;

    const user =
        isReadSuccess<Address>(userResult) && typeof userResult.result === "string"
            ? (userResult.result as Address)
            : ZERO_ADDRESS;
    const userExpires = toBigIntOrZero(isReadSuccess(expiresResult) ? expiresResult.result : undefined);
    const metadata =
        isReadSuccess<MetadataStruct>(metadataResult) && typeof metadataResult.result === "object" && metadataResult.result
            ? (metadataResult.result as MetadataStruct)
            : {};
    const templateMetadataResult = templateMetadataData?.[0] as ContractRead | undefined;
    const templateMetadata =
        isReadSuccess<MetadataStruct>(templateMetadataResult) &&
            typeof templateMetadataResult.result === "object" &&
            templateMetadataResult.result
            ? (templateMetadataResult.result as MetadataStruct)
            : {};
    const resolvedMetadata: MetadataStruct = {
        persona: pickText(metadata?.persona, templateMetadata?.persona),
        experience: pickText(metadata?.experience, templateMetadata?.experience),
        voiceHash: pickText(metadata?.voiceHash, templateMetadata?.voiceHash),
        animationURI: pickText(metadata?.animationURI, templateMetadata?.animationURI),
        vaultURI: pickText(metadata?.vaultURI, templateMetadata?.vaultURI),
        vaultHash: pickVaultHash(metadata?.vaultHash, templateMetadata?.vaultHash),
    };
    const state =
        isReadSuccess<StateStruct>(stateResult) && typeof stateResult.result === "object" && stateResult.result
            ? (stateResult.result as StateStruct)
            : {};

    // Listing Read
    const listingResult = listingData?.[0] as ContractRead | undefined;
    const listing = isReadSuccess(listingResult) ? listingResult.result : undefined;
    const listingActive = Boolean(getTupleField(listing, "active", 5));
    const listingPricePerDay = toBigIntOrZero(getTupleField(listing, "pricePerDay", 3));
    const listingMinDays = toNumberOrZero(getTupleField(listing, "minDays", 4));
    const listingIsTemplate = Boolean(getTupleField(listing, "isTemplate", 6));

    // Policy Limits
    const maxDeadline = toBigIntOrZero((reads[6] as ContractRead | undefined)?.result);
    const maxPath = toBigIntOrZero((reads[7] as ContractRead | undefined)?.result);
    const maxSwap = toBigIntOrZero((reads[8] as ContractRead | undefined)?.result);
    const maxApprove = toBigIntOrZero((reads[9] as ContractRead | undefined)?.result);
    const maxRepay = toBigIntOrZero((reads[10] as ContractRead | undefined)?.result);

    // Parse Metadata JSON
    const fallbackName = `Agent #${tokenId}`;
    let parsedPersona = {
        name: fallbackName,
        description: resolvedMetadata?.experience?.trim() || "",
        role: "Agent"
    };
    try {
        const rawPersona = resolvedMetadata?.persona?.trim();
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
        if (resolvedMetadata?.persona?.trim()) {
            parsedPersona.name = resolvedMetadata.persona.trim();
        }
        console.warn("Failed to parse persona JSON", e);
    }

    // Determine status
    // BAP-578 Status: 0=Active, 1=Paused, 2=Terminated
    const bapStatus = toNumberOrZero(state?.status);
    let uiStatus: AgentData["status"] = "active";
    if (bapStatus === 1) uiStatus = "paused";
    if (bapStatus === 2) uiStatus = "terminated";
    if (uiStatus === "active" && user !== ZERO_ADDRESS) {
        uiStatus = "rented";
    }

    // Format Data
    const agentData: AgentData = {
        tokenId,
        nfaAddress,
        owner: owner || "",
        name: parsedPersona.name,
        description: parsedPersona.description,
        pricePerDay: listingActive ? formatEther(listingPricePerDay) + " BNB" : "-",
        pricePerDayRaw: listingPricePerDay,
        minDays: listingActive ? listingMinDays : 0,
        status: uiStatus,
        renter: user || ZERO_ADDRESS,
        expires: Number(userExpires || 0),
        listingId: listingId || "",
        isListed: listingActive,
        isTemplateListing: listingIsTemplate,
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
            persona: resolvedMetadata?.persona || "",
            experience: resolvedMetadata?.experience || "",
            voiceHash: resolvedMetadata?.voiceHash || "",
            animationURI: resolvedMetadata?.animationURI || "",
            vaultURI: resolvedMetadata?.vaultURI || "",
            vaultHash: resolvedMetadata?.vaultHash || "",
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
