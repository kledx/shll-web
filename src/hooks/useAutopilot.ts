import { useMemo, useState } from "react";
import {
    useAccount,
    useChainId,
    useReadContract,
    useSignTypedData,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import { Address } from "viem";
import { CONTRACTS } from "@/config/contracts";

interface UseAutopilotOptions {
    tokenId: string;
    renter?: string;
    nfaAddress?: string;
}

interface EnableAutopilotInput {
    operator: Address;
    expires: bigint;
    deadline: bigint;
}

interface EnableAutopilotResult {
    txHash: string;
}

export type EnableState =
    | "IDLE"
    | "SIGNING"
    | "SUBMITTING"
    | "ONCHAIN_PENDING"
    | "ONCHAIN_CONFIRMED"
    | "ERROR";

export function useAutopilot({ tokenId, renter, nfaAddress }: UseAutopilotOptions) {
    const { address } = useAccount();
    const chainId = useChainId();
    const { signTypedDataAsync } = useSignTypedData();
    const { writeContractAsync } = useWriteContract();
    const resolvedNfaAddress = (nfaAddress || CONTRACTS.AgentNFA.address) as Address;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastTxHash, setLastTxHash] = useState<string | null>(null);
    const [clearHash, setClearHash] = useState<`0x${string}` | undefined>(undefined);
    const [enableState, setEnableState] = useState<EnableState>("IDLE");

    const tokenIdBigInt = useMemo(() => {
        try {
            return BigInt(tokenId || "0");
        } catch {
            return BigInt(0);
        }
    }, [tokenId]);

    const { data: nonceData, refetch: refetchNonce } = useReadContract({
        address: resolvedNfaAddress,
        abi: CONTRACTS.AgentNFA.abi,
        functionName: "operatorNonceOf",
        args: [tokenIdBigInt],
        query: { enabled: tokenIdBigInt >= BigInt(0) },
    });

    const { data: operatorData, refetch: refetchOperator } = useReadContract({
        address: resolvedNfaAddress,
        abi: CONTRACTS.AgentNFA.abi,
        functionName: "operatorOf",
        args: [tokenIdBigInt],
        query: { enabled: tokenIdBigInt >= BigInt(0) },
    });
    const { data: operatorExpiresData, refetch: refetchOperatorExpires } = useReadContract({
        address: resolvedNfaAddress,
        abi: CONTRACTS.AgentNFA.abi,
        functionName: "operatorExpiresOf",
        args: [tokenIdBigInt],
        query: { enabled: tokenIdBigInt >= BigInt(0) },
    });
    const { isLoading: isClearingAutopilot } = useWaitForTransactionReceipt({
        hash: clearHash,
        query: { enabled: !!clearHash },
    });

    const enableAutopilot = async (
        input: EnableAutopilotInput
    ): Promise<EnableAutopilotResult> => {
        if (!address) {
            throw new Error("Wallet not connected");
        }
        if (!renter || renter.toLowerCase() !== address.toLowerCase()) {
            throw new Error("Only active renter can sign autopilot permit");
        }

        setIsSubmitting(true);
        setError(null);
        try {
            setEnableState("SIGNING");
            const nonce = (await refetchNonce()).data as bigint | undefined;
            const currentNonce = nonce ?? BigInt(0);

            const permit = {
                tokenId: tokenIdBigInt,
                renter: address as Address,
                operator: input.operator,
                expires: input.expires,
                nonce: currentNonce,
                deadline: input.deadline,
            };

            const sig = await signTypedDataAsync({
                domain: {
                    name: "SHLL AgentNFA",
                    version: "1",
                    chainId,
                    verifyingContract: resolvedNfaAddress,
                },
                types: {
                    OperatorPermit: [
                        { name: "tokenId", type: "uint256" },
                        { name: "renter", type: "address" },
                        { name: "operator", type: "address" },
                        { name: "expires", type: "uint64" },
                        { name: "nonce", type: "uint256" },
                        { name: "deadline", type: "uint256" },
                    ],
                },
                primaryType: "OperatorPermit",
                message: permit,
            });
            const permitPayload = {
                tokenId: permit.tokenId.toString(),
                renter: permit.renter,
                operator: permit.operator,
                expires: permit.expires.toString(),
                nonce: permit.nonce.toString(),
                deadline: permit.deadline.toString(),
            };

            setEnableState("SUBMITTING");
            const response = await fetch("/api/autopilot/enable", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chainId,
                    nfaAddress: resolvedNfaAddress,
                    permit: permitPayload,
                    sig,
                }),
            });
            const body = await response.json();
            if (!response.ok || !body?.txHash) {
                const details = body?.details as Record<string, unknown> | undefined;
                const detailError =
                    typeof details?.error === "string"
                        ? details.error
                        : typeof details?.message === "string"
                            ? details.message
                            : typeof details?.raw === "string"
                                ? details.raw
                                : "";
                const message = [body?.error, detailError].filter(Boolean).join(" | ");
                throw new Error(message || "Autopilot enable failed");
            }

            setLastTxHash(body.txHash);
            setEnableState("ONCHAIN_PENDING");
            await refetchOperator();
            await refetchOperatorExpires();
            setEnableState("ONCHAIN_CONFIRMED");
            return { txHash: body.txHash as string };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
            setEnableState("ERROR");
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearAutopilot = async (): Promise<{ txHash: string }> => {
        const txHash = await writeContractAsync({
            address: resolvedNfaAddress,
            abi: CONTRACTS.AgentNFA.abi,
            functionName: "clearOperator",
            args: [tokenIdBigInt],
        });
        setClearHash(txHash);
        try {
            await fetch("/api/autopilot/disable", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tokenId: tokenIdBigInt.toString(),
                    mode: "local",
                    reason: "disabled from console",
                }),
            });
        } catch {
            // Best effort only: on-chain clear is the source of truth.
        }
        await refetchOperator();
        await refetchOperatorExpires();
        return { txHash };
    };

    return {
        enableAutopilot,
        clearAutopilot,
        operator: (operatorData as Address | undefined) ?? null,
        operatorExpires: (operatorExpiresData as bigint | undefined) ?? BigInt(0),
        nonce: (nonceData as bigint | undefined) ?? BigInt(0),
        lastTxHash,
        enableState,
        isSubmitting,
        isClearingAutopilot,
        error,
    };
}
