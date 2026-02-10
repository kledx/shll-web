import { useBalance, useReadContracts } from "wagmi";
import { Address, erc20Abi, formatUnits } from "viem";

// Token addresses (Testnet Mock)
// Token addresses (BSC Testnet)
const TOKENS = {
    USDT: "0x66E972502A34A625828C544a1914E8D8cc2A9dE5",
    WBNB: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    DAI: "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F9a0F92"
} as const;

export interface Asset {
    symbol: string;
    name: string;
    balance: string;
    decimals: number;
    address?: Address; // Native has no address
    isNative: boolean;
}

export function useVaultBalances(agentAccount?: Address) {
    // 1. Native Balance (BNB)
    const { data: nativeBalance, isLoading: isNativeLoading } = useBalance({
        address: agentAccount,
    });

    // 2. ERC20 Balances
    const tokenList = Object.entries(TOKENS).map(([symbol, address]) => ({ symbol, address: address as Address }));

    const { data: tokenBalances, isLoading: isTokensLoading } = useReadContracts({
        contracts: tokenList.map(token => ({
            address: token.address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [agentAccount || "0x0000000000000000000000000000000000000000" as Address],
        })),
        query: {
            enabled: !!agentAccount
        }
    });

    // 3. Combine Data
    const assets: Asset[] = [];

    // Native
    if (nativeBalance) {
        assets.push({
            symbol: nativeBalance?.symbol || "BNB",
            name: "Native Token",
            // Manual format to avoid type issues with .formatted
            balance: nativeBalance ? formatUnits(nativeBalance.value, nativeBalance.decimals) : "0",
            decimals: nativeBalance?.decimals || 18,
            isNative: true
        });
    }

    // Tokens
    if (tokenBalances) {
        tokenBalances.forEach((result, index) => {
            const token = tokenList[index];
            if (result.status === "success") {
                assets.push({
                    symbol: token.symbol,
                    name: token.symbol, // Simplified for now
                    balance: formatUnits(result.result as unknown as bigint, 18), // Assuming 18 decimals for these mocks
                    decimals: 18,
                    address: token.address,
                    isNative: false
                });
            }
        });
    }

    return {
        assets,
        isLoading: isNativeLoading || isTokensLoading
    };
}
