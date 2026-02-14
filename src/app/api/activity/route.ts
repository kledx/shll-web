import { NextRequest, NextResponse } from "next/server";

const RUNNER_URL = process.env.RUNNER_URL || "http://shll-runner:8787";
const RUNNER_API_KEY = process.env.RUNNER_API_KEY || process.env.API_KEY || "";
const PONDER_URL = process.env.PONDER_URL || "http://shll-indexer:42069";

interface IndexerActivityRow {
    id: string;
    tokenId: string;
    caller: string;
    account: string;
    target: string;
    selector: string;
    success: boolean;
    result: string;
    txHash: string;
    logIndex: number;
    blockNumber: string;
    timestamp: string;
}

interface RunnerRunRow {
    id: string;
    actionType?: string;
    simulateOk?: boolean;
    txHash?: string;
    error?: string;
    createdAt?: string;
}

function parseLimit(raw: string | null): number {
    if (!raw) return 10;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 100) return 10;
    return parsed;
}

export async function GET(req: NextRequest) {
    const tokenId = req.nextUrl.searchParams.get("tokenId");
    const nfaAddress = req.nextUrl.searchParams.get("nfa");
    const limit = parseLimit(req.nextUrl.searchParams.get("limit"));

    if (!tokenId || !/^\d+$/.test(tokenId)) {
        return NextResponse.json({ error: "tokenId is required and must be numeric" }, { status: 400 });
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (RUNNER_API_KEY) {
        headers["x-api-key"] = RUNNER_API_KEY;
    }

    let indexerRows: IndexerActivityRow[] = [];
    let indexerError: string | null = null;
    try {
        const res = await fetch(`${PONDER_URL}/api/activity/${tokenId}?limit=${limit}`, {
            cache: "no-store",
        });
        if (!res.ok) {
            indexerError = `Indexer error: ${res.status}`;
        } else {
            const json = (await res.json()) as { items?: IndexerActivityRow[] };
            indexerRows = Array.isArray(json.items) ? json.items : [];
        }
    } catch (err) {
        indexerError = err instanceof Error ? err.message : "Indexer unavailable";
    }

    let runnerRuns: RunnerRunRow[] = [];
    let runnerError: string | null = null;
    try {
        const query = new URLSearchParams({
            tokenId,
            runsLimit: String(limit),
        });
        if (nfaAddress) {
            query.set("nfaAddress", nfaAddress);
        }
        const res = await fetch(`${RUNNER_URL}/status?${query.toString()}`, {
            headers,
            cache: "no-store",
        });
        if (!res.ok) {
            runnerError = `Runner error: ${res.status}`;
        } else {
            const json = (await res.json()) as { runs?: RunnerRunRow[] };
            runnerRuns = Array.isArray(json.runs) ? json.runs : [];
        }
    } catch (err) {
        runnerError = err instanceof Error ? err.message : "Runner unavailable";
    }

    const runnerByTx = new Map<string, RunnerRunRow>();
    for (const run of runnerRuns) {
        if (run.txHash) {
            runnerByTx.set(run.txHash.toLowerCase(), run);
        }
    }

    const indexerAvailable = !indexerError;
    const hasIndexerData = indexerRows.length > 0;

    if (hasIndexerData) {
        const items = indexerRows.map((row) => {
            const runner = runnerByTx.get(row.txHash.toLowerCase());
            return {
                id: `idx:${row.id}`,
                origin: "indexer",
                tokenId: row.tokenId,
                actionType: runner?.actionType ?? "execute",
                success: row.success,
                txHash: row.txHash,
                target: row.target,
                selector: row.selector,
                error: row.success ? null : runner?.error ?? "execution reverted",
                blockNumber: row.blockNumber,
                logIndex: row.logIndex,
                timestamp: row.timestamp,
            };
        });

        return NextResponse.json({
            ok: true,
            source: "indexer",
            degraded: false,
            diagnostics: {
                runnerAttached: runnerRuns.length > 0,
                indexerError,
                runnerError,
            },
            items,
        });
    }

    if (indexerAvailable && runnerRuns.length === 0) {
        return NextResponse.json({
            ok: true,
            source: "indexer",
            degraded: false,
            diagnostics: {
                runnerAttached: false,
                indexerError,
                runnerError,
            },
            items: [],
        });
    }

    const items = runnerRuns.map((row) => {
        const ts = row.createdAt ? Math.floor(new Date(row.createdAt).getTime() / 1000) : 0;
        const success = row.simulateOk === true && !row.error;
        return {
            id: `run:${row.id}`,
            origin: "runner",
            tokenId,
            actionType: row.actionType ?? "auto",
            success,
            txHash: row.txHash ?? null,
            target: null,
            selector: null,
            error: row.error ?? null,
            blockNumber: null,
            logIndex: null,
            timestamp: String(ts),
        };
    });

    return NextResponse.json({
        ok: true,
        source: "runner-fallback",
        degraded: true,
        reason: indexerError || "Indexer lagging behind runner activity",
        diagnostics: {
            indexerError,
            runnerError,
        },
        items,
    });
}
