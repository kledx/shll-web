import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { Address } from "viem";
import { useEffect } from "react";
import { toast } from "sonner";

export function useWithdraw() {
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
            toast.info("Withdrawal submitted", {
                description: `Tx: ${hash.slice(0, 10)}...`,
            });
        }
    }, [hash]);

    // Toast on confirmation
    useEffect(() => {
        if (isConfirmed) {
            toast.success("Withdrawal confirmed!");
        }
    }, [isConfirmed]);

    // Toast on error
    useEffect(() => {
        if (writeError) {
            toast.error("Withdrawal failed", {
                description: writeError.message?.slice(0, 120),
            });
        }
    }, [writeError]);

    const withdrawNative = (agentAccount: Address, amount: bigint, to: Address) => {
        writeContract({
            address: agentAccount,
            abi: CONTRACTS.AgentAccount.abi,
            functionName: 'withdrawNative',
            args: [amount, to],
        });
    };

    const withdrawToken = (agentAccount: Address, token: Address, amount: bigint, to: Address) => {
        writeContract({
            address: agentAccount,
            abi: CONTRACTS.AgentAccount.abi,
            functionName: 'withdrawToken',
            args: [token, amount, to],
        });
    };

    return {
        withdrawNative,
        withdrawToken,
        isLoading: isWritePending || isConfirming,
        isSuccess: isConfirmed,
        hash,
        receipt,
        error: writeError
    };
}

