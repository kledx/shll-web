import { useBalance, useReadContracts } from "wagmi";
import { Address, erc20Abi, formatUnits } from "viem";

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

    // 2. ERC20 Balances + Decimals (batch read)
    const tokenList = Object.entries(TOKENS).map(([symbol, address]) => ({ symbol, address: address as Address }));
    const zeroAddr = "0x0000000000000000000000000000000000000000" as Address;

    const { data: tokenData, isLoading: isTokensLoading } = useReadContracts({
        contracts: [
            // First: balanceOf for each token
            ...tokenList.map(token => ({
                address: token.address,
                abi: erc20Abi,
                functionName: 'balanceOf' as const,
                args: [agentAccount || zeroAddr],
            })),
            // Then: decimals for each token
            ...tokenList.map(token => ({
                address: token.address,
                abi: erc20Abi,
                functionName: 'decimals' as const,
            })),
        ],
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
            balance: nativeBalance ? formatUnits(nativeBalance.value, nativeBalance.decimals) : "0",
            decimals: nativeBalance?.decimals || 18,
            isNative: true
        });
    }

    // Tokens
    if (tokenData) {
        const count = tokenList.length;
        tokenList.forEach((token, index) => {
            const balanceResult = tokenData[index];
            const decimalsResult = tokenData[count + index];

            if (balanceResult?.status === "success") {
                const decimals = decimalsResult?.status === "success"
                    ? Number(decimalsResult.result)
                    : 18; // Fallback to 18 if decimals read fails

                assets.push({
                    symbol: token.symbol,
                    name: token.symbol,
                    balance: formatUnits(balanceResult.result as unknown as bigint, decimals),
                    decimals,
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

