import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { CONTRACTS } from "../config/contracts";
import { Address } from "viem";

const ZERO_HASH =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

interface IndexerAgentItem {
    tokenId?: string | number;
    owner?: string;
    account?: string;
}

export interface RentalItem {
    nfa: Address;
    tokenId: bigint;
    agentAccount: Address;
    owner: Address;
    expires: bigint;
    isActive: boolean;
    isOwner: boolean;
    isRenter: boolean;
    isInstance: boolean;
    templateId?: bigint;
}

function toAddress(value: unknown): Address | undefined {
    if (typeof value !== "string") return undefined;
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) return undefined;
    return value as Address;
}

function toBigIntValue(value: unknown): bigint | undefined {
    try {
        if (typeof value === "bigint") return value;
        if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
            return BigInt(Math.trunc(value));
        }
        if (typeof value === "string" && /^\d+$/.test(value.trim())) {
            return BigInt(value.trim());
        }
    } catch {
        return undefined;
    }
    return undefined;
}

export function useMyRentals() {
    const { address } = useAccount();
    const nfaAddress = CONTRACTS.AgentNFA.address as Address;

    // Primary source: indexer agents table (same data domain as marketplace/indexer).
    const { data: indexerAgents = [], isLoading: isAgentsLoading } = useQuery({
        queryKey: ["myAgents", address?.toLowerCase() || ""],
        enabled: !!address,
        queryFn: async () => {
            const res = await fetch("/api/agents");
            if (!res.ok) throw new Error("Failed to fetch agents");
            const json = await res.json();
            const items = (Array.isArray(json?.items) ? json.items : []) as IndexerAgentItem[];
            const normalizedAddress = (address || "").toLowerCase();

            return items
                .map((item) => ({
                    tokenId: toBigIntValue(item.tokenId),
                    owner: toAddress(item.owner),
                    account: toAddress(item.account),
                }))
                .filter((item) => item.tokenId !== undefined && item.owner !== undefined)
                .filter((item) => item.owner!.toLowerCase() === normalizedAddress);
        },
        refetchInterval: 5000,
    });

    const tokenIds = useMemo(
        () => indexerAgents.map((a) => a.tokenId as bigint),
        [indexerAgents]
    );

    // Secondary on-chain verification for key fields on selected tokens.
    const contracts = useMemo(
        () =>
            tokenIds.flatMap((id) => [
                {
                    address: nfaAddress,
                    abi: CONTRACTS.AgentNFA.abi,
                    functionName: "ownerOf" as const,
                    args: [id],
                },
                {
                    address: nfaAddress,
                    abi: CONTRACTS.AgentNFA.abi,
                    functionName: "userOf" as const,
                    args: [id],
                },
                {
                    address: nfaAddress,
                    abi: CONTRACTS.AgentNFA.abi,
                    functionName: "userExpires" as const,
                    args: [id],
                },
                {
                    address: nfaAddress,
                    abi: CONTRACTS.AgentNFA.abi,
                    functionName: "accountOf" as const,
                    args: [id],
                },
                {
                    address: nfaAddress,
                    abi: CONTRACTS.AgentNFA.abi,
                    functionName: "templateOf" as const,
                    args: [id],
                },
                {
                    address: nfaAddress,
                    abi: CONTRACTS.AgentNFA.abi,
                    functionName: "isTemplate" as const,
                    args: [id],
                },
                {
                    address: nfaAddress,
                    abi: CONTRACTS.AgentNFA.abi,
                    functionName: "paramsHashOf" as const,
                    args: [id],
                },
            ]),
        [nfaAddress, tokenIds]
    );

    const { data: reads, isLoading: isReadsLoading } = useReadContracts({
        contracts,
        query: {
            enabled: !!address && tokenIds.length > 0,
            staleTime: 15_000,
        },
    });

    const rentals = useMemo(() => {
        if (!address || tokenIds.length === 0) return [];
        const items: RentalItem[] = [];
        const now = BigInt(Math.floor(Date.now() / 1000));
        const FIELDS_PER_TOKEN = 7;

        for (let i = 0; i < tokenIds.length; i++) {
            const base = i * FIELDS_PER_TOKEN;
            const indexerItem = indexerAgents[i];
            if (!indexerItem) continue;

            const ownerResult = reads?.[base];
            const userResult = reads?.[base + 1];
            const expiresResult = reads?.[base + 2];
            const accountResult = reads?.[base + 3];
            const templateResult = reads?.[base + 4];
            const isTemplateResult = reads?.[base + 5];
            const paramsHashResult = reads?.[base + 6];

            const chainOwner =
                ownerResult?.status === "success" && typeof ownerResult.result === "string"
                    ? (ownerResult.result as Address)
                    : (indexerItem.owner as Address);
            const currentUser =
                userResult?.status === "success" && typeof userResult.result === "string"
                    ? (userResult.result as Address)
                    : ZERO_ADDRESS;
            const expires =
                expiresResult?.status === "success" && typeof expiresResult.result === "bigint"
                    ? (expiresResult.result as bigint)
                    : BigInt(0);
            const account =
                accountResult?.status === "success" && typeof accountResult.result === "string"
                    ? (accountResult.result as Address)
                    : (indexerItem.account || ZERO_ADDRESS);

            const templateId =
                templateResult?.status === "success" && typeof templateResult.result === "bigint"
                    ? (templateResult.result as bigint)
                    : undefined;
            const isTemplate =
                isTemplateResult?.status === "success"
                    ? Boolean(isTemplateResult.result)
                    : false;
            const paramsHash =
                paramsHashResult?.status === "success"
                    ? String(paramsHashResult.result).toLowerCase()
                    : ZERO_HASH;

            // templateOf(instanceFromTemplate0)=0, so paramsHash still needed as fallback.
            const isInstance = !isTemplate && paramsHash !== ZERO_HASH;

            const isOwner = chainOwner.toLowerCase() === address.toLowerCase();
            const isRenter = currentUser.toLowerCase() === address.toLowerCase();
            const isActive = isRenter && expires > now;

            if (isOwner || isRenter) {
                items.push({
                    nfa: nfaAddress,
                    tokenId: tokenIds[i]!,
                    agentAccount: account,
                    owner: chainOwner,
                    expires,
                    isActive,
                    isOwner,
                    isRenter,
                    isInstance,
                    templateId: isInstance ? templateId : undefined,
                });
            }
        }

        return items;
    }, [address, indexerAgents, reads, tokenIds, nfaAddress]);

    return { rentals, isLoading: isAgentsLoading || isReadsLoading };
}
