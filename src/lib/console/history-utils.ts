import { Address, Hex, zeroAddress } from "viem";

export interface TransactionRecord {
    hash: string;
    blockNumber: bigint;
    target: Address;
    success: boolean;
    result: Hex;
}

export interface ExecutionEventLike {
    transactionHash?: Hex;
    blockNumber?: bigint;
    args: {
        tokenId?: bigint;
        caller?: Address;
        account?: Address;
        target?: Address;
        selector?: Hex;
        success?: boolean;
        result?: Hex;
    };
}

export interface BlockRange {
    fromBlock: bigint;
    toBlock: bigint;
}

export function buildBlockRanges(params: {
    latestBlock: bigint;
    totalBlocksToScan: bigint;
    chunkSize: bigint;
}): BlockRange[] {
    const { latestBlock, totalBlocksToScan, chunkSize } = params;
    const ranges: BlockRange[] = [];

    const minBlock =
        latestBlock - totalBlocksToScan > BigInt(0)
            ? latestBlock - totalBlocksToScan
            : BigInt(0);

    let currentToBlock = latestBlock;
    while (currentToBlock > minBlock) {
        const fromBlock =
            currentToBlock - chunkSize > minBlock
                ? currentToBlock - chunkSize
                : minBlock;
        ranges.push({ fromBlock, toBlock: currentToBlock });
        currentToBlock = fromBlock - BigInt(1);
    }

    return ranges;
}

export function normalizeExecutionHistory(params: {
    events: ExecutionEventLike[];
    tokenId: bigint;
}): TransactionRecord[] {
    const { events, tokenId } = params;
    const history: TransactionRecord[] = events
        .filter((event) => event.args.tokenId === tokenId)
        .map((event) => ({
            hash: event.transactionHash || "0x",
            blockNumber: event.blockNumber || BigInt(0),
            target: event.args.target ?? zeroAddress,
            success: Boolean(event.args.success),
            result: event.args.result ?? "0x",
        }));

    const uniqueHistory = Array.from(
        new Map(history.map((item) => [item.hash, item])).values()
    );
    uniqueHistory.sort((a, b) => Number(b.blockNumber - a.blockNumber));

    return uniqueHistory;
}
