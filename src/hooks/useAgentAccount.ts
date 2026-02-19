import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { Address } from "viem";
import { bscTestnet } from "wagmi/chains";

export function useAgentAccount(tokenId: string, nfaAddress?: string) {
    const resolvedNfaAddress = (nfaAddress || CONTRACTS.AgentNFA.address) as Address;
    const { data: account, isLoading } = useReadContract({
        address: resolvedNfaAddress,
        abi: CONTRACTS.AgentNFA.abi,
        functionName: "accountOf",
        args: [BigInt(tokenId)],
        chainId: bscTestnet.id,
    });

    return {
        account: account as Address | undefined,
        isLoading
    };
}
