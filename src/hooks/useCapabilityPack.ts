"use client";

import { useReadContract } from "wagmi";
import { Address, keccak256, sha256, toBytes } from "viem";
import { CONTRACTS } from "../config/contracts";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

/**
 * BAP-578 Agent Metadata structure
 */
export interface AgentMetadata {
    persona: string;
    experience: string;
    voiceHash: string;
    animationURI: string;
    vaultURI: string;
    vaultHash: `0x${string}`;
}

const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

function pickText(primary: string | undefined, fallback: string | undefined): string {
    const a = (primary || "").trim();
    if (a) return a;
    return (fallback || "").trim();
}

function pickVaultHash(primary: `0x${string}` | undefined, fallback: `0x${string}` | undefined): `0x${string}` {
    const a = (primary || "").trim().toLowerCase() as `0x${string}`;
    if (a && a !== ZERO_HASH) return a;
    const b = (fallback || "").trim().toLowerCase() as `0x${string}`;
    if (b) return b;
    return a || ZERO_HASH;
}

/**
 * Capability Pack Manifest structure
 */
export interface CapabilityPack {
    schemaVersion: string;
    id: string;
    name: string;
    version: string;
    description?: string;
    policyRef?: {
        policyId: number;
        version: number;
    };
    instance?: {
        paramsSchema?: Record<string, unknown>;
        defaults?: Record<string, unknown>;
        encoding?: {
            abiTypes?: string[];
            fieldOrder?: string[];
            units?: Record<string, string>;
        };
    };
    console?: {
        templates: string[];
        manualExecute?: {
            enabled?: boolean;
            disableWhenAutopilotOn?: boolean;
        };
        advanced?: {
            rawEnabled?: boolean;
        };
    };
    runner?: {
        mode: "manual" | "managed" | "external";
        strategyId?: string;
        tickSec?: number;
        dataSource?: {
            type: string;
            config?: Record<string, unknown>;
        };
        paramsSchema?: Record<string, unknown>;
        defaults?: Record<string, unknown>;
        externalRunner?: {
            operatorAddress: string | null;
            endpoint: string | null;
            name: string | null;
        };
    };
    networks?: Array<{
        chainId: number;
        contracts: Record<string, Address>;
    }>;
    policy?: {
        policyId: string;
        policyBundleURI?: string;
        bundleHash?: `0x${string}`;
    };
}

/**
 * Canonicalize JSON for consistent hashing
 */
function canonicalizeJSON(obj: unknown): string {
    if (obj === null) return "null";
    if (typeof obj !== "object") return JSON.stringify(obj);
    if (Array.isArray(obj)) {
        return "[" + obj.map(canonicalizeJSON).join(",") + "]";
    }

    const record = obj as Record<string, unknown>;
    const sortedKeys = Object.keys(record).sort();
    const pairs = sortedKeys.map((key) => {
        return JSON.stringify(key) + ":" + canonicalizeJSON(record[key]);
    });

    return "{" + pairs.join(",") + "}";
}

/**
 * Verify capability pack hash matches metadata
 */
function verifyPackHash(pack: CapabilityPack, expectedHash: `0x${string}`): boolean {
    try {
        const canonical = canonicalizeJSON(pack);
        const rawBytes = toBytes(canonical);
        // PRD v1.2 canonical hash is sha256. Keep keccak as backward compatibility for legacy packs.
        const computedSha256 = sha256(rawBytes);
        if (computedSha256.toLowerCase() === expectedHash.toLowerCase()) {
            return true;
        }
        const legacyKeccak = keccak256(rawBytes);
        return legacyKeccak.toLowerCase() === expectedHash.toLowerCase();
    } catch (error) {
        console.error("Hash verification failed:", error);
        return false;
    }
}

/**
 * Hook to load and verify capability pack for an agent
 *
 * @param tokenId - Agent NFT token ID
 * @returns Metadata, manifest, validation status, and loading state
 */
export function useCapabilityPack(tokenId: bigint | undefined, nfaAddress?: string) {
    const resolvedNfaAddress = (nfaAddress || CONTRACTS.AgentNFA.address) as Address;
    const nfaAbi = CONTRACTS.AgentNFA.abi;

    // 1. Read on-chain metadata (includes vaultURI and vaultHash)
    const {
        data: metadata,
        isLoading: isMetadataLoading,
        error: metadataError,
    } = useReadContract({
        address: resolvedNfaAddress,
        abi: nfaAbi,
        functionName: "getAgentMetadata",
        args: tokenId !== undefined ? [tokenId] : undefined,
        query: {
            enabled: tokenId !== undefined,
            staleTime: 30_000, // Cache for 30 seconds
        },
    }) as {
        data: AgentMetadata | undefined;
        isLoading: boolean;
        error: Error | null;
    };

    // 1.1 If this token is an instance, resolve templateId for metadata fallback.
    const {
        data: templateId,
        isLoading: isTemplateIdLoading,
        error: templateIdError,
    } = useReadContract({
        address: resolvedNfaAddress,
        abi: nfaAbi,
        functionName: "templateOf",
        args: tokenId !== undefined ? [tokenId] : undefined,
        query: {
            enabled: tokenId !== undefined,
            staleTime: 30_000,
        },
    }) as {
        data: bigint | undefined;
        isLoading: boolean;
        error: Error | null;
    };

    const templateTokenId = useMemo(() => {
        if (typeof templateId === "bigint" && templateId > BigInt(0)) return templateId;
        return undefined;
    }, [templateId]);

    const {
        data: templateMetadata,
        isLoading: isTemplateMetadataLoading,
        error: templateMetadataError,
    } = useReadContract({
        address: resolvedNfaAddress,
        abi: nfaAbi,
        functionName: "getAgentMetadata",
        args: templateTokenId !== undefined ? [templateTokenId] : undefined,
        query: {
            enabled: templateTokenId !== undefined,
            staleTime: 30_000,
        },
    }) as {
        data: AgentMetadata | undefined;
        isLoading: boolean;
        error: Error | null;
    };

    const resolvedMetadata = useMemo<AgentMetadata | undefined>(() => {
        if (!metadata && !templateMetadata) return undefined;
        const primary = metadata;
        const fallback = templateMetadata;
        return {
            persona: pickText(primary?.persona, fallback?.persona),
            experience: pickText(primary?.experience, fallback?.experience),
            voiceHash: pickText(primary?.voiceHash, fallback?.voiceHash),
            animationURI: pickText(primary?.animationURI, fallback?.animationURI),
            vaultURI: pickText(primary?.vaultURI, fallback?.vaultURI),
            vaultHash: pickVaultHash(primary?.vaultHash, fallback?.vaultHash),
        };
    }, [metadata, templateMetadata]);

    // 2. Fetch capability pack manifest from vaultURI
    const {
        data: manifest,
        isLoading: isManifestLoading,
        error: manifestError,
    } = useQuery<CapabilityPack | null>({
        queryKey: ["capabilityPack", resolvedMetadata?.vaultURI, resolvedMetadata?.vaultHash],
        queryFn: async () => {
            if (!resolvedMetadata?.vaultURI) return null;

            try {
                const proxyUrl = `/api/capability-pack?uri=${encodeURIComponent(resolvedMetadata.vaultURI)}&hash=${encodeURIComponent(resolvedMetadata.vaultHash || "")}`;
                const response = await fetch(proxyUrl, { cache: "no-store" });

                if (!response.ok) {
                    let detail = "";
                    try {
                        const body = (await response.json()) as Record<string, unknown>;
                        detail = body.message
                            ? String(body.message)
                            : body.error
                                ? String(body.error)
                                : "";
                    } catch {
                        // ignore parse error, fallback to status text only
                    }
                    throw new Error(
                        `Failed to fetch manifest: ${response.status} ${response.statusText}${
                            detail ? ` (${detail})` : ""
                        }`
                    );
                }

                const data = await response.json();
                return data as CapabilityPack;
            } catch (error) {
                console.error("Failed to fetch capability pack:", error);
                throw error;
            }
        },
        enabled: !!resolvedMetadata?.vaultURI,
        staleTime: 5 * 60_000, // Cache for 5 minutes
        retry: 2,
    });

    // 3. Verify hash integrity
    const isHashValid = useMemo(() => {
        if (!manifest || !resolvedMetadata?.vaultHash) return null;

        // Empty hash means no verification required
        if (resolvedMetadata.vaultHash === ZERO_HASH) {
            return true;
        }

        return verifyPackHash(manifest, resolvedMetadata.vaultHash);
    }, [manifest, resolvedMetadata?.vaultHash]);

    // 4. Parse capabilities from manifest
    const capabilities = useMemo(() => {
        if (!manifest) return null;

        return {
            hasConsole: !!manifest.console?.templates && manifest.console.templates.length > 0,
            consoleTemplates: manifest.console?.templates || [],
            manualExecuteEnabled: manifest.console?.manualExecute?.enabled,
            manualExecuteDisableWhenAutopilotOn:
                manifest.console?.manualExecute?.disableWhenAutopilotOn,
            rawEnabled: manifest.console?.advanced?.rawEnabled === true,
            hasRunner: !!manifest.runner,
            runnerMode: manifest.runner?.mode || "manual",
            strategyId: manifest.runner?.strategyId,
            isManaged: manifest.runner?.mode === "managed",
            isExternal: manifest.runner?.mode === "external",
            externalRunnerInfo: manifest.runner?.externalRunner,
        };
    }, [manifest]);

    return {
        // Metadata
        metadata: resolvedMetadata,
        isMetadataLoading: isMetadataLoading || isTemplateIdLoading || isTemplateMetadataLoading,
        metadataError: metadataError || templateIdError || templateMetadataError,

        // Manifest
        manifest,
        isManifestLoading,
        manifestError,

        // Validation
        isHashValid,
        hasCapabilityPack: !!resolvedMetadata?.vaultURI,

        // Capabilities
        capabilities,

        // Loading states
        isLoading: isMetadataLoading || isTemplateIdLoading || isTemplateMetadataLoading || isManifestLoading,
        error: metadataError || templateIdError || templateMetadataError || manifestError,
    };
}

/**
 * Hook to check if agent has autopilot capability
 */
export function useHasAutopilot(tokenId: bigint | undefined, nfaAddress?: string) {
    const { capabilities, isLoading } = useCapabilityPack(tokenId, nfaAddress);

    return {
        hasAutopilot: capabilities?.hasRunner && capabilities?.runnerMode !== "manual",
        isManaged: capabilities?.isManaged,
        isExternal: capabilities?.isExternal,
        strategyId: capabilities?.strategyId,
        isLoading,
    };
}
