import { NextResponse, NextRequest } from "next/server";

/**
 * /api/safety-config — Proxy to Runner /v3/safety/:tokenId
 *
 * GET  ?tokenId=X  → Returns current safety config
 * PUT  ?tokenId=X  → Create or update safety config (body = JSON)
 * DELETE ?tokenId=X → Reset safety config to defaults
 */

const RUNNER_URL = process.env.RUNNER_URL ?? "https://runner.shll.run";
const API_KEY = process.env.RUNNER_API_KEY ?? process.env.API_KEY ?? "";

async function proxyToRunner(
    method: string,
    tokenId: string,
    body?: unknown,
): Promise<Response> {
    const url = `${RUNNER_URL}/v3/safety/${tokenId}`;
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (API_KEY) headers["x-api-key"] = API_KEY;

    return fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
}

export async function GET(req: NextRequest) {
    const tokenId = req.nextUrl.searchParams.get("tokenId");
    if (!tokenId || !/^\d+$/.test(tokenId)) {
        return NextResponse.json({ error: "missing or invalid tokenId" }, { status: 400 });
    }

    try {
        const res = await proxyToRunner("GET", tokenId);
        const data = await res.json();

        if (!res.ok) {
            // 404 = no config yet, return empty defaults
            if (res.status === 404) {
                return NextResponse.json({
                    ok: true,
                    config: {
                        tokenId,
                        allowedTokens: [],
                        blockedTokens: [],
                        maxTradeAmount: "0",
                        maxDailyAmount: "0",
                        maxSlippageBps: 0,
                        cooldownSeconds: 0,
                        maxRunsPerDay: 0,
                        allowedDexes: [],
                    },
                    isDefault: true,
                });
            }
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json({ ...data, isDefault: false });
    } catch (error) {
        console.error("[SafetyConfig] GET error:", error);
        return NextResponse.json({ error: "Failed to fetch safety config" }, { status: 502 });
    }
}

export async function PUT(req: NextRequest) {
    const tokenId = req.nextUrl.searchParams.get("tokenId");
    if (!tokenId || !/^\d+$/.test(tokenId)) {
        return NextResponse.json({ error: "missing or invalid tokenId" }, { status: 400 });
    }

    try {
        const body = await req.json();
        const res = await proxyToRunner("PUT", tokenId, body);
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("[SafetyConfig] PUT error:", error);
        return NextResponse.json({ error: "Failed to save safety config" }, { status: 502 });
    }
}

export async function DELETE(req: NextRequest) {
    const tokenId = req.nextUrl.searchParams.get("tokenId");
    if (!tokenId || !/^\d+$/.test(tokenId)) {
        return NextResponse.json({ error: "missing or invalid tokenId" }, { status: 400 });
    }

    try {
        const res = await proxyToRunner("DELETE", tokenId);
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("[SafetyConfig] DELETE error:", error);
        return NextResponse.json({ error: "Failed to reset safety config" }, { status: 502 });
    }
}
