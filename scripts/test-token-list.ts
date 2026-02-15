/**
 * Functional test: Token list dynamic management
 *
 * Run with: npx tsx scripts/test-token-list.ts
 */
export {};

// Simulate NEXT_PUBLIC_EXTRA_TOKENS being set
process.env.NEXT_PUBLIC_EXTRA_TOKENS =
    "CAKE:PancakeSwap:0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82:18;DAI:Dai Stablecoin:0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3:18";

// Also test malformed entries
process.env.NEXT_PUBLIC_EXTRA_TOKENS += ";BAD_ENTRY;NOPE:missing:parts";

// Dynamically import after setting env
const { KNOWN_TOKENS, TOKEN_MAP, ERC20_TOKENS } = await import("../src/config/tokens.js");

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
    if (condition) {
        console.log(`  [PASS] ${label}`);
        passed++;
    } else {
        console.error(`  [FAIL] ${label}`);
        failed++;
    }
}

console.log("\n=== Test: Token list with NEXT_PUBLIC_EXTRA_TOKENS ===");

// Default tokens: BNB, USDT, WBNB = 3
// Extra valid tokens: CAKE, DAI = 2
// Malformed entries: BAD_ENTRY, NOPE = skipped
assert(KNOWN_TOKENS.length === 5, `KNOWN_TOKENS has 5 entries (3 default + 2 extra), got ${KNOWN_TOKENS.length}`);

const symbols = KNOWN_TOKENS.map((t: { symbol: string }) => t.symbol);
assert(symbols.includes("BNB"), "BNB present (default)");
assert(symbols.includes("USDT"), "USDT present (default)");
assert(symbols.includes("WBNB"), "WBNB present (default)");
assert(symbols.includes("CAKE"), "CAKE present (extra)");
assert(symbols.includes("DAI"), "DAI present (extra)");

// Check CAKE details
const cake = TOKEN_MAP.CAKE;
assert(!!cake, "CAKE in TOKEN_MAP");
assert(cake.address === "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", "CAKE address correct");
assert(cake.decimals === 18, "CAKE decimals = 18");
assert(cake.isNative === false, "CAKE isNative = false");

// ERC20_TOKENS should include USDT, WBNB, CAKE, DAI (not BNB)
assert(ERC20_TOKENS.length === 4, `ERC20_TOKENS has 4 entries, got ${ERC20_TOKENS.length}`);
const erc20Symbols = ERC20_TOKENS.map((t: { symbol: string }) => t.symbol);
assert(!erc20Symbols.includes("BNB"), "BNB not in ERC20_TOKENS (it is native)");
assert(erc20Symbols.includes("CAKE"), "CAKE in ERC20_TOKENS");

console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${"=".repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
