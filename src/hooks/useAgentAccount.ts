import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { Address } from "viem";

export function useAgentAccount(tokenId: string) {
    const { data: account, isLoading } = useReadContract({
        address: CONTRACTS.AgentNFA.address,
        abi: CONTRACTS.AgentNFA.abi,
        functionName: "accountOf",
        args: [BigInt(tokenId)],
    });

    return {
        account: account as Address | undefined,
        isLoading
    };
}
