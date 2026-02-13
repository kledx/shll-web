"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePublicClient } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { Address, Hex, parseAbi, zeroAddress } from "viem";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface TransactionRecord {
    hash: string;
    blockNumber: bigint;
    target: Address;
    success: boolean;
    result: Hex;
}

interface ExecutionEventLike {
    transactionHash?: Hex;
    blockNumber?: bigint;
    args: {
        tokenId?: bigint;
        target?: Address;
        success?: boolean;
        result?: Hex;
    };
}

export function TransactionHistory({ tokenId }: { tokenId: string }) {
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

        const fetchLogs = async () => {
            try {
                const latestBlock = await publicClient.getBlockNumber();

                // Scan fast ~24 hours (approx 30k blocks)
                const TOTAL_BLOCKS_TO_SCAN = BigInt(30000);
                const CHUNK_SIZE = BigInt(5000); // Safe chunk size for public BSC nodes

                let currentToBlock = latestBlock;
                const minBlock = latestBlock - TOTAL_BLOCKS_TO_SCAN > BigInt(0) ? latestBlock - TOTAL_BLOCKS_TO_SCAN : BigInt(0);

                let allEvents: ExecutionEventLike[] = [];

                // Fetch in chunks
                while (currentToBlock > minBlock && !cancelled) {
                    const fromBlock = currentToBlock - CHUNK_SIZE > minBlock ? currentToBlock - CHUNK_SIZE : minBlock;

                    try {
                        const chunks = await publicClient.getLogs({
                            address: CONTRACTS.AgentNFA.address,
                            events: parseAbi([
                                "event Execution(uint256 indexed tokenId, address indexed target, uint256 value, bytes data, bool success, bytes result)"
                            ]),
                            fromBlock,
                            toBlock: currentToBlock
                        });
                        allEvents = [...allEvents, ...(chunks as ExecutionEventLike[])];
                    } catch (err) {
                        console.warn(`Failed to fetch logs from ${fromBlock} to ${currentToBlock}`, err);
                        // Convert BigInt to string for replacement, then back to BigInt if needed, or just let the loop continue?
                        // If a chunk fails, we skip it and continue. Or break? 
                        // Continuing might leave gaps. But better than nothing.
                    }

                    currentToBlock = fromBlock - BigInt(1);
                }

                // Filter for current agent
                const agentEvents = allEvents.filter(e => e.args.tokenId === BigInt(tokenId));

                const history: TransactionRecord[] = agentEvents.map((e) => {
                    return {
                        hash: e.transactionHash || "0x",
                        blockNumber: e.blockNumber || BigInt(0),
                        target: e.args.target ?? zeroAddress,
                        success: Boolean(e.args.success),
                        result: e.args.result ?? "0x",
                    };
                });

                // Deduplicate by hash just in case
                const uniqueHistory = Array.from(new Map(history.map(item => [item.hash, item])).values());

                // Sort: Newest first (descending blockNumber)
                uniqueHistory.sort((a, b) => Number(b.blockNumber - a.blockNumber));

                setLogs(uniqueHistory);
            } catch (err: unknown) {
                if (!cancelled) {
                    console.warn("TransactionHistory: Unexpected error", err);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchLogs();

        return () => { cancelled = true; };
    }, [publicClient, tokenId]);

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
