import { NextRequest, NextResponse } from "next/server";

const RUNNER_URL = process.env.RUNNER_URL || "http://shll-runner:8787";

export async function GET(req: NextRequest) {
    try {
        const tokenId = req.nextUrl.searchParams.get("tokenId");
        if (!tokenId) {
            return NextResponse.json({ error: "tokenId is required" }, { status: 400 });
        }

        const params = new URLSearchParams({ tokenId });
        const response = await fetch(`${RUNNER_URL}/agent/dashboard?${params.toString()}`, {
            headers: { "x-api-key": process.env.RUNNER_API_KEY || "" },
            cache: "no-store",
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
