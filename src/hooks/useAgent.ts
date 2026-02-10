import { useState, useEffect } from "react";
import { Address } from "viem";

export interface AgentData {
    tokenId: string;
    nfaAddress: string;
    owner: string;
    name: string;
    description: string;
    pricePerDay: string;
    minDays: number;
    status: "active" | "rented";
    renter: string;
    policy: {
        maxDeadlineWindow: number;
        maxPathLength: number;
        maxSwapAmountIn: string;
        maxApproveAmount: string;
        maxRepayAmount: string;
        allowedTokens: string[];
        allowedSpenders: string[];
    };
}

// Mock data store
const MOCK_AGENTS: Record<string, AgentData> = {
    "101": {
        tokenId: "101",
        nfaAddress: "0xMockNFA",
        owner: "0x1234567890abcdef1234567890abcdef12345678",
        name: "Swap Master Alpha",
        description: "High-frequency swap agent optimized for PancakeSwap V3.",
        pricePerDay: "0.05 BNB",
        minDays: 3,
        status: "active",
        renter: "0x0000000000000000000000000000000000000000",
        policy: {
            maxDeadlineWindow: 1200,
            maxPathLength: 3,
            maxSwapAmountIn: "1000 USDT",
            maxApproveAmount: "500 USDT",
            maxRepayAmount: "500 USDT",
            allowedTokens: ["0xUSDT", "0xWBNB"],
            allowedSpenders: ["0xRouter"]
        }
    },
    "102": {
        tokenId: "102",
        nfaAddress: "0xMockNFA",
        owner: "0xabcdef1234567890abcdef1234567890abcdef12",
        name: "DeFi Saver Pro",
        description: "Automated repayment agent for Venus Protocol.",
        pricePerDay: "0.08 BNB",
        minDays: 7,
        status: "active",
        renter: "0x0000000000000000000000000000000000000000",
        policy: {
            maxDeadlineWindow: 3600,
            maxPathLength: 2,
            maxSwapAmountIn: "5000 USDT",
            maxApproveAmount: "2000 USDT",
            maxRepayAmount: "2000 USDT",
            allowedTokens: ["0xUSDT", "0xBTC"],
            allowedSpenders: ["0xVenus"]
        }
    }
};

export function useAgent(nfa: string, tokenId: string) {
    // TODO: Replace with real contract reads using wagmi/viem
    // const { data } = useReadContract(...)

    const [data, setData] = useState<AgentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate network delay
        setTimeout(() => {
            setData(MOCK_AGENTS[tokenId] || null);
            setIsLoading(false);
        }, 500);
    }, [tokenId]);

    return { data, isLoading };
}
