import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { formatEther, Hex, decodeEventLog } from "viem";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "./useTranslation";

function isInsufficientBalanceError(message: string): boolean {
    const text = message.toLowerCase();
    return (
        text.includes("exceeds the balance of the account") ||
        text.includes("insufficient funds for gas * price + value") ||
        text.includes("insufficient funds")
    );
}

/**
 * Hook for Rent-to-Mint flow — mints a new instance from a template listing.
 * Mirrors useRent.ts but calls ListingManager.rentToMint(...) or rentToMintWithParams(...).
 */
export function useRentToMint() {
    const { t } = useTranslation();
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const queryClient = useQueryClient();
    const copy = t.agent.rent.toasts;
    const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null);
    const {
        data: hash,
        writeContract,
        isPending: isWritePending,
        error: writeError
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed
    } = useWaitForTransactionReceipt({ hash });

    // Toast on tx submitted
    useEffect(() => {
        if (hash) {
            toast.info(copy.rentToMintSubmitted, {
                description: `Tx: ${hash.slice(0, 10)}...`,
            });
        }
    }, [copy.rentToMintSubmitted, hash]);

    // Extract minted tokenId from receipt logs on confirmation
    useEffect(() => {
        if (!isConfirmed || !hash || !publicClient) return;
        (async () => {
            try {
                const receipt = await publicClient.getTransactionReceipt({ hash });
                // Look for Transfer(address,address,uint256) from AgentNFA
                const nfaAddr = CONTRACTS.AgentNFA.address.toLowerCase();
                for (const log of receipt.logs) {
                    if (log.address.toLowerCase() !== nfaAddr) continue;
                    try {
                        const decoded = decodeEventLog({
                            abi: CONTRACTS.AgentNFA.abi,
                            data: log.data,
                            topics: log.topics,
                        });
                        if (decoded.eventName === "Transfer" && decoded.args) {
                            const args = decoded.args as { tokenId?: bigint };
                            if (args.tokenId !== undefined) {
                                setMintedTokenId(args.tokenId);
                                break;
                            }
                        }
                    } catch {
                        // Not a matching event, skip
                    }
                }
            } catch {
                // Receipt fetch failed — mintedTokenId stays null
            }
        })();
    }, [isConfirmed, hash, publicClient]);

    // Toast on confirmation
    useEffect(() => {
        if (isConfirmed) {
            toast.success(copy.instanceMintedSuccess);
            void queryClient.invalidateQueries({ queryKey: ["listings"] });
            void queryClient.invalidateQueries({ queryKey: ["myAgents"] });
            void queryClient.invalidateQueries({
                predicate: (query) => {
                    const key0 = Array.isArray(query.queryKey) ? query.queryKey[0] : null;
                    return key0 === "readContract" || key0 === "readContracts";
                },
            });
        }
    }, [copy.instanceMintedSuccess, isConfirmed, queryClient]);

    // Toast on write error
    useEffect(() => {
        if (writeError) {
            toast.error(copy.rentToMintFailed, {
                description: writeError.message?.slice(0, 120),
            });
        }
    }, [copy.rentToMintFailed, writeError]);

    /**
     * @param listingId   Template listing ID (bytes32)
     * @param days        Number of days to rent
     * @param pricePerDay Price per day in wei
     * @param v14Params   Optional V1.4 parameters (policyId, version, paramsPacked)
     * @param initParams  Legacy init params (bytes), defaults to "0x01"
     */
    const rentToMintAgent = async (
        listingId: Hex,
        days: number,
        pricePerDay: bigint,
        v14Params?: {
            policyId: number;
            version: number;
            paramsPacked: Hex;
        },
        initParams: Hex = "0x01"
    ) => {
        if (!publicClient || !address) {
            toast.error(copy.walletNotConnected);
            return;
        }

        const totalValue = pricePerDay * BigInt(days);
        let nativeBalance: bigint | undefined;

        try {
            nativeBalance = await publicClient.getBalance({ address });
        } catch {
            // Ignore precheck failures and fall back to simulateContract diagnostics.
        }

        if (nativeBalance !== undefined && nativeBalance < totalValue) {
            toast.error(copy.insufficientBalanceTitle, {
                description: copy.insufficientBalancePrecheck
                    .replace("{rentBnb}", formatEther(totalValue))
                    .replace("{balanceBnb}", formatEther(nativeBalance)),
            });
            return;
        }

        try {
            let requestResult;
            if (v14Params) {
                requestResult = await publicClient.simulateContract({
                    account: address,
                    address: CONTRACTS.ListingManager.address,
                    abi: CONTRACTS.ListingManager.abi,
                    functionName: "rentToMintWithParams",
                    args: [listingId, days, v14Params.policyId, v14Params.version, v14Params.paramsPacked],
                    value: totalValue,
                });
            } else {
                // V2.0: always use rentToMintWithParams with default policy
                requestResult = await publicClient.simulateContract({
                    account: address,
                    address: CONTRACTS.ListingManager.address,
                    abi: CONTRACTS.ListingManager.abi,
                    functionName: "rentToMintWithParams",
                    args: [listingId, days, 1, 1, initParams],
                    value: totalValue,
                });
            }

            writeContract(requestResult.request as any);
        } catch (e: unknown) {
            const err = e as { shortMessage?: string; message?: string };
            const message = err.shortMessage || err.message || "Unknown error";
            if (isInsufficientBalanceError(message)) {
                toast.error(copy.insufficientBalanceTitle, {
                    description: copy.insufficientBalanceSimulation.replace(
                        "{rentBnb}",
                        formatEther(totalValue)
                    ),
                });
                return;
            }
            toast.error(copy.rentToMintSimulationFailed, {
                description: message,
            });
        }
    };

    // Reset state for a fresh rental flow
    const resetMint = useCallback(() => {
        setMintedTokenId(null);
    }, []);

    return {
        rentToMintAgent,
        isLoading: isWritePending || isConfirming,
        isSuccess: isConfirmed,
        hash,
        error: writeError,
        mintedTokenId,
        resetMint,
    };
}
