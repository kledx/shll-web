import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useConnection } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { parseEther, Hex } from "viem";
import { useEffect } from "react";
import { toast } from "sonner";

export function useRent() {
    const { address } = useConnection();
    const publicClient = usePublicClient();
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
        }
    }, [isConfirmed]);

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
        } catch (e: any) {
            toast.error("Rental simulation failed", {
                description: e.shortMessage || e.message || "Unknown error",
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

