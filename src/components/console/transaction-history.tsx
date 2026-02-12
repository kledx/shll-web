"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePublicClient } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { Address, parseAbiItem, zeroAddress } from "viem";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface TransactionRecord {
    hash: string;
    blockNumber: bigint;
    target: Address;
    success: boolean;
    result: string;
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

        const fetchLogs = async () => {
            try {
                const blockNumber = await publicClient.getBlockNumber();
                // Fetch last 5000 blocks to avoid RPC limits on public nodes
                const fromBlock = blockNumber - BigInt(5000) > BigInt(0) ? blockNumber - BigInt(5000) : BigInt(0);

                const events = await publicClient.getLogs({
                    address: CONTRACTS.AgentNFA.address,
                    event: parseAbiItem(
                        "event Executed(uint256 indexed tokenId, address indexed caller, address indexed account, address target, bytes4 selector, bool success, bytes result)"
                    ),
                    args: {
                        tokenId: BigInt(tokenId),
                    },
                    fromBlock: fromBlock
                });

                const records = events.map(log => ({
                    hash: log.transactionHash,
                    blockNumber: log.blockNumber,
                    target: log.args.target!,
                    success: log.args.success!,
                    result: log.args.result!
                })).reverse(); // Newest first

                setLogs(records);
            } catch (err) {
                console.error("Failed to fetch logs:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
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
                                href={`https://opbnb-testnet.bscscan.com/tx/${log.hash}`}
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
