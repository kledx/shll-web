import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { Hex } from "viem";
import { useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook for Rent-to-Mint flow — mints a new instance from a template listing.
 * Mirrors useRent.ts but calls ListingManager.rentToMint(listingId, daysToRent, initParams).
 */
export function useRentToMint() {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const queryClient = useQueryClient();
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
            toast.info("Rent-to-Mint transaction submitted", {
                description: `Tx: ${hash.slice(0, 10)}...`,
            });
        }
    }, [hash]);

    // Toast on confirmation
    useEffect(() => {
        if (isConfirmed) {
            toast.success("Instance minted! You are now the owner & renter.");
            void queryClient.invalidateQueries({ queryKey: ["listings"] });
            void queryClient.invalidateQueries({
                predicate: (query) => {
                    const key0 = Array.isArray(query.queryKey) ? query.queryKey[0] : null;
                    return key0 === "readContract" || key0 === "readContracts";
                },
            });
        }
    }, [isConfirmed, queryClient]);

    // Toast on write error
    useEffect(() => {
        if (writeError) {
            toast.error("Rent-to-Mint transaction failed", {
                description: writeError.message?.slice(0, 120),
            });
        }
    }, [writeError]);

    /**
     * @param listingId   Template listing ID (bytes32)
     * @param days        Number of days to rent
     * @param pricePerDay Price per day in wei
     * @param initParams  Optional init params (bytes), defaults to "0x"
     */
    const rentToMintAgent = async (
        listingId: Hex,
        days: number,
        pricePerDay: bigint,
        initParams: Hex = "0x"
    ) => {
        if (!publicClient || !address) {
            toast.error("Wallet not connected");
            return;
        }

        const totalValue = pricePerDay * BigInt(days);

        try {
            const { request } = await publicClient.simulateContract({
                account: address,
                address: CONTRACTS.ListingManager.address,
                abi: CONTRACTS.ListingManager.abi,
                functionName: "rentToMint",
                args: [listingId, days, initParams],
                value: totalValue,
            });

            writeContract(request);
        } catch (e: unknown) {
            const err = e as { shortMessage?: string; message?: string };
            toast.error("Rent-to-Mint simulation failed", {
                description: err.shortMessage || err.message || "Unknown error",
            });
        }
    };

    return {
        rentToMintAgent,
        isLoading: isWritePending || isConfirming,
        isSuccess: isConfirmed,
        hash,
        error: writeError,
    };
}
