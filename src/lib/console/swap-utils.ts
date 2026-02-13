export interface SwapTokenConfig {
    address: string;
    decimals: number;
    isNative: boolean;
}

export interface SwapPairFlags {
    isSameUnderlyingToken: boolean;
    isWrapUnwrapPair: boolean;
    isWrap: boolean;
    isUnwrap: boolean;
    isRouterSwap: boolean;
    isUnsupportedPair: boolean;
}

export function getOutputTokens(
    tokens: Record<string, SwapTokenConfig>,
    inputSymbol: string
): string[] {
    const inputConfig = tokens[inputSymbol];
    if (!inputConfig) {
        return Object.keys(tokens).filter((symbol) => symbol !== inputSymbol);
    }

    return Object.keys(tokens).filter((symbol) => {
        if (symbol === inputSymbol) return false;

        const outputConfig = tokens[symbol];
        const sameAddress =
            outputConfig.address.toLowerCase() ===
            inputConfig.address.toLowerCase();

        if (!sameAddress) return true;

        // Allow BNB <-> WBNB (native/wrapped with same address).
        return outputConfig.isNative !== inputConfig.isNative;
    });
}

export function getSwapPairFlags(
    tokens: Record<string, SwapTokenConfig>,
    tokenIn: string,
    tokenOut: string
): SwapPairFlags {
    const tokenInConfig = tokens[tokenIn];
    const tokenOutConfig = tokens[tokenOut];

    const hasBoth = Boolean(tokenInConfig && tokenOutConfig);
    const isSameUnderlyingToken =
        hasBoth &&
        tokenInConfig.address.toLowerCase() ===
            tokenOutConfig.address.toLowerCase();
    const isWrapUnwrapPair =
        isSameUnderlyingToken &&
        tokenInConfig.isNative !== tokenOutConfig.isNative;
    const isWrap = isWrapUnwrapPair && tokenInConfig.isNative;
    const isUnwrap = isWrapUnwrapPair && tokenOutConfig.isNative;
    const isRouterSwap = hasBoth && !isWrapUnwrapPair;
    const isUnsupportedPair = isSameUnderlyingToken && !isWrapUnwrapPair;

    return {
        isSameUnderlyingToken,
        isWrapUnwrapPair,
        isWrap,
        isUnwrap,
        isRouterSwap,
        isUnsupportedPair,
    };
}

export function resolveExpectedOut(params: {
    isWrapUnwrapPair: boolean;
    amountInWei: bigint;
    quoteData?: readonly bigint[];
}): bigint {
    const { isWrapUnwrapPair, amountInWei, quoteData } = params;
    if (isWrapUnwrapPair) return amountInWei;

    if (quoteData && quoteData[0] === amountInWei) {
        return quoteData[1] ?? BigInt(0);
    }
    return BigInt(0);
}

export function calcAmountOutMin(
    expectedOut: bigint,
    slippagePercentText: string
): bigint {
    if (expectedOut <= BigInt(0)) return BigInt(0);

    const slippagePercent = Number.parseFloat(slippagePercentText);
    const safeSlippage = Number.isFinite(slippagePercent) ? slippagePercent : 0;
    const slippageBps = Math.round(safeSlippage * 100);
    return expectedOut - (expectedOut * BigInt(slippageBps)) / BigInt(10_000);
}
