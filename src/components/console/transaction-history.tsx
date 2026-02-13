"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePublicClient } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { parseAbiItem, zeroAddress } from "viem";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import {
    buildBlockRanges,
    ExecutionEventLike,
    normalizeExecutionHistory,
    TransactionRecord,
} from "@/lib/console/history-utils";

export function TransactionHistory({ tokenId, refreshKey = 0 }: { tokenId: string; refreshKey?: number }) {
    const { t } = useTranslation();
    const publicClient = usePublicClient();
    const [logs, setLogs] = useState<TransactionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!publicClient) return;

        // Skip fetching if address is not set (mock/dev environment)
        if (CONTRACTS.AgentNFA.address === zeroAddress) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        const fetchLogs = async (silent = false) => {
            try {
                if (!silent) setIsLoading(true);
                const latestBlock = await publicClient.getBlockNumber();

                // Scan fast ~24 hours (approx 30k blocks)
                const TOTAL_BLOCKS_TO_SCAN = BigInt(30000);
                const CHUNK_SIZE = BigInt(1500); // Smaller chunks reduce public RPC log-limit failures

                let allEvents: ExecutionEventLike[] = [];
                const ranges = buildBlockRanges({
                    latestBlock,
                    totalBlocksToScan: TOTAL_BLOCKS_TO_SCAN,
                    chunkSize: CHUNK_SIZE,
                });

                // Fetch in chunks
                for (const { fromBlock, toBlock } of ranges) {
                    if (cancelled) break;
                    try {
                        const chunks = await publicClient.getLogs({
                            address: CONTRACTS.AgentNFA.address,
                            event: parseAbiItem(
                                "event Executed(uint256 indexed tokenId, address indexed caller, address indexed account, address target, bytes4 selector, bool success, bytes result)"
                            ),
                            args: { tokenId: BigInt(tokenId) },
                            fromBlock,
                            toBlock
                        });
                        allEvents = [...allEvents, ...(chunks as ExecutionEventLike[])];
                    } catch (err) {
                        console.warn(`Failed to fetch logs from ${fromBlock} to ${toBlock}`, err);
                    }
                }
                const history = normalizeExecutionHistory({
                    events: allEvents,
                    tokenId: BigInt(tokenId),
                });

                setLogs(history);
            } catch (err: unknown) {
                if (!cancelled) {
                    console.warn("TransactionHistory: Unexpected error", err);
                }
            } finally {
                if (!cancelled && !silent) setIsLoading(false);
            }
        };

        void fetchLogs();
        const interval = setInterval(() => {
            void fetchLogs(true);
        }, 15000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [publicClient, tokenId, refreshKey]);

    if (isLoading) {
        return <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>;
    }

    if (logs.length === 0) {
        return (
            <Card className="border-[var(--color-burgundy)]/10">
                <CardHeader>
                    <CardTitle className="text-lg">{t.agent.console.history.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{t.agent.console.history.empty}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-[var(--color-burgundy)]/10">
            <CardHeader>
                <CardTitle className="text-lg">{t.agent.console.history.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {logs.map((log) => (
                    <div key={log.hash} className="flex items-center justify-between p-3 bg-[var(--color-paper)]/50 rounded-lg border">
                        <div className="flex items-center gap-3">
                            {log.success ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <div>
                                <div className="text-sm font-bold font-mono">{log.target}</div>
                                <div className="text-xs text-muted-foreground">{t.agent.console.history.block} {log.blockNumber.toString()}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <a
                                href={`https://testnet.bscscan.com/tx/${log.hash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[var(--color-sky)] hover:underline"
                            >
                                {log.hash.slice(0, 10)}...
                            </a>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
