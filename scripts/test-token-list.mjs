/**
 * Functional test: Token list dynamic management
 *
 * Self-contained test that directly exercises the parseExtraTokens logic
 * without requiring Next.js module resolution.
 *
 * Run with: node scripts/test-token-list.mjs
 */

// ── Inline the parse logic (mirrors tokens.ts) ──────────

function parseExtraTokens(envValue) {
    const raw = envValue ?? "";
    if (!raw.trim()) return [];
    const results = [];
    for (const entry of raw.split(";")) {
        const trimmed = entry.trim();
        if (!trimmed) continue;
        const parts = trimmed.split(":");
        if (parts.length < 4) {
            console.log(`    [warn] Skipping malformed entry: "${trimmed}"`);
            continue;
        }
        const [symbol, name, address, decimalsStr] = parts;
        const decimals = parseInt(decimalsStr, 10);
        if (!symbol || !name || !address?.startsWith("0x") || !Number.isFinite(decimals)) {
            console.log(`    [warn] Skipping invalid entry: "${trimmed}"`);
            continue;
        }
        results.push({
            symbol: symbol.trim(),
            name: name.trim(),
            address: address.trim(),
            decimals,
            isNative: false,
        });
    }
    return results;
}

const DEFAULT_TOKENS = [
    { symbol: "BNB", name: "BNB", address: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", decimals: 18, isNative: true },
    { symbol: "USDT", name: "USDT", address: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", decimals: 18, isNative: false },
    { symbol: "WBNB", name: "WBNB", address: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", decimals: 18, isNative: false },
];

function buildTokenList(envValue) {
    const extras = parseExtraTokens(envValue);
    const existingSymbols = new Set(DEFAULT_TOKENS.map((t) => t.symbol));
    const deduped = extras.filter((t) => {
        if (existingSymbols.has(t.symbol)) {
            console.log(`    [warn] Skipping duplicate symbol: "${t.symbol}"`);
            return false;
        }
        existingSymbols.add(t.symbol);
        return true;
    });
    return [...DEFAULT_TOKENS, ...deduped];
}

// ── Test runner ──────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, label) {
    if (condition) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.error(`  ❌ ${label}`);
        failed++;
    }
}

// Test 1: No env — only defaults
console.log("\n=== Test 1: No NEXT_PUBLIC_EXTRA_TOKENS ===");
{
    const tokens = buildTokenList("");
    assert(tokens.length === 3, `default 3 tokens (got ${tokens.length})`);
}

// Test 2: Valid extra tokens
console.log("\n=== Test 2: Valid extra tokens ===");
{
    const env = "CAKE:PancakeSwap:0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82:18;DAI:Dai:0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3:18";
    const tokens = buildTokenList(env);
    assert(tokens.length === 5, `5 tokens (3 default + 2 extra), got ${tokens.length}`);

    const symbols = tokens.map((t) => t.symbol);
    assert(symbols.includes("CAKE"), "CAKE added");
    assert(symbols.includes("DAI"), "DAI added");

    const cake = tokens.find((t) => t.symbol === "CAKE");
    assert(cake.address === "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", "CAKE address correct");
    assert(cake.decimals === 18, "CAKE decimals = 18");
    assert(cake.isNative === false, "CAKE isNative = false");
}

// Test 3: Malformed entries skipped
console.log("\n=== Test 3: Malformed entries skipped ===");
{
    const env = "CAKE:PancakeSwap:0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82:18;BAD_ENTRY;NOPE:missing:parts";
    const tokens = buildTokenList(env);
    assert(tokens.length === 4, `4 tokens (3 default + 1 valid extra), got ${tokens.length}`);
    const symbols = tokens.map((t) => t.symbol);
    assert(!symbols.includes("BAD_ENTRY"), "BAD_ENTRY skipped");
    assert(!symbols.includes("NOPE"), "NOPE skipped");
}

// Test 4: Duplicate symbol skipped
console.log("\n=== Test 4: Duplicate symbol skipped ===");
{
    const env = "USDT:Duplicate_USDT:0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:6";
    const tokens = buildTokenList(env);
    assert(tokens.length === 3, `3 tokens (duplicate USDT skipped), got ${tokens.length}`);
    const usdt = tokens.find((t) => t.symbol === "USDT");
    assert(usdt.address === "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", "original USDT address preserved");
}

// Test 5: Non-hex address skipped
console.log("\n=== Test 5: Non-hex address skipped ===");
{
    const env = "BAD:BadToken:not-hex-addr:18";
    const tokens = buildTokenList(env);
    assert(tokens.length === 3, `3 tokens (invalid address skipped), got ${tokens.length}`);
}

// Test 6: Different decimals
console.log("\n=== Test 6: Different decimals (USDC 6) ===");
{
    const env = "USDC:USDC:0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d:6";
    const tokens = buildTokenList(env);
    assert(tokens.length === 4, `4 tokens, got ${tokens.length}`);
    const usdc = tokens.find((t) => t.symbol === "USDC");
    assert(usdc.decimals === 6, "USDC decimals = 6");
}

// Test 7: ERC20 filter
console.log("\n=== Test 7: ERC20 filter excludes native ===");
{
    const env = "CAKE:PancakeSwap:0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82:18";
    const tokens = buildTokenList(env);
    const erc20 = tokens.filter((t) => !t.isNative);
    assert(erc20.length === 3, `ERC20 = 3 (USDT + WBNB + CAKE), got ${erc20.length}`);
    assert(!erc20.find((t) => t.symbol === "BNB"), "BNB excluded from ERC20");
}

console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${"=".repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
