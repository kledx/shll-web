import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { Hex, parseEther } from "viem";
import { useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function useExtend() {
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

    useEffect(() => {
        if (hash) {
            toast.info("Extend transaction submitted", {
                description: `Tx: ${hash.slice(0, 10)}...`,
            });
        }
    }, [hash]);

    useEffect(() => {
        if (isConfirmed) {
            toast.success("Lease extended successfully.");
            void queryClient.invalidateQueries({ queryKey: ["listings"] });
            void queryClient.invalidateQueries({
                predicate: (query) => {
                    const key0 = Array.isArray(query.queryKey) ? query.queryKey[0] : null;
                    return key0 === "readContract" || key0 === "readContracts";
                },
            });
        }
    }, [isConfirmed, queryClient]);

    useEffect(() => {
        if (writeError) {
            toast.error("Extend transaction failed", {
                description: writeError.message?.slice(0, 120),
            });
        }
    }, [writeError]);

    const extendLease = async (listingId: Hex, days: number, pricePerDay: string) => {
        if (!publicClient || !address) {
            toast.error("Wallet not connected");
            return;
        }

        const totalValue = parseEther(pricePerDay) * BigInt(days);

        try {
            // On-chain second check via simulation before wallet prompt.
            const { request } = await publicClient.simulateContract({
                account: address,
                address: CONTRACTS.ListingManager.address,
                abi: CONTRACTS.ListingManager.abi,
                functionName: "extend",
                args: [listingId, days] as const,
                value: totalValue
            });

            writeContract(request);
        } catch (e: unknown) {
            const err = e as { shortMessage?: string; message?: string };
            toast.error("Extend simulation failed", {
                description: err.shortMessage || err.message || "Unknown error",
            });
        }
    };

    return {
        extendLease,
        isLoading: isWritePending || isConfirming,
        isSuccess: isConfirmed,
        hash,
        error: writeError
    };
}
