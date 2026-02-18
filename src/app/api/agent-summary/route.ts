import { NextResponse, NextRequest } from "next/server";

const RAW_PONDER_URL = process.env.PONDER_URL || "http://shll-indexer:42069";
const PONDER_URL = RAW_PONDER_URL.replace(/\/+$/, "");

export async function GET(req: NextRequest) {
    const tokenId = req.nextUrl.searchParams.get("tokenId");
    if (!tokenId || !/^\d+$/.test(tokenId)) {
        return NextResponse.json({ error: "missing or invalid tokenId" }, { status: 400 });
    }

    try {
        const response = await fetch(`${PONDER_URL}/api/agents/${tokenId}/summary`, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error(`[AgentSummary Proxy] Error: ${response.status} ${response.statusText}`);
            return NextResponse.json({ error: "Indexer upstream error" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[AgentSummary Proxy] Exception:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
