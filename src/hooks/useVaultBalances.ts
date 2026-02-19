import { useBalance, useReadContracts } from "wagmi";
import { Address, erc20Abi, formatUnits } from "viem";
import { ERC20_TOKENS } from "@/config/tokens";

export interface Asset {
    symbol: string;
    name: string;
    balance: string;
    decimals: number;
    address?: Address; // Native has no address
    isNative: boolean;
}

export function useVaultBalances(agentAccount?: Address) {
    // 1. Native Balance (BNB) — auto-refresh every 30s
    const { data: nativeBalance, isLoading: isNativeLoading, refetch: refetchNative } = useBalance({
        address: agentAccount,
        query: { refetchInterval: 30_000 },
    });

    // 2. ERC20 Balances + Decimals (batch read)
    const tokenList = ERC20_TOKENS.map(t => ({ symbol: t.symbol, address: t.address }));
    const zeroAddr = "0x0000000000000000000000000000000000000000" as Address;

    const { data: tokenData, isLoading: isTokensLoading, refetch: refetchTokens } = useReadContracts({
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
            enabled: !!agentAccount,
            refetchInterval: 30_000,
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
        // console.log("VaultBalances tokenData:", tokenData);
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
            } else {
                console.warn(`Failed to fetch balance for ${token.symbol}`, balanceResult);
            }
        });
    } else if (isTokensLoading) {
        // console.log("Loading tokens...");
    } else {
        console.warn("No tokenData returned from useReadContracts");
    }

    // Combined refetch for both native and ERC-20
    const refetch = () => {
        refetchNative();
        refetchTokens();
    };

    return {
        assets,
        isLoading: isNativeLoading || isTokensLoading,
        refetch,
    };
}

