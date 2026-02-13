import { NextRequest, NextResponse } from "next/server";

const RUNNER_URL = process.env.RUNNER_URL || "http://shll-runner:8787";
const RUNNER_API_KEY = process.env.RUNNER_API_KEY || process.env.API_KEY || "";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (RUNNER_API_KEY) {
            headers["x-api-key"] = RUNNER_API_KEY;
        }

        const response = await fetch(`${RUNNER_URL}/disable`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
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
        console.error("[Autopilot Disable API] Exception:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
