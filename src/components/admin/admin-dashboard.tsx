"use client";

import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, V4_ABI } from "@/config/contracts";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useCallback } from "react";
import {
    Database, Layers, UserCog, ChevronRight, ChevronLeft, Check,
    Loader2, AlertTriangle, Copy, ExternalLink,
} from "lucide-react";
import { formatEther, parseEther, keccak256, toHex, encodePacked } from "viem";

// ─── Shared helpers ────────────────────────────────────────

const POLICY_GUARD_V4 = getRuntimeEnv("NEXT_PUBLIC_POLICY_GUARD_V3", "") as `0x${string}`;
const EXPLORER = getRuntimeEnv("NEXT_PUBLIC_EXPLORER_TX_BASE_URL", "https://testnet.bscscan.com/tx");

function TxButton({ onClick, disabled, loading, children }: {
    onClick: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {children}
        </button>
    );
}

function TxStatus({ hash, label }: { hash?: `0x${string}`; label: string }) {
    const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({ hash });
    if (!hash) return null;
    return (
        <div className={`mt-2 rounded-lg border p-3 text-sm ${isSuccess ? "border-green-500/30 bg-green-500/5" : isError ? "border-red-500/30 bg-red-500/5" : "border-blue-500/30 bg-blue-500/5"}`}>
            <div className="flex items-center gap-2">
                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                {isSuccess && <Check className="h-3 w-3 text-green-500" />}
                {isError && <AlertTriangle className="h-3 w-3 text-red-500" />}
                <span className="font-medium">{label}</span>
            </div>
            <a href={`${EXPLORER}/${hash}`} target="_blank" rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1 font-mono text-xs text-blue-500 hover:underline break-all">
                {hash.slice(0, 10)}...{hash.slice(-8)} <ExternalLink className="h-3 w-3" />
            </a>
        </div>
    );
}

function copyText(text: string) {
    navigator.clipboard.writeText(text);
}

// ── Contract Overview (V4) ────────────────────────────────

function ContractOverview() {
    const nfaAddr = CONTRACTS.AgentNFA.address;
    const lmAddr = CONTRACTS.ListingManager.address;

    const { data: nfaOwner } = useReadContract({ address: nfaAddr, abi: V4_ABI.AgentNFA_V31, functionName: "owner" });
    const { data: lmOwner } = useReadContract({ address: lmAddr, abi: V4_ABI.ListingManager_V4, functionName: "owner" });
    const { data: guardOwner } = useReadContract({ address: POLICY_GUARD_V4, abi: V4_ABI.PolicyGuardV4, functionName: "owner" });
    const { data: totalSupply } = useReadContract({ address: nfaAddr, abi: V4_ABI.AgentNFA_V31, functionName: "totalSupply" });
    const { data: listingCount } = useReadContract({ address: lmAddr, abi: V4_ABI.ListingManager_V4, functionName: "getListingCount" });

    const contracts = [
        { name: "AgentNFA", address: nfaAddr, owner: nfaOwner as string },
        { name: "PolicyGuardV4", address: POLICY_GUARD_V4, owner: guardOwner as string },
        { name: "ListingManager", address: lmAddr, owner: lmOwner as string },
    ];

    return (
        <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><Database className="h-4 w-4" /> Contract Overview (V4)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="py-2 text-left font-medium text-[var(--color-muted-foreground)]">Contract</th>
                                <th className="py-2 text-left font-medium text-[var(--color-muted-foreground)]">Address</th>
                                <th className="py-2 text-left font-medium text-[var(--color-muted-foreground)]">Owner</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map((c) => (
                                <tr key={c.name} className="border-b border-[var(--color-border)]/50">
                                    <td className="py-2 font-medium">{c.name}</td>
                                    <td className="py-2">
                                        <button onClick={() => copyText(c.address)} className="flex items-center gap-1 font-mono text-sm break-all hover:text-blue-500">
                                            {c.address?.slice(0, 10)}...{c.address?.slice(-6)} <Copy className="h-3 w-3 opacity-50" />
                                        </button>
                                    </td>
                                    <td className="py-2 font-mono text-sm break-all">{(c.owner as string)?.slice(0, 10)}...{(c.owner as string)?.slice(-6) ?? "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 flex gap-6 text-sm text-[var(--color-muted-foreground)]">
                    <span>NFA Supply: <span className="font-mono font-semibold text-[var(--color-foreground)]">{totalSupply != null ? totalSupply.toString() : "—"}</span></span>
                    <span>Listings: <span className="font-mono font-semibold text-[var(--color-foreground)]">{listingCount != null ? listingCount.toString() : "—"}</span></span>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Template Manager Wizard ───────────────────────────────

const AGENT_TYPES = [
    { label: "LLM Trader", value: "llm_trader", key: "llm_trader_v3" },
    { label: "LLM DeFi", value: "llm_defi", key: "llm_defi_v3" },
    { label: "Hot Token", value: "hot_token", key: "hot_token_v3" },
];

function TemplateManager() {
    const { address } = useAccount();
    const [step, setStep] = useState(0);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

    // State across steps
    const [agentName, setAgentName] = useState("LLM Trader Agent");
    const [agentDesc, setAgentDesc] = useState("AI-powered autonomous trading agent");
    const [agentTypeIdx, setAgentTypeIdx] = useState(0);
    const [mintedTokenId, setMintedTokenId] = useState("");
    const [templateKey, setTemplateKey] = useState("");

    // Policy addresses (manually entered)
    const [policyAddresses, setPolicyAddresses] = useState<string[]>([]);
    const [newPolicyAddr, setNewPolicyAddr] = useState("");

    // Ceiling
    const [maxPerTx, setMaxPerTx] = useState("10");
    const [maxPerDay, setMaxPerDay] = useState("50");
    const [maxSlippage, setMaxSlippage] = useState("500");
    const [spendingLimitAddr, setSpendingLimitAddr] = useState("");

    // Token whitelist
    const [tokenAddresses, setTokenAddresses] = useState<string[]>([]);
    const [newTokenAddr, setNewTokenAddr] = useState("");
    const [tokenWlAddr, setTokenWlAddr] = useState("");

    // DEX whitelist
    const [dexAddresses, setDexAddresses] = useState<string[]>([]);
    const [newDexAddr, setNewDexAddr] = useState("");
    const [dexWlAddr, setDexWlAddr] = useState("");

    // Cooldown
    const [cooldownSecs, setCooldownSecs] = useState("60");
    const [cooldownAddr, setCooldownAddr] = useState("");

    // Listing
    const [listingPrice, setListingPrice] = useState("0.005");
    const [minDays, setMinDays] = useState("1");

    const { writeContract, isPending } = useWriteContract({
        mutation: {
            onSuccess: (hash) => setTxHash(hash),
        },
    });

    const nfaAddr = CONTRACTS.AgentNFA.address;
    const lmAddr = CONTRACTS.ListingManager.address;
    const selectedType = AGENT_TYPES[agentTypeIdx]!;

    // Step handlers
    const handleMint = useCallback(() => {
        if (!address) return;
        const persona = JSON.stringify({ name: agentName, description: agentDesc });
        writeContract({
            address: nfaAddr,
            abi: V4_ABI.AgentNFA_V31,
            functionName: "mintAgent",
            args: [
                address,
                toHex(1, { size: 32 }),
                keccak256(toHex(selectedType.value)),
                `https://api.shll.run/api/metadata/${mintedTokenId || "0"}`,
                { persona, experience: "Template", voiceHash: "", animationURI: "", vaultURI: "", vaultHash: toHex(0, { size: 32 }) },
            ],
        });
    }, [address, agentName, agentDesc, selectedType, mintedTokenId, nfaAddr, writeContract]);

    const handleRegister = useCallback(() => {
        if (!mintedTokenId) return;
        const key = keccak256(toHex(selectedType.key));
        setTemplateKey(key);
        writeContract({
            address: nfaAddr,
            abi: V4_ABI.AgentNFA_V31,
            functionName: "registerTemplate",
            args: [BigInt(mintedTokenId), key, `${selectedType.value}-v3`],
        });
    }, [mintedTokenId, selectedType, nfaAddr, writeContract]);

    const handleAddPolicy = useCallback((policyAddr: string) => {
        if (!templateKey) return;
        writeContract({
            address: POLICY_GUARD_V4,
            abi: V4_ABI.PolicyGuardV4,
            functionName: "addTemplatePolicy",
            args: [templateKey as `0x${string}`, policyAddr as `0x${string}`],
        });
        setPolicyAddresses((prev) => [...prev, policyAddr]);
    }, [templateKey, writeContract]);

    const handleSetCeiling = useCallback(() => {
        if (!templateKey || !spendingLimitAddr) return;
        writeContract({
            address: spendingLimitAddr as `0x${string}`,
            abi: V4_ABI.SpendingLimitPolicy,
            functionName: "setTemplateCeiling",
            args: [templateKey as `0x${string}`, parseEther(maxPerTx), parseEther(maxPerDay), BigInt(maxSlippage)],
        });
    }, [templateKey, spendingLimitAddr, maxPerTx, maxPerDay, maxSlippage, writeContract]);

    const handleAddToken = useCallback((token: string) => {
        if (!mintedTokenId || !tokenWlAddr) return;
        writeContract({
            address: tokenWlAddr as `0x${string}`,
            abi: V4_ABI.TokenWhitelistPolicy,
            functionName: "addToken",
            args: [BigInt(mintedTokenId), token as `0x${string}`],
        });
        setTokenAddresses((prev) => [...prev, token]);
    }, [mintedTokenId, tokenWlAddr, writeContract]);

    const handleAddDex = useCallback((dex: string) => {
        if (!mintedTokenId || !dexWlAddr) return;
        writeContract({
            address: dexWlAddr as `0x${string}`,
            abi: V4_ABI.DexWhitelistPolicy,
            functionName: "addDex",
            args: [BigInt(mintedTokenId), dex as `0x${string}`],
        });
        setDexAddresses((prev) => [...prev, dex]);
    }, [mintedTokenId, dexWlAddr, writeContract]);

    const handleSetCooldown = useCallback(() => {
        if (!mintedTokenId || !cooldownAddr) return;
        writeContract({
            address: cooldownAddr as `0x${string}`,
            abi: V4_ABI.CooldownPolicy,
            functionName: "setCooldown",
            args: [BigInt(mintedTokenId), BigInt(cooldownSecs)],
        });
    }, [mintedTokenId, cooldownAddr, cooldownSecs, writeContract]);

    const handleApproveListingManager = useCallback(() => {
        if (!mintedTokenId) return;
        writeContract({
            address: nfaAddr,
            abi: CONTRACTS.AgentNFA.abi,
            functionName: "approve",
            args: [lmAddr, BigInt(mintedTokenId)],
        });
    }, [mintedTokenId, nfaAddr, lmAddr, writeContract]);

    const handleCreateListing = useCallback(() => {
        if (!mintedTokenId) return;
        writeContract({
            address: lmAddr,
            abi: V4_ABI.ListingManager_V4,
            functionName: "createTemplateListing",
            args: [nfaAddr, BigInt(mintedTokenId), parseEther(listingPrice), Number(minDays)],
        });
    }, [mintedTokenId, nfaAddr, lmAddr, listingPrice, minDays, writeContract]);

    const steps = [
        { label: "Agent Type", icon: "1" },
        { label: "Mint", icon: "2" },
        { label: "Register", icon: "3" },
        { label: "Policies", icon: "4" },
        { label: "Ceiling", icon: "5" },
        { label: "Whitelist", icon: "6" },
        { label: "Cooldown", icon: "7" },
        { label: "List", icon: "8" },
    ];

    return (
        <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <Layers className="h-4 w-4" /> Template Manager
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Step indicator */}
                <div className="mb-6 flex items-center gap-1 overflow-x-auto pb-2">
                    {steps.map((s, i) => (
                        <div key={i} className="flex items-center gap-1">
                            <button
                                onClick={() => setStep(i)}
                                className={`flex h-7 min-w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${i === step ? "bg-blue-600 text-white shadow-md" : i < step ? "bg-green-600 text-white" : "bg-[var(--color-muted)]/50 text-[var(--color-muted-foreground)]"}`}
                            >
                                {i < step ? <Check className="h-3 w-3" /> : s.icon}
                            </button>
                            <span className={`hidden text-xs sm:inline ${i === step ? "font-semibold text-[var(--color-foreground)]" : "text-[var(--color-muted-foreground)]"}`}>{s.label}</span>
                            {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-[var(--color-muted-foreground)]" />}
                        </div>
                    ))}
                </div>

                {/* Step 0: Agent Type */}
                {step === 0 && (
                    <div className="grid gap-4">
                        <div>
                            <Label className="text-sm font-medium">Agent Type</Label>
                            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {AGENT_TYPES.map((t, i) => (
                                    <button key={t.value} onClick={() => setAgentTypeIdx(i)}
                                        className={`rounded-lg border p-3 text-center text-sm font-medium transition-all ${i === agentTypeIdx ? "border-blue-500 bg-blue-500/10 text-blue-600" : "border-[var(--color-border)] hover:border-blue-300"}`}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div><Label className="text-sm">Agent Name</Label><Input value={agentName} onChange={(e) => setAgentName(e.target.value)} className="mt-1" /></div>
                        <div><Label className="text-sm">Description</Label><Input value={agentDesc} onChange={(e) => setAgentDesc(e.target.value)} className="mt-1" /></div>
                        <TxButton onClick={() => setStep(1)}>Next: Mint Agent <ChevronRight className="h-4 w-4" /></TxButton>
                    </div>
                )}

                {/* Step 1: Mint */}
                {step === 1 && (
                    <div className="grid gap-4">
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/20 p-4">
                            <div className="text-sm"><span className="font-medium">Type:</span> {selectedType.label}</div>
                            <div className="text-sm"><span className="font-medium">Name:</span> {agentName}</div>
                            <div className="text-sm text-[var(--color-muted-foreground)]">{agentDesc}</div>
                        </div>
                        <TxButton onClick={handleMint} loading={isPending}>Mint Template Agent</TxButton>
                        <TxStatus hash={txHash} label="Mint Agent" />
                        <div>
                            <Label className="text-sm">Minted Token ID (from tx receipt)</Label>
                            <Input value={mintedTokenId} onChange={(e) => setMintedTokenId(e.target.value)} placeholder="e.g. 0" className="mt-1 font-mono" />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setStep(0)} className="flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"><ChevronLeft className="h-3 w-3" /> Back</button>
                            <TxButton onClick={() => setStep(2)} disabled={!mintedTokenId}>Next: Register <ChevronRight className="h-4 w-4" /></TxButton>
                        </div>
                    </div>
                )}

                {/* Step 2: Register Template */}
                {step === 2 && (
                    <div className="grid gap-4">
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/20 p-3 text-sm">
                            Token ID: <span className="font-mono font-semibold">{mintedTokenId}</span> | Template Key: <span className="font-mono text-xs">{selectedType.key}</span>
                        </div>
                        <TxButton onClick={handleRegister} loading={isPending}>Register as Template</TxButton>
                        <TxStatus hash={txHash} label="Register Template" />
                        <div className="flex gap-2">
                            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"><ChevronLeft className="h-3 w-3" /> Back</button>
                            <TxButton onClick={() => setStep(3)}>Next: Attach Policies <ChevronRight className="h-4 w-4" /></TxButton>
                        </div>
                    </div>
                )}

                {/* Step 3: Attach Policies */}
                {step === 3 && (
                    <div className="grid gap-4">
                        <p className="text-sm text-[var(--color-muted-foreground)]">Add policy contract addresses to attach to this template. Each requires a separate transaction.</p>
                        <div className="flex gap-2">
                            <Input value={newPolicyAddr} onChange={(e) => setNewPolicyAddr(e.target.value)} placeholder="Policy contract address (0x...)" className="font-mono text-sm" />
                            <TxButton onClick={() => { handleAddPolicy(newPolicyAddr); setNewPolicyAddr(""); }} loading={isPending} disabled={!/^0x[a-fA-F0-9]{40}$/.test(newPolicyAddr)}>Add</TxButton>
                        </div>
                        {policyAddresses.length > 0 && (
                            <div className="rounded-lg bg-[var(--color-muted)]/20 p-3 text-sm">
                                <div className="font-medium mb-1">Attached ({policyAddresses.length}):</div>
                                {policyAddresses.map((p, i) => <div key={i} className="font-mono text-xs text-[var(--color-muted-foreground)]">{p}</div>)}
                            </div>
                        )}
                        <TxStatus hash={txHash} label="Add Policy" />
                        <div className="flex gap-2">
                            <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"><ChevronLeft className="h-3 w-3" /> Back</button>
                            <TxButton onClick={() => setStep(4)}>Next: Set Ceiling <ChevronRight className="h-4 w-4" /></TxButton>
                        </div>
                    </div>
                )}

                {/* Step 4: Ceiling */}
                {step === 4 && (
                    <div className="grid gap-4">
                        <div><Label className="text-sm">SpendingLimitPolicy Address</Label><Input value={spendingLimitAddr} onChange={(e) => setSpendingLimitAddr(e.target.value)} placeholder="0x..." className="mt-1 font-mono text-sm" /></div>
                        <div className="grid grid-cols-3 gap-3">
                            <div><Label className="text-sm">Max / Tx (BNB)</Label><Input value={maxPerTx} onChange={(e) => setMaxPerTx(e.target.value)} className="mt-1" /></div>
                            <div><Label className="text-sm">Max / Day (BNB)</Label><Input value={maxPerDay} onChange={(e) => setMaxPerDay(e.target.value)} className="mt-1" /></div>
                            <div><Label className="text-sm">Max Slippage (bps)</Label><Input value={maxSlippage} onChange={(e) => setMaxSlippage(e.target.value)} className="mt-1" /></div>
                        </div>
                        <TxButton onClick={handleSetCeiling} loading={isPending} disabled={!spendingLimitAddr}>Set Ceiling</TxButton>
                        <TxStatus hash={txHash} label="Set Ceiling" />
                        <div className="flex gap-2">
                            <button onClick={() => setStep(3)} className="flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"><ChevronLeft className="h-3 w-3" /> Back</button>
                            <TxButton onClick={() => setStep(5)}>Next: Whitelist <ChevronRight className="h-4 w-4" /></TxButton>
                        </div>
                    </div>
                )}

                {/* Step 5: Token + DEX Whitelist */}
                {step === 5 && (
                    <div className="grid gap-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                            {/* Token Whitelist */}
                            <div className="rounded-lg border border-[var(--color-border)] p-3">
                                <div className="font-medium text-sm mb-2">Token Whitelist</div>
                                <div className="mb-2"><Label className="text-sm">TokenWhitelistPolicy Address</Label><Input value={tokenWlAddr} onChange={(e) => setTokenWlAddr(e.target.value)} placeholder="0x..." className="mt-1 font-mono text-sm" /></div>
                                <div className="flex gap-2 mb-2">
                                    <Input value={newTokenAddr} onChange={(e) => setNewTokenAddr(e.target.value)} placeholder="Token address" className="font-mono text-sm" />
                                    <TxButton onClick={() => { handleAddToken(newTokenAddr); setNewTokenAddr(""); }} loading={isPending} disabled={!tokenWlAddr || !/^0x/.test(newTokenAddr)}>Add</TxButton>
                                </div>
                                {tokenAddresses.map((t, i) => <div key={i} className="font-mono text-xs text-[var(--color-muted-foreground)]">{t}</div>)}
                            </div>
                            {/* DEX Whitelist */}
                            <div className="rounded-lg border border-[var(--color-border)] p-3">
                                <div className="font-medium text-sm mb-2">DEX Whitelist</div>
                                <div className="mb-2"><Label className="text-sm">DexWhitelistPolicy Address</Label><Input value={dexWlAddr} onChange={(e) => setDexWlAddr(e.target.value)} placeholder="0x..." className="mt-1 font-mono text-sm" /></div>
                                <div className="flex gap-2 mb-2">
                                    <Input value={newDexAddr} onChange={(e) => setNewDexAddr(e.target.value)} placeholder="DEX router address" className="font-mono text-sm" />
                                    <TxButton onClick={() => { handleAddDex(newDexAddr); setNewDexAddr(""); }} loading={isPending} disabled={!dexWlAddr || !/^0x/.test(newDexAddr)}>Add</TxButton>
                                </div>
                                {dexAddresses.map((d, i) => <div key={i} className="font-mono text-xs text-[var(--color-muted-foreground)]">{d}</div>)}
                            </div>
                        </div>
                        <TxStatus hash={txHash} label="Add Whitelist" />
                        <div className="flex gap-2">
                            <button onClick={() => setStep(4)} className="flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"><ChevronLeft className="h-3 w-3" /> Back</button>
                            <TxButton onClick={() => setStep(6)}>Next: Cooldown <ChevronRight className="h-4 w-4" /></TxButton>
                        </div>
                    </div>
                )}

                {/* Step 6: Cooldown */}
                {step === 6 && (
                    <div className="grid gap-4">
                        <div><Label className="text-sm">CooldownPolicy Address</Label><Input value={cooldownAddr} onChange={(e) => setCooldownAddr(e.target.value)} placeholder="0x..." className="mt-1 font-mono text-sm" /></div>
                        <div><Label className="text-sm">Cooldown (seconds)</Label><Input value={cooldownSecs} onChange={(e) => setCooldownSecs(e.target.value)} className="mt-1" /></div>
                        <TxButton onClick={handleSetCooldown} loading={isPending} disabled={!cooldownAddr}>Set Cooldown</TxButton>
                        <TxStatus hash={txHash} label="Set Cooldown" />
                        <div className="flex gap-2">
                            <button onClick={() => setStep(5)} className="flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"><ChevronLeft className="h-3 w-3" /> Back</button>
                            <TxButton onClick={() => setStep(7)}>Next: Create Listing <ChevronRight className="h-4 w-4" /></TxButton>
                        </div>
                    </div>
                )}

                {/* Step 7: Create Listing */}
                {step === 7 && (
                    <div className="grid gap-4">
                        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-sm">
                            <div className="font-semibold text-green-700 mb-2">Final Step — Create Marketplace Listing</div>
                            <div>Token ID: <span className="font-mono font-semibold">{mintedTokenId}</span></div>
                            <div>Type: {selectedType.label}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><Label className="text-sm">Price per Day (BNB)</Label><Input value={listingPrice} onChange={(e) => setListingPrice(e.target.value)} className="mt-1" /></div>
                            <div><Label className="text-sm">Min Days</Label><Input value={minDays} onChange={(e) => setMinDays(e.target.value)} className="mt-1" /></div>
                        </div>
                        <div className="flex gap-2">
                            <TxButton onClick={handleApproveListingManager} loading={isPending}>1. Approve NFA</TxButton>
                            <TxButton onClick={handleCreateListing} loading={isPending}>2. Create Listing</TxButton>
                        </div>
                        <TxStatus hash={txHash} label="Create Listing" />
                        <button onClick={() => setStep(6)} className="flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"><ChevronLeft className="h-3 w-3" /> Back</button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ── Operator Manager ──────────────────────────────────────

function OperatorManager() {
    const [tokenId, setTokenId] = useState("");
    const [operator, setOperator] = useState("");
    const [expiresHours, setExpiresHours] = useState("8760"); // 1 year
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

    const nfaAddr = CONTRACTS.AgentNFA.address;

    const { writeContract, isPending } = useWriteContract({
        mutation: { onSuccess: (hash) => setTxHash(hash) },
    });

    const handleSetOperator = useCallback(() => {
        const expires = BigInt(Math.floor(Date.now() / 1000) + Number(expiresHours) * 3600);
        writeContract({
            address: nfaAddr,
            abi: CONTRACTS.AgentNFA.abi,
            functionName: "setOperator",
            args: [BigInt(tokenId), operator as `0x${string}`, expires],
        });
    }, [tokenId, operator, expiresHours, nfaAddr, writeContract]);

    const handleClearOperator = useCallback(() => {
        writeContract({
            address: nfaAddr,
            abi: CONTRACTS.AgentNFA.abi,
            functionName: "clearOperator",
            args: [BigInt(tokenId)],
        });
    }, [tokenId, nfaAddr, writeContract]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><UserCog className="h-4 w-4" /> Operator Manager</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div className="grid grid-cols-3 gap-3">
                    <div><Label className="text-sm">Token ID</Label><Input value={tokenId} onChange={(e) => setTokenId(e.target.value)} className="mt-1" /></div>
                    <div className="col-span-2"><Label className="text-sm">Operator Address</Label><Input value={operator} onChange={(e) => setOperator(e.target.value)} placeholder="0x..." className="mt-1 font-mono text-sm" /></div>
                </div>
                <div><Label className="text-sm">Expire (hours from now)</Label><Input value={expiresHours} onChange={(e) => setExpiresHours(e.target.value)} className="mt-1" /></div>
                <div className="flex gap-2">
                    <TxButton onClick={handleSetOperator} loading={isPending} disabled={!tokenId || !operator}>Set Operator</TxButton>
                    <button onClick={handleClearOperator} disabled={!tokenId || isPending}
                        className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-500/10 disabled:opacity-50">
                        Clear Operator
                    </button>
                </div>
                <TxStatus hash={txHash} label="Operator Update" />
            </CardContent>
        </Card>
    );
}

// ── Main Dashboard Export ─────────────────────────────────

export function AdminDashboard() {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <ContractOverview />
            <TemplateManager />
            <OperatorManager />
        </div>
    );
}
