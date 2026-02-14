import { NextRequest, NextResponse } from "next/server";

const RUNNER_URL = process.env.RUNNER_URL || "http://shll-runner:8787";
const RUNNER_API_KEY = process.env.RUNNER_API_KEY || process.env.API_KEY || "";

export async function GET(req: NextRequest) {
    try {
        const tokenId = req.nextUrl.searchParams.get("tokenId");
        const nfaAddress = req.nextUrl.searchParams.get("nfaAddress");
        const runsLimit = req.nextUrl.searchParams.get("runsLimit") || "10";

        if (!tokenId || !/^\d+$/.test(tokenId)) {
            return NextResponse.json({ error: "tokenId is required and must be numeric" }, { status: 400 });
        }

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (RUNNER_API_KEY) {
            headers["x-api-key"] = RUNNER_API_KEY;
        }

        const params = new URLSearchParams({
            tokenId,
            runsLimit,
        });
        if (nfaAddress) {
            params.set("nfaAddress", nfaAddress);
        }

        const response = await fetch(`${RUNNER_URL}/status?${params.toString()}`, {
            method: "GET",
            headers,
            cache: "no-store",
        });

        const text = await response.text();
        let data: unknown = {};
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = { raw: text };
            }
        }

        if (!response.ok) {
            const upstream = data as { error?: string } | null;
            return NextResponse.json(
                {
                    error: upstream?.error || "Runner upstream error",
                    details: data,
                },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[Autopilot Status API] Exception:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
