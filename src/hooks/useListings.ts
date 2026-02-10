import { AgentListing } from "@/components/business/agent-card";

export const MOCK_LISTINGS: AgentListing[] = [
    {
        tokenId: "101",
        nfaAddress: "0xMockNFA",
        listingId: "0x1",
        owner: "0x1234567890abcdef1234567890abcdef12345678",
        pricePerDay: "0.01 BNB",
        minDays: 3,
        active: true,
        capabilities: ["swap"],
        metadata: { name: "Swap Master Alpha" }
    },
    {
        tokenId: "102",
        nfaAddress: "0xMockNFA",
        listingId: "0x2",
        owner: "0xabcdef1234567890abcdef1234567890abcdef12",
        pricePerDay: "0.01 BNB",
        minDays: 7,
        active: true,
        capabilities: ["swap", "repay"],
        metadata: { name: "DeFi Saver Pro" }
    },
    {
        tokenId: "103",
        nfaAddress: "0xMockNFA",
        listingId: "0x3",
        owner: "0x9876543210fedcba9876543210fedcba98765432",
        pricePerDay: "0.002 BNB",
        minDays: 1,
        active: true,
        capabilities: ["repay"],
        metadata: { name: "Liquidation Shield" }
    },
];

export function useListings() {
    // TODO: Replace with real contract read
    return {
        data: MOCK_LISTINGS,
        isLoading: false,
        error: null
    };
}
