import { NextRequest, NextResponse } from "next/server";

const REQUEST_TIMEOUT_MS = 10_000;

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return "unknown error";
}

export async function GET(request: NextRequest) {
    const uri = request.nextUrl.searchParams.get("uri")?.trim();
    if (!uri) {
        return NextResponse.json(
            { error: "missing uri query param" },
            { status: 400 }
        );
    }

    let targetUrl: URL;
    try {
        targetUrl = new URL(uri);
    } catch {
        return NextResponse.json(
            { error: "invalid uri format" },
            { status: 400 }
        );
    }

    if (!["http:", "https:"].includes(targetUrl.protocol)) {
        return NextResponse.json(
            { error: "only http/https uri is supported" },
            { status: 400 }
        );
    }

    let upstream: Response;
    try {
        upstream = await fetch(targetUrl.toString(), {
            method: "GET",
            headers: { Accept: "application/json" },
            redirect: "follow",
            cache: "no-store",
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: "upstream fetch failed",
                message: getErrorMessage(error),
                uri: targetUrl.toString(),
            },
            { status: 502 }
        );
    }

    if (!upstream.ok) {
        return NextResponse.json(
            {
                error: "upstream returned non-2xx",
                status: upstream.status,
                statusText: upstream.statusText,
                uri: targetUrl.toString(),
            },
            { status: 502 }
        );
    }

    try {
        const json = await upstream.json();
        return NextResponse.json(json, {
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: "upstream response is not valid json",
                message: getErrorMessage(error),
                uri: targetUrl.toString(),
            },
            { status: 502 }
        );
    }
}

