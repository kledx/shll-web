import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { Hex, Address } from "viem";

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
