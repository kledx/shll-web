import assert from "node:assert/strict";
import {
    calcAmountOutMin,
    getOutputTokens,
    getSwapPairFlags,
    resolveExpectedOut,
    SwapTokenConfig,
} from "../src/lib/console/swap-utils";

const TOKENS: Record<string, SwapTokenConfig> = {
    BNB: { address: "0x1111111111111111111111111111111111111111", decimals: 18, isNative: true },
    WBNB: { address: "0x1111111111111111111111111111111111111111", decimals: 18, isNative: false },
    USDT: { address: "0x2222222222222222222222222222222222222222", decimals: 18, isNative: false },
};

function runGetOutputTokensCase() {
    const outFromBNB = getOutputTokens(TOKENS, "BNB");
    assert.deepEqual(outFromBNB.sort(), ["USDT", "WBNB"]);

    const outFromWBNB = getOutputTokens(TOKENS, "WBNB");
    assert.deepEqual(outFromWBNB.sort(), ["BNB", "USDT"]);
}

function runSwapPairFlagsCase() {
    const wrap = getSwapPairFlags(TOKENS, "BNB", "WBNB");
    assert.equal(wrap.isWrap, true);
    assert.equal(wrap.isUnwrap, false);
    assert.equal(wrap.isRouterSwap, false);
    assert.equal(wrap.isUnsupportedPair, false);

    const unwrap = getSwapPairFlags(TOKENS, "WBNB", "BNB");
    assert.equal(unwrap.isWrap, false);
    assert.equal(unwrap.isUnwrap, true);
    assert.equal(unwrap.isRouterSwap, false);
    assert.equal(unwrap.isUnsupportedPair, false);

    const routerSwap = getSwapPairFlags(TOKENS, "USDT", "WBNB");
    assert.equal(routerSwap.isRouterSwap, true);
    assert.equal(routerSwap.isUnsupportedPair, false);
}

function runExpectedOutCase() {
    const amountIn = BigInt(1000);
    const staleQuote = [BigInt(999), BigInt(888)] as const;
    const freshQuote = [BigInt(1000), BigInt(777)] as const;

    assert.equal(
        resolveExpectedOut({
            isWrapUnwrapPair: true,
            amountInWei: amountIn,
            quoteData: staleQuote,
        }),
        amountIn
    );

    assert.equal(
        resolveExpectedOut({
            isWrapUnwrapPair: false,
            amountInWei: amountIn,
            quoteData: staleQuote,
        }),
        BigInt(0)
    );

    assert.equal(
        resolveExpectedOut({
            isWrapUnwrapPair: false,
            amountInWei: amountIn,
            quoteData: freshQuote,
        }),
        BigInt(777)
    );
}

function runAmountOutMinCase() {
    assert.equal(calcAmountOutMin(BigInt(100000), "0.5"), BigInt(99500));
    assert.equal(calcAmountOutMin(BigInt(100000), "1"), BigInt(99000));
    assert.equal(calcAmountOutMin(BigInt(100000), "bad"), BigInt(100000));
}

runGetOutputTokensCase();
runSwapPairFlagsCase();
runExpectedOutCase();
runAmountOutMinCase();
