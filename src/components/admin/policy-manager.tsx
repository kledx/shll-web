"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { CONTRACTS, ADMIN_ABI } from "@/config/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Shield, Plus, Lock, Users, Ban, Key } from "lucide-react";
import { Address, parseEther } from "viem";

function useTxToast(hash: `0x${string}` | undefined, label: string) {
    const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({ hash });
    useEffect(() => {
        if (isSuccess) toast.success(`${label} confirmed`);
        if (isError) toast.error(`${label} failed`);
    }, [isSuccess, isError, label]);
    return { isLoading, isSuccess };
}

// ── CreatePolicy ─────────────────────────
function CreatePolicyForm() {
    const [policyId, setPolicyId] = useState("1");
    const [version, setVersion] = useState("1");
    const [maxSlippage, setMaxSlippage] = useState("500");
    const [maxTrade, setMaxTrade] = useState("0.5");
    const [maxDaily, setMaxDaily] = useState("2");
    const [modules, setModules] = useState("15");
    const [allowExplorer, setAllowExplorer] = useState(false);
    const [explorerMaxTrade, setExplorerMaxTrade] = useState("1");
    const [explorerMaxDaily, setExplorerMaxDaily] = useState("5");
    const [allowUpdate, setAllowUpdate] = useState(true);

    const { data: hash, writeContract, isPending, error } = useWriteContract();
    useTxToast(hash, "Create Policy");

    useEffect(() => { if (error) toast.error(error.message?.slice(0, 120)); }, [error]);

    const submit = () => {
        writeContract({
            address: CONTRACTS.PolicyGuardV3.address,
            abi: ADMIN_ABI.PolicyGuardV3,
            functionName: "createPolicy",
            args: [
                Number(policyId),
                Number(version),
                {
                    maxSlippageBps: Number(maxSlippage),
                    maxTradeLimit: parseEther(maxTrade),
                    maxDailyLimit: parseEther(maxDaily),
                    allowedTokenGroups: [1],
                    allowedDexGroups: [1],
                    receiverMustBeVault: false,
                    forbidInfiniteApprove: true,
                    allowExplorerMode: allowExplorer,
                    explorerMaxTradeLimit: parseEther(explorerMaxTrade),
                    explorerMaxDailyLimit: parseEther(explorerMaxDaily),
                    allowParamsUpdate: allowUpdate,
                },
                BigInt(modules),
            ],
        });
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <Plus className="h-4 w-4" /> Create / Update Policy
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div className="grid grid-cols-3 gap-3">
                    <div><Label className="text-sm">Policy ID</Label><Input value={policyId} onChange={e => setPolicyId(e.target.value)} /></div>
                    <div><Label className="text-sm">Version</Label><Input value={version} onChange={e => setVersion(e.target.value)} /></div>
                    <div><Label className="text-sm">Modules (bitmask)</Label><Input value={modules} onChange={e => setModules(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div><Label className="text-sm">Max Slippage (bps)</Label><Input value={maxSlippage} onChange={e => setMaxSlippage(e.target.value)} /></div>
                    <div><Label className="text-sm">Max Trade (BNB)</Label><Input value={maxTrade} onChange={e => setMaxTrade(e.target.value)} /></div>
                    <div><Label className="text-sm">Max Daily (BNB)</Label><Input value={maxDaily} onChange={e => setMaxDaily(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3 items-end">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={allowExplorer} onChange={e => setAllowExplorer(e.target.checked)} />
                        Explorer Mode
                    </label>
                    <div><Label className="text-sm">Explorer Trade (BNB)</Label><Input value={explorerMaxTrade} onChange={e => setExplorerMaxTrade(e.target.value)} /></div>
                    <div><Label className="text-sm">Explorer Daily (BNB)</Label><Input value={explorerMaxDaily} onChange={e => setExplorerMaxDaily(e.target.value)} /></div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={allowUpdate} onChange={e => setAllowUpdate(e.target.checked)} />
                    Allow Params Update
                </label>
                <Button onClick={submit} disabled={isPending} className="w-full">
                    {isPending ? "Sending..." : "Create Policy"}
                </Button>
            </CardContent>
        </Card>
    );
}

// ── FreezePolicy ─────────────────────────
function FreezePolicyForm() {
    const [policyId, setPolicyId] = useState("1");
    const [version, setVersion] = useState("1");
    const { data: hash, writeContract, isPending, error } = useWriteContract();
    useTxToast(hash, "Freeze Policy");
    useEffect(() => { if (error) toast.error(error.message?.slice(0, 120)); }, [error]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><Lock className="h-4 w-4" /> Freeze Policy</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-sm">Policy ID</Label><Input value={policyId} onChange={e => setPolicyId(e.target.value)} /></div>
                    <div><Label className="text-sm">Version</Label><Input value={version} onChange={e => setVersion(e.target.value)} /></div>
                </div>
                <Button variant="destructive" onClick={() => writeContract({
                    address: CONTRACTS.PolicyGuardV3.address,
                    abi: ADMIN_ABI.PolicyGuardV3,
                    functionName: "freezePolicy",
                    args: [Number(policyId), Number(version)],
                })} disabled={isPending}>
                    {isPending ? "Freezing..." : "Freeze (Irreversible)"}
                </Button>
            </CardContent>
        </Card>
    );
}

// ── Group Members ────────────────────────
function GroupMembersForm() {
    const [groupId, setGroupId] = useState("1");
    const [addresses, setAddresses] = useState("");
    const [adding, setAdding] = useState(true);
    const { data: hash, writeContract, isPending, error } = useWriteContract();
    useTxToast(hash, "Group Members");
    useEffect(() => { if (error) toast.error(error.message?.slice(0, 120)); }, [error]);

    const submit = () => {
        const addrs = addresses.split(/[\n,]+/).map(a => a.trim()).filter(Boolean) as Address[];
        if (!addrs.length) return toast.error("No addresses");
        writeContract({
            address: CONTRACTS.PolicyGuardV3.address,
            abi: ADMIN_ABI.PolicyGuardV3,
            functionName: "setGroupMembers",
            args: [Number(groupId), addrs, adding],
        });
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" /> Group Members</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-sm">Group ID</Label><Input value={groupId} onChange={e => setGroupId(e.target.value)} /></div>
                    <div className="flex items-end gap-2">
                        <Button variant={adding ? "default" : "outline"} size="sm" onClick={() => setAdding(true)}>Add</Button>
                        <Button variant={!adding ? "destructive" : "outline"} size="sm" onClick={() => setAdding(false)}>Remove</Button>
                    </div>
                </div>
                <div>
                    <Label className="text-sm">Addresses (one per line or comma-separated)</Label>
                    <textarea
                        value={addresses}
                        onChange={e => setAddresses(e.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-mono"
                        placeholder="0x..."
                    />
                </div>
                <Button onClick={submit} disabled={isPending}>
                    {isPending ? "Sending..." : adding ? "Add to Group" : "Remove from Group"}
                </Button>
            </CardContent>
        </Card>
    );
}

// ── Block Target ─────────────────────────
function BlockTargetForm() {
    const [target, setTarget] = useState("");
    const [blocked, setBlocked] = useState(true);
    const { data: hash, writeContract, isPending, error } = useWriteContract();
    useTxToast(hash, "Target Block");
    useEffect(() => { if (error) toast.error(error.message?.slice(0, 120)); }, [error]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><Ban className="h-4 w-4" /> Block / Unblock Target</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div><Label className="text-sm">Target Address</Label><Input value={target} onChange={e => setTarget(e.target.value)} placeholder="0x..." /></div>
                <div className="flex gap-2">
                    <Button variant="destructive" disabled={isPending} onClick={() => writeContract({
                        address: CONTRACTS.PolicyGuardV3.address,
                        abi: ADMIN_ABI.PolicyGuardV3,
                        functionName: "setTargetBlocked",
                        args: [target as Address, true],
                    })}>Block</Button>
                    <Button variant="outline" disabled={isPending} onClick={() => writeContract({
                        address: CONTRACTS.PolicyGuardV3.address,
                        abi: ADMIN_ABI.PolicyGuardV3,
                        functionName: "setTargetBlocked",
                        args: [target as Address, false],
                    })}>Unblock</Button>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Set Minter / AllowedCaller ───────────
function SetAddressForm({ label, fnName, icon: Icon }: { label: string; fnName: "setMinter" | "setAllowedCaller"; icon: typeof Key }) {
    const [addr, setAddr] = useState("");
    const { data: hash, writeContract, isPending, error } = useWriteContract();
    useTxToast(hash, label);
    useEffect(() => { if (error) toast.error(error.message?.slice(0, 120)); }, [error]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><Icon className="h-4 w-4" /> {label}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div><Label className="text-sm">Address</Label><Input value={addr} onChange={e => setAddr(e.target.value)} placeholder="0x..." /></div>
                <Button disabled={isPending} onClick={() => writeContract({
                    address: CONTRACTS.PolicyGuardV3.address,
                    abi: ADMIN_ABI.PolicyGuardV3,
                    functionName: fnName,
                    args: [addr as Address],
                })}>
                    {isPending ? "Sending..." : `Set ${label}`}
                </Button>
            </CardContent>
        </Card>
    );
}

// ── Policy Status ────────────────────────
function PolicyStatus() {
    const [policyId, setPolicyId] = useState("1");
    const [version, setVersion] = useState("1");
    const pid = Number(policyId) || 0;
    const ver = Number(version) || 0;

    const { data: exists } = useReadContract({
        address: CONTRACTS.PolicyGuardV3.address,
        abi: ADMIN_ABI.PolicyGuardV3,
        functionName: "policyExists",
        args: [pid, ver],
    });
    const { data: frozen } = useReadContract({
        address: CONTRACTS.PolicyGuardV3.address,
        abi: ADMIN_ABI.PolicyGuardV3,
        functionName: "isFrozen",
        args: [pid, ver],
    });
    const { data: schema } = useReadContract({
        address: CONTRACTS.PolicyGuardV3.address,
        abi: CONTRACTS.PolicyGuardV3.abi,
        functionName: "getSchema",
        args: [pid, ver],
    });

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4" /> Policy Status</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-sm">Policy ID</Label><Input value={policyId} onChange={e => setPolicyId(e.target.value)} /></div>
                    <div><Label className="text-sm">Version</Label><Input value={version} onChange={e => setVersion(e.target.value)} /></div>
                </div>
                <div className="rounded-lg bg-[var(--color-muted)]/30 p-3 text-sm space-y-1 font-mono">
                    <div>Exists: <span className={exists ? "text-green-600" : "text-red-500"}>{String(exists ?? "—")}</span></div>
                    <div>Frozen: <span className={frozen ? "text-amber-600" : "text-green-600"}>{String(frozen ?? "—")}</span></div>
                    {schema && typeof schema === "object" && (
                        <pre className="mt-2 text-sm overflow-auto max-h-40 whitespace-pre-wrap">
                            {JSON.stringify(schema, (_, v) => typeof v === "bigint" ? v.toString() : v, 2)}
                        </pre>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function PolicyManager() {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <CreatePolicyForm />
            <PolicyStatus />
            <GroupMembersForm />
            <FreezePolicyForm />
            <BlockTargetForm />
            <SetAddressForm label="Minter" fnName="setMinter" icon={Key} />
            <SetAddressForm label="Allowed Caller" fnName="setAllowedCaller" icon={Key} />
        </div>
    );
}
