type RuntimeEnvKey =
    | "NEXT_PUBLIC_AGENT_NFA"
    | "NEXT_PUBLIC_LISTING_MANAGER"
    | "NEXT_PUBLIC_POLICY_GUARD"
    | "NEXT_PUBLIC_DEPLOY_BLOCK"
    | "NEXT_PUBLIC_RUNNER_OPERATOR"
    | "NEXT_PUBLIC_EXPLORER_TX_BASE_URL"
    | "NEXT_PUBLIC_EXTRA_TOKENS"
    | "NEXT_PUBLIC_POLICY_GUARD_V3"
    | "NEXT_PUBLIC_ADMIN_WALLET";

type RuntimeEnvMap = Partial<Record<RuntimeEnvKey, string>>;

declare global {
    interface Window {
        __SHLL_RUNTIME_ENV__?: RuntimeEnvMap;
    }
}

const BUILD_ENV: RuntimeEnvMap = {
    NEXT_PUBLIC_AGENT_NFA: process.env.NEXT_PUBLIC_AGENT_NFA,
    NEXT_PUBLIC_LISTING_MANAGER: process.env.NEXT_PUBLIC_LISTING_MANAGER,
    NEXT_PUBLIC_POLICY_GUARD: process.env.NEXT_PUBLIC_POLICY_GUARD,
    NEXT_PUBLIC_DEPLOY_BLOCK: process.env.NEXT_PUBLIC_DEPLOY_BLOCK,
    NEXT_PUBLIC_RUNNER_OPERATOR: process.env.NEXT_PUBLIC_RUNNER_OPERATOR,
    NEXT_PUBLIC_EXPLORER_TX_BASE_URL: process.env.NEXT_PUBLIC_EXPLORER_TX_BASE_URL,
    NEXT_PUBLIC_EXTRA_TOKENS: process.env.NEXT_PUBLIC_EXTRA_TOKENS,
    NEXT_PUBLIC_POLICY_GUARD_V3: process.env.NEXT_PUBLIC_POLICY_GUARD_V3,
    NEXT_PUBLIC_ADMIN_WALLET: process.env.NEXT_PUBLIC_ADMIN_WALLET,
};

function readInjectedEnv(): RuntimeEnvMap | undefined {
    if (typeof window === "undefined") return undefined;
    return window.__SHLL_RUNTIME_ENV__;
}

export function getRuntimeEnv(key: RuntimeEnvKey, fallback = ""): string {
    const injected = readInjectedEnv()?.[key];
    if (typeof injected === "string" && injected.trim() !== "") return injected;

    const buildTime = BUILD_ENV[key];
    if (typeof buildTime === "string" && buildTime.trim() !== "") return buildTime;

    return fallback;
}

export function getRuntimeEnvBigInt(key: RuntimeEnvKey, fallback: bigint): bigint {
    const raw = getRuntimeEnv(key, fallback.toString());
    try {
        return BigInt(raw);
    } catch {
        return fallback;
    }
}
