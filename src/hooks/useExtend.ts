import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { parseEther, Hex } from "viem";

export function useExtend() {
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

    const extendLease = async (listingId: Hex, days: number, pricePerDay: string) => {
        // Calculate total value
        const totalValue = parseEther(pricePerDay) * BigInt(days);

        writeContract({
            address: CONTRACTS.ListingManager.address,
            abi: CONTRACTS.ListingManager.abi,
            functionName: 'extend',
            args: [listingId, days] as const,
            value: totalValue
        });
    };

    return {
        extendLease,
        isLoading: isWritePending || isConfirming,
        isSuccess: isConfirmed,
        hash,
        error: writeError
    };
}
