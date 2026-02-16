"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { CONTRACTS, ADMIN_ABI } from "@/config/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { ListPlus, ListMinus, RefreshCw, PauseCircle, Settings } from "lucide-react";
import { Address, parseEther } from "viem";

function useTxToast(hash: `0x${string}` | undefined, label: string) {
    const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({ hash });
    useEffect(() => {
        if (isSuccess) toast.success(`${label} confirmed`);
        if (isError) toast.error(`${label} failed`);
    }, [isSuccess, isError, label]);
    return { isLoading, isSuccess };
}

// ── List Agent ───────────────────────────
function ListAgentForm() {
    const [tokenId, setTokenId] = useState("");
    const [pricePerDay, setPricePerDay] = useState("0.01");
    const [minDays, setMinDays] = useState("1");
    const [isTemplate, setIsTemplate] = useState(true);
    const { data: hash, writeContract, isPending, error } = useWriteContract();
    useTxToast(hash, "List Agent");
    useEffect(() => { if (error) toast.error(error.message?.slice(0, 120)); }, [error]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><ListPlus className="h-4 w-4" /> List Agent</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div className="grid grid-cols-3 gap-3">
                    <div><Label className="text-xs">Token ID</Label><Input value={tokenId} onChange={e => setTokenId(e.target.value)} /></div>
                    <div><Label className="text-xs">Price / Day (BNB)</Label><Input value={pricePerDay} onChange={e => setPricePerDay(e.target.value)} /></div>
                    <div><Label className="text-xs">Min Days</Label><Input value={minDays} onChange={e => setMinDays(e.target.value)} /></div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isTemplate} onChange={e => setIsTemplate(e.target.checked)} />
                    Template Listing (mint instances)
                </label>
                <Button disabled={isPending} onClick={() => writeContract({
                    address: CONTRACTS.ListingManager.address,
                    abi: ADMIN_ABI.ListingManager,
                    functionName: "listAgent",
                    args: [
                        CONTRACTS.AgentNFA.address,
                        BigInt(tokenId || "0"),
                        parseEther(pricePerDay || "0"),
                        BigInt(minDays || "1"),
                        isTemplate,
                    ],
                })}>
                    {isPending ? "Sending..." : "List Agent"}
                </Button>
            </CardContent>
        </Card>
    );
}

// ── Update Listing ───────────────────────
function UpdateListingForm() {
    const [listingId, setListingId] = useState("");
    const [pricePerDay, setPricePerDay] = useState("0.01");
    const [minDays, setMinDays] = useState("1");
    const { data: hash, writeContract, isPending, error } = useWriteContract();
    useTxToast(hash, "Update Listing");
    useEffect(() => { if (error) toast.error(error.message?.slice(0, 120)); }, [error]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><RefreshCw className="h-4 w-4" /> Update Listing</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div><Label className="text-xs">Listing ID (bytes32)</Label><Input value={listingId} onChange={e => setListingId(e.target.value)} className="font-mono text-xs" placeholder="0x..." /></div>
                <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Price / Day (BNB)</Label><Input value={pricePerDay} onChange={e => setPricePerDay(e.target.value)} /></div>
                    <div><Label className="text-xs">Min Days</Label><Input value={minDays} onChange={e => setMinDays(e.target.value)} /></div>
                </div>
                <Button disabled={isPending} onClick={() => writeContract({
                    address: CONTRACTS.ListingManager.address,
                    abi: ADMIN_ABI.ListingManager,
                    functionName: "updateListing",
                    args: [listingId as `0x${string}`, parseEther(pricePerDay || "0"), BigInt(minDays || "1")],
                })}>
                    {isPending ? "Sending..." : "Update"}
                </Button>
            </CardContent>
        </Card>
    );
}

// ── Delist Agent ─────────────────────────
function DelistForm() {
    const [listingId, setListingId] = useState("");
    const { data: hash, writeContract, isPending, error } = useWriteContract();
    useTxToast(hash, "Delist");
    useEffect(() => { if (error) toast.error(error.message?.slice(0, 120)); }, [error]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><ListMinus className="h-4 w-4" /> Delist Agent</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div><Label className="text-xs">Listing ID (bytes32)</Label><Input value={listingId} onChange={e => setListingId(e.target.value)} className="font-mono text-xs" placeholder="0x..." /></div>
                <Button variant="destructive" disabled={isPending} onClick={() => writeContract({
                    address: CONTRACTS.ListingManager.address,
                    abi: ADMIN_ABI.ListingManager,
                    functionName: "delistAgent",
                    args: [listingId as `0x${string}`],
                })}>
                    {isPending ? "Sending..." : "Delist"}
                </Button>
            </CardContent>
        </Card>
    );
}

// ── Pause Renting ────────────────────────
function PauseRentingForm() {
    const [listingId, setListingId] = useState("");
    const { data: hash, writeContract, isPending, error } = useWriteContract();
    useTxToast(hash, "Pause Renting");
    useEffect(() => { if (error) toast.error(error.message?.slice(0, 120)); }, [error]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><PauseCircle className="h-4 w-4" /> Pause Renting</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div><Label className="text-xs">Listing ID (bytes32)</Label><Input value={listingId} onChange={e => setListingId(e.target.value)} className="font-mono text-xs" placeholder="0x..." /></div>
                <Button variant="destructive" disabled={isPending} onClick={() => writeContract({
                    address: CONTRACTS.ListingManager.address,
                    abi: ADMIN_ABI.ListingManager,
                    functionName: "pauseRenting",
                    args: [listingId as `0x${string}`],
                })}>
                    {isPending ? "Sending..." : "Pause Renting"}
                </Button>
            </CardContent>
        </Card>
    );
}

// ── Set InstanceConfig ───────────────────
function SetInstanceConfigForm() {
    const [addr, setAddr] = useState("");
    const { data: hash, writeContract, isPending, error } = useWriteContract();
    useTxToast(hash, "Set InstanceConfig");
    useEffect(() => { if (error) toast.error(error.message?.slice(0, 120)); }, [error]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><Settings className="h-4 w-4" /> Set InstanceConfig</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div><Label className="text-xs">InstanceConfig Address (PolicyGuardV3)</Label><Input value={addr} onChange={e => setAddr(e.target.value)} placeholder="0x..." /></div>
                <Button disabled={isPending} onClick={() => writeContract({
                    address: CONTRACTS.ListingManager.address,
                    abi: ADMIN_ABI.ListingManager,
                    functionName: "setInstanceConfig",
                    args: [addr as Address],
                })}>
                    {isPending ? "Sending..." : "Update InstanceConfig"}
                </Button>
            </CardContent>
        </Card>
    );
}

// ── Listing Manager Stats ────────────────
function LmStats() {
    const { data: owner } = useReadContract({
        address: CONTRACTS.ListingManager.address,
        abi: ADMIN_ABI.ListingManager,
        functionName: "owner",
    });

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><ListPlus className="h-4 w-4" /> Contract Info</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg bg-[var(--color-muted)]/30 p-3 text-sm space-y-1 font-mono">
                    <div>Owner: <span className="text-xs break-all">{owner as string ?? "—"}</span></div>
                    <div>Address: <span className="text-xs break-all">{CONTRACTS.ListingManager.address}</span></div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ListingManagerPanel() {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <ListAgentForm />
            <LmStats />
            <UpdateListingForm />
            <DelistForm />
            <PauseRentingForm />
            <SetInstanceConfigForm />
        </div>
    );
}
