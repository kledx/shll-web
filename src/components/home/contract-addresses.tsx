"use client";

import { ExternalLink, Shield, Copy, Check } from "lucide-react";
import { useState } from "react";
import { CONTRACTS } from "@/config/contracts";
import { CHAIN_NAME, IS_MAINNET } from "@/config/wagmi";

const explorerBase = IS_MAINNET
    ? "https://bscscan.com/address/"
    : "https://testnet.bscscan.com/address/";

const contracts = [
    {
        label: "AgentNFA (BAP-578)",
        desc: "Agent identity & on-chain wallet",
        address: CONTRACTS.AgentNFA.address,
    },
    {
        label: "ListingManager",
        desc: "Marketplace rental management",
        address: CONTRACTS.ListingManager.address,
    },
    {
        label: "PolicyGuard",
        desc: "Security policy enforcement",
        address: CONTRACTS.PolicyGuardV3.address,
    },
];

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
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="Copy address"
        >
            {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
                <Copy className="w-3.5 h-3.5 text-white/40 hover:text-white/70" />
            )}
        </button>
    );
}

export function ContractAddresses() {
    return (
        <section className="relative py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
                        <Shield className="w-4 h-4" />
                        Verified Smart Contracts
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        On-Chain Transparency
                    </h2>
                    <p className="text-white/50 mt-2 text-sm">
                        All contracts are verified and deployed on <strong className="text-white/70">{CHAIN_NAME}</strong>
                    </p>
                </div>

                {/* Contract cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    {contracts.map((c) => (
                        <div
                            key={c.label}
                            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:border-emerald-500/30 transition-colors"
                        >
                            <div className="text-sm font-semibold text-white mb-1">
                                {c.label}
                            </div>
                            <div className="text-xs text-white/40 mb-3">
                                {c.desc}
                            </div>
                            <div className="flex items-center gap-1">
                                <code className="text-xs text-emerald-400/80 font-mono truncate flex-1">
                                    {c.address}
                                </code>
                                <CopyButton text={c.address} />
                                <a
                                    href={`${explorerBase}${c.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded hover:bg-white/10 transition-colors"
                                    title="View on explorer"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-white/40 hover:text-white/70" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
