import assert from "node:assert/strict";
import {
    buildBlockRanges,
    ExecutionEventLike,
    normalizeExecutionHistory,
} from "../src/lib/console/history-utils";

function runBuildBlockRangesCase() {
    const ranges = buildBlockRanges({
        latestBlock: BigInt(100),
        totalBlocksToScan: BigInt(30),
        chunkSize: BigInt(10),
    });

    assert.deepEqual(ranges, [
        { fromBlock: BigInt(90), toBlock: BigInt(100) },
        { fromBlock: BigInt(79), toBlock: BigInt(89) },
        { fromBlock: BigInt(70), toBlock: BigInt(78) },
    ]);
}

function runNormalizeHistoryCase() {
    const events: ExecutionEventLike[] = [
        {
            transactionHash: "0xbbb",
            blockNumber: BigInt(10),
            args: {
                tokenId: BigInt(1),
                target: "0x0000000000000000000000000000000000000001",
                success: true,
                result: "0x11",
            },
        },
        {
            transactionHash: "0xaaa",
            blockNumber: BigInt(15),
            args: {
                tokenId: BigInt(1),
                target: "0x0000000000000000000000000000000000000002",
                success: false,
                result: "0x22",
            },
        },
        {
            transactionHash: "0xaaa",
            blockNumber: BigInt(15),
            args: {
                tokenId: BigInt(1),
                target: "0x0000000000000000000000000000000000000003",
                success: true,
                result: "0x33",
            },
        },
        {
            transactionHash: "0xccc",
            blockNumber: BigInt(20),
            args: {
                tokenId: BigInt(2),
                target: "0x0000000000000000000000000000000000000004",
                success: true,
                result: "0x44",
            },
        },
    ];

    const history = normalizeExecutionHistory({
        events,
        tokenId: BigInt(1),
    });

    assert.equal(history.length, 2);
    assert.deepEqual(history.map((item) => item.hash), ["0xaaa", "0xbbb"]);
    assert.equal(history[0]?.target, "0x0000000000000000000000000000000000000003");
    assert.equal(history[0]?.success, true);
}

runBuildBlockRangesCase();
runNormalizeHistoryCase();
