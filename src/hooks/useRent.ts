import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useConnection } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { parseEther, Hex } from "viem";

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

    const rentAgent = async (listingId: Hex, days: number, pricePerDay: bigint) => {
        if (!publicClient || !address) {
            console.error("Wallet not connected or client unavailable");
            return;
        }

        // Calculate total value
        const totalValue = pricePerDay * BigInt(days);

        console.log("Simulating Rent:", {
            from: address,
            listingId,
            days,
            pricePerDay: pricePerDay.toString(),
            totalValue: totalValue.toString()
        });

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

            console.log("Simulation success:", request);
            writeContract(request);
        } catch (e: any) {
            console.error("Rent Simulation Failed:", e);
            alert(`Simulation Failed: ${e.shortMessage || e.message || "Unknown error"}`);
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
