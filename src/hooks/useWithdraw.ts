import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { Address } from "viem";

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
