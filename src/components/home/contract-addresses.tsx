"use client";

import { ExternalLink, Shield, Copy, Check } from "lucide-react";
import { useState } from "react";
import { CHAIN_NAME, IS_MAINNET } from "@/config/wagmi";
import { getRuntimeEnv } from "@/lib/runtime-env";

const explorerBase = IS_MAINNET
    ? "https://bscscan.com/address/"
    : "https://testnet.bscscan.com/address/";

const defaultContracts = {
    mainnet: {
        agentNfa: "0x327ec0BEa2c632A7978e9735272edE710B0F9791",
        listingManager: "0x322E7b1DaefE32E3D25defEA731C6384425E5A9f",
        policyGuardV3: "0xe8828aB104a24114A8fB3AfA5BcfCc09a069B427",
    },
    testnet: {
        agentNfa: "0xbB5059ad07bBd2d10d2e67fF842ce2D5e55eCD82",
        listingManager: "0x58edca3cd175a3e306e9b16125fec75483681cf6",
        policyGuardV3: "0x31Bd83f2C3A41154F88296c145E36A64E32729A5",
    },
};

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-[var(--color-secondary)] transition-colors"
            title="Copy address"
        >
            {copied ? (
                <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            ) : (
                <Copy className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]" />
            )}
        </button>
    );
}

export function ContractAddresses() {
    const fallback = IS_MAINNET ? defaultContracts.mainnet : defaultContracts.testnet;
    const contracts = [
        {
            label: "AgentNFA (BAP-578)",
            desc: "Agent identity & on-chain wallet",
            address: getRuntimeEnv("NEXT_PUBLIC_AGENT_NFA", fallback.agentNfa),
        },
        {
            label: "ListingManager",
            desc: "Marketplace rental management",
            address: getRuntimeEnv("NEXT_PUBLIC_LISTING_MANAGER", fallback.listingManager),
        },
        {
            label: "PolicyGuard",
            desc: "Security policy enforcement",
            address: getRuntimeEnv("NEXT_PUBLIC_POLICY_GUARD_V3", fallback.policyGuardV3),
        },
    ];

    return (
        <section className="relative py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
                        <Shield className="w-4 h-4" />
                        Verified Smart Contracts
                    </div>
                    <h2 className="text-2xl font-bold !text-[#201a16]">
                        On-Chain Transparency
                    </h2>
                    <p className="!text-[#74685d] mt-2 text-sm">
                        All contracts are verified and deployed on <strong className="!text-[#201a16]">{CHAIN_NAME}</strong>
                    </p>
                </div>

                {/* Contract cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    {contracts.map((c) => (
                        <div
                            key={c.label}
                            className="rounded-xl border border-[#e1d3c0] bg-[#fffdf9] backdrop-blur-sm p-5 hover:border-[#7a1f37]/35 transition-colors"
                        >
                            <div className="text-sm font-semibold !text-[#201a16] mb-1">
                                {c.label}
                            </div>
                            <div className="text-xs !text-[#74685d] mb-3">
                                {c.desc}
                            </div>
                            <div className="flex items-center gap-1">
                                <code className="text-xs !text-[#7a1f37] font-mono truncate flex-1">
                                    {c.address}
                                </code>
                                <CopyButton text={c.address} />
                                <a
                                    href={`${explorerBase}${c.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded hover:bg-[var(--color-secondary)] transition-colors"
                                    title="View on explorer"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
