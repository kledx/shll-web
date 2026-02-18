import { NextRequest, NextResponse } from "next/server";

const RUNNER_URL = process.env.RUNNER_URL || "http://shll-runner:8787";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tokenId } = body as { tokenId?: string };
        if (!tokenId) {
            return NextResponse.json({ error: "tokenId is required" }, { status: 400 });
        }

        const response = await fetch(`${RUNNER_URL}/strategy/clear-goal`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.RUNNER_API_KEY || "",
            },
            body: JSON.stringify({ tokenId }),
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
