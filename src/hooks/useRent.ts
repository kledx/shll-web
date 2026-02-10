import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { parseEther, Hex } from "viem";

export function useRent() {
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

    const rentAgent = async (listingId: Hex, days: number, pricePerDay: string) => {
        // Calculate total value
        // Note: In real implementation, this needs to handle token vs native payment logic
        const totalValue = parseEther(pricePerDay) * BigInt(days);

        writeContract({
            address: CONTRACTS.ListingManager.address,
            abi: CONTRACTS.ListingManager.abi,
            functionName: 'rent',
            args: [listingId, days] as const,
            value: totalValue
        });
    };

    return {
        rentAgent,
        isLoading: isWritePending || isConfirming,
        isSuccess: isConfirmed,
        hash,
        error: writeError
    };
}
