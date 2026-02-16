"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { CONTRACTS, ADMIN_ABI } from "@/config/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Bot, Pause, Play, LayoutTemplate, Settings } from "lucide-react";
import { Address } from "viem";

function useTxToast(hash: `0x${string}` | undefined, label: string) {
    const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({ hash });
    useEffect(() => {
        if (isSuccess) toast.success(`${label} confirmed`);
        if (isError) toast.error(`${label} failed`);
    }, [isSuccess, isError, label]);
    return { isLoading, isSuccess };
}

// ── Register Template ────────────────────
function RegisterTemplateForm() {
    const [tokenId, setTokenId] = useState("");
    const [policyId, setPolicyId] = useState("0x0000000000000000000000000000000000000000000000000000000000000001");
    const { data: hash, writeContract, isPending, error } = useWriteContract();
    useTxToast(hash, "Register Template");
    useEffect(() => { if (error) toast.error(error.message?.slice(0, 120)); }, [error]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><LayoutTemplate className="h-4 w-4" /> Register Template</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Token ID</Label><Input value={tokenId} onChange={e => setTokenId(e.target.value)} /></div>
                    <div><Label className="text-xs">Policy ID (bytes32)</Label><Input value={policyId} onChange={e => setPolicyId(e.target.value)} className="font-mono text-xs" /></div>
                </div>
                <Button disabled={isPending} onClick={() => writeContract({
                    address: CONTRACTS.AgentNFA.address,
                    abi: ADMIN_ABI.AgentNFA,
                    functionName: "registerTemplate",
                    args: [BigInt(tokenId || "0"), policyId as `0x${string}`],
                })}>
                    {isPending ? "Sending..." : "Register as Template"}
                </Button>
            </CardContent>
        </Card>
    );
}

// ── Pause / Unpause Agent ────────────────
function PauseAgentForm() {
    const [tokenId, setTokenId] = useState("");
    const { data: hash1, writeContract: write1, isPending: p1 } = useWriteContract();
    const { data: hash2, writeContract: write2, isPending: p2 } = useWriteContract();
    useTxToast(hash1, "Pause Agent");
    useTxToast(hash2, "Unpause Agent");

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><Pause className="h-4 w-4" /> Agent Pause Control</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div><Label className="text-xs">Token ID</Label><Input value={tokenId} onChange={e => setTokenId(e.target.value)} /></div>
                <div className="flex gap-2">
                    <Button variant="destructive" disabled={p1} onClick={() => write1({
                        address: CONTRACTS.AgentNFA.address,
                        abi: ADMIN_ABI.AgentNFA,
                        functionName: "pauseAgent",
                        args: [BigInt(tokenId || "0")],
                    })}>Pause</Button>
                    <Button variant="outline" disabled={p2} onClick={() => write2({
                        address: CONTRACTS.AgentNFA.address,
                        abi: ADMIN_ABI.AgentNFA,
                        functionName: "unpauseAgent",
                        args: [BigInt(tokenId || "0")],
                    })}>Unpause</Button>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Global Pause ─────────────────────────
function GlobalPauseForm() {
    const { data: hash1, writeContract: write1, isPending: p1 } = useWriteContract();
    const { data: hash2, writeContract: write2, isPending: p2 } = useWriteContract();
    useTxToast(hash1, "Global Pause");
    useTxToast(hash2, "Global Unpause");

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><Play className="h-4 w-4" /> Global Pause</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-[var(--color-muted-foreground)] mb-3">Emergency pause/unpause all minting and transfers.</p>
                <div className="flex gap-2">
                    <Button variant="destructive" disabled={p1} onClick={() => write1({
                        address: CONTRACTS.AgentNFA.address,
                        abi: ADMIN_ABI.AgentNFA,
                        functionName: "pause",
                    })}>Pause All</Button>
                    <Button variant="outline" disabled={p2} onClick={() => write2({
                        address: CONTRACTS.AgentNFA.address,
                        abi: ADMIN_ABI.AgentNFA,
                        functionName: "unpause",
                    })}>Unpause All</Button>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Set Manager / PolicyGuard ────────────
function SetContractForm({ label, fnName }: { label: string; fnName: "setListingManager" | "setPolicyGuard" }) {
    const [addr, setAddr] = useState("");
    const { data: hash, writeContract, isPending, error } = useWriteContract();
    useTxToast(hash, `Set ${label}`);
    useEffect(() => { if (error) toast.error(error.message?.slice(0, 120)); }, [error]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><Settings className="h-4 w-4" /> Set {label}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div><Label className="text-xs">{label} Address</Label><Input value={addr} onChange={e => setAddr(e.target.value)} placeholder="0x..." /></div>
                <Button disabled={isPending} onClick={() => writeContract({
                    address: CONTRACTS.AgentNFA.address,
                    abi: ADMIN_ABI.AgentNFA,
                    functionName: fnName,
                    args: [addr as Address],
                })}>
                    {isPending ? "Sending..." : `Update ${label}`}
                </Button>
            </CardContent>
        </Card>
    );
}

// ── NFA Stats ────────────────────────────
function NfaStats() {
    const { data: owner } = useReadContract({
        address: CONTRACTS.AgentNFA.address,
        abi: ADMIN_ABI.AgentNFA,
        functionName: "owner",
    });
    const { data: totalSupply } = useReadContract({
        address: CONTRACTS.AgentNFA.address,
        abi: ADMIN_ABI.AgentNFA,
        functionName: "totalSupply",
    });

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><Bot className="h-4 w-4" /> NFA Stats</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg bg-[var(--color-muted)]/30 p-3 text-sm space-y-1 font-mono">
                    <div>Owner: <span className="text-xs break-all">{owner as string ?? "—"}</span></div>
                    <div>Total Supply: {totalSupply != null ? totalSupply.toString() : "—"}</div>
                    <div>Address: <span className="text-xs break-all">{CONTRACTS.AgentNFA.address}</span></div>
                </div>
            </CardContent>
        </Card>
    );
}

export function NfaManager() {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <RegisterTemplateForm />
            <NfaStats />
            <PauseAgentForm />
            <GlobalPauseForm />
            <SetContractForm label="ListingManager" fnName="setListingManager" />
            <SetContractForm label="PolicyGuard" fnName="setPolicyGuard" />
        </div>
    );
}
