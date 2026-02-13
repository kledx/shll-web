import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { Hex } from "viem";
import { useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function useRent() {
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
            toast.info("Rental transaction submitted", {
                description: `Tx: ${hash.slice(0, 10)}...`,
            });
        }
    }, [hash]);

    // Toast on confirmation
    useEffect(() => {
        if (isConfirmed) {
            toast.success("Rental confirmed! You are now the renter.");
            void queryClient.invalidateQueries({ queryKey: ["listings"] });
        }
    }, [isConfirmed, queryClient]);

    // Toast on write error
    useEffect(() => {
        if (writeError) {
            toast.error("Rental transaction failed", {
                description: writeError.message?.slice(0, 120),
            });
        }
    }, [writeError]);

    const rentAgent = async (listingId: Hex, days: number, pricePerDay: bigint) => {
        if (!publicClient || !address) {
            toast.error("Wallet not connected");
            return;
        }

        // Calculate total value
        const totalValue = pricePerDay * BigInt(days);

        try {
            // Simulate first to catch errors
            const { request } = await publicClient.simulateContract({
                account: address,
                address: CONTRACTS.ListingManager.address,
                abi: CONTRACTS.ListingManager.abi,
                functionName: 'rent',
                args: [listingId, days],
                value: totalValue
            });

            writeContract(request);
        } catch (e: unknown) {
            const err = e as { shortMessage?: string; message?: string };
            toast.error("Rental simulation failed", {
                description: err.shortMessage || err.message || "Unknown error",
            });
        }
    };

    return {
        rentAgent,
        isLoading: isWritePending || isConfirming,
        isSuccess: isConfirmed,
        hash,
        error: writeError
    };
}

