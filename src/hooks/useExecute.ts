import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { Hex, Address } from "viem";
import { useEffect } from "react";
import { toast } from "sonner";

interface Action {
    target: Address;
    value: bigint;
    data: Hex;
}

export function useExecute() {
    const {
        data: hash,
        writeContract,
        isPending: isWritePending,
        error: writeError
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        data: receipt
    } = useWaitForTransactionReceipt({ hash });

    // Toast on tx submitted
    useEffect(() => {
        if (hash) {
            toast.info("Transaction submitted", {
                description: `Tx: ${hash.slice(0, 10)}...`,
            });
        }
    }, [hash]);

    // Toast on confirmation
    useEffect(() => {
        if (isConfirmed) {
            toast.success("Execution confirmed on-chain");
        }
    }, [isConfirmed]);

    // Toast on error
    useEffect(() => {
        if (writeError) {
            toast.error("Execution failed", {
                description: writeError.message?.slice(0, 120),
            });
        }
    }, [writeError]);

    const executeAction = (tokenId: string, action: Action) => {
        writeContract({
            address: CONTRACTS.AgentNFA.address,
            abi: CONTRACTS.AgentNFA.abi,
            functionName: "execute",
            args: [BigInt(tokenId), action],
        });
    };

    return {
        executeAction,
        isLoading: isWritePending || isConfirming,
        isSuccess: isConfirmed,
        hash,
        receipt,
        error: writeError
    };
}

