import { useEffect } from "react";
import {
    useAccount,
    usePublicClient,
    useReadContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import { formatEther, type Address } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CONTRACTS } from "@/config/contracts";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

function getErrorMessage(error: unknown): string {
    if (!error || typeof error !== "object") return "Unknown error";
    const e = error as { shortMessage?: string; message?: string };
    return e.shortMessage || e.message || "Unknown error";
}

export function useClaimRentalIncome() {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const queryClient = useQueryClient();
    const account = address ?? ZERO_ADDRESS;

    const {
        data: pendingRaw,
        isLoading: isBalanceLoading,
        refetch: refetchPending,
    } = useReadContract({
        address: CONTRACTS.ListingManager.address,
        abi: CONTRACTS.ListingManager.abi,
        functionName: "pendingWithdrawals",
        args: [account],
        query: {
            enabled: Boolean(address),
            refetchInterval: 10_000,
            staleTime: 5_000,
        },
    });

    const pendingAmount =
        typeof pendingRaw === "bigint" ? pendingRaw : BigInt(0);

    const {
        data: hash,
        writeContract,
        isPending: isWritePending,
        error: writeError,
    } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (!hash) return;
        toast.info("Claim transaction submitted", {
            description: `Tx: ${hash.slice(0, 10)}...`,
        });
    }, [hash]);

    useEffect(() => {
        if (!isConfirmed) return;
        toast.success("Rental income claimed");
        void refetchPending();
        void queryClient.invalidateQueries({ queryKey: ["myAgents"] });
        void queryClient.invalidateQueries({
            predicate: (query) => {
                const key0 = Array.isArray(query.queryKey)
                    ? query.queryKey[0]
                    : null;
                return key0 === "readContract" || key0 === "readContracts";
            },
        });
    }, [isConfirmed, queryClient, refetchPending]);

    useEffect(() => {
        if (!writeError) return;
        toast.error("Claim failed", {
            description: writeError.message?.slice(0, 160),
        });
    }, [writeError]);

    const claimIncome = async () => {
        if (!address || !publicClient) {
            toast.error("Wallet not connected");
            return;
        }
        if (pendingAmount <= BigInt(0)) {
            toast.info("No claimable rental income");
            return;
        }

        try {
            const { request } = await publicClient.simulateContract({
                account: address,
                address: CONTRACTS.ListingManager.address,
                abi: CONTRACTS.ListingManager.abi,
                functionName: "claimRentalIncome",
                args: [],
            });
            writeContract(request);
        } catch (error: unknown) {
            toast.error("Claim simulation failed", {
                description: getErrorMessage(error).slice(0, 180),
            });
        }
    };

    return {
        pendingAmount,
        pendingFormatted: formatEther(pendingAmount),
        isBalanceLoading,
        isClaiming: isWritePending || isConfirming,
        isSuccess: isConfirmed,
        hash,
        error: writeError,
        claimIncome,
        refetchPending,
    };
}
