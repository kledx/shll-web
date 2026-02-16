"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS, ADMIN_ABI } from "@/config/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Database, Search, Users, FileText } from "lucide-react";
import { formatEther } from "viem";

// ── Contract Overview ────────────────────
function ContractOverview() {
    const { data: v3Owner } = useReadContract({
        address: CONTRACTS.PolicyGuardV3.address,
        abi: ADMIN_ABI.PolicyGuardV3,
        functionName: "owner",
    });
    const { data: nfaOwner } = useReadContract({
        address: CONTRACTS.AgentNFA.address,
        abi: ADMIN_ABI.AgentNFA,
        functionName: "owner",
    });
    const { data: lmOwner } = useReadContract({
        address: CONTRACTS.ListingManager.address,
        abi: ADMIN_ABI.ListingManager,
        functionName: "owner",
    });
    const { data: totalSupply } = useReadContract({
        address: CONTRACTS.AgentNFA.address,
        abi: ADMIN_ABI.AgentNFA,
        functionName: "totalSupply",
    });

    const contracts = [
        { name: "PolicyGuardV3", address: CONTRACTS.PolicyGuardV3.address, owner: v3Owner as string },
        { name: "AgentNFA", address: CONTRACTS.AgentNFA.address, owner: nfaOwner as string },
        { name: "ListingManager", address: CONTRACTS.ListingManager.address, owner: lmOwner as string },
    ];

    return (
        <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><Database className="h-4 w-4" /> Contract Overview</CardTitle>
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
                                    <td className="py-2 font-mono text-xs break-all">{c.address}</td>
                                    <td className="py-2 font-mono text-xs break-all">{c.owner ?? "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                    Total NFA Supply: <span className="font-mono font-medium text-[var(--color-foreground)]">{totalSupply != null ? totalSupply.toString() : "—"}</span>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Policy Lookup ────────────────────────
function PolicyLookup() {
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
                <CardTitle className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4" /> Policy Lookup</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Policy ID</Label><Input value={policyId} onChange={e => setPolicyId(e.target.value)} /></div>
                    <div><Label className="text-xs">Version</Label><Input value={version} onChange={e => setVersion(e.target.value)} /></div>
                </div>
                <div className="rounded-lg bg-[var(--color-muted)]/30 p-3 text-sm space-y-1 font-mono">
                    <div>Exists: <span className={exists ? "text-green-600 font-semibold" : "text-red-500"}>{String(exists ?? "—")}</span></div>
                    <div>Frozen: <span className={frozen ? "text-amber-600 font-semibold" : "text-green-600"}>{String(frozen ?? "—")}</span></div>
                    {schema && typeof schema === "object" && (
                        <pre className="mt-2 text-xs overflow-auto max-h-48 whitespace-pre-wrap break-all">
                            {JSON.stringify(schema, (_, v) => typeof v === "bigint" ? v.toString() : v, 2)}
                        </pre>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// ── Group Lookup ─────────────────────────
function GroupLookup() {
    const [groupId, setGroupId] = useState("1");
    const [member, setMember] = useState("");
    const gid = Number(groupId) || 0;

    const { data: size } = useReadContract({
        address: CONTRACTS.PolicyGuardV3.address,
        abi: ADMIN_ABI.PolicyGuardV3,
        functionName: "groupSize",
        args: [gid],
    });
    const { data: isMember } = useReadContract({
        address: CONTRACTS.PolicyGuardV3.address,
        abi: CONTRACTS.PolicyGuardV3.abi,
        functionName: "isInGroup",
        args: [gid, member as `0x${string}`],
        query: { enabled: /^0x[a-fA-F0-9]{40}$/.test(member) },
    });

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" /> Group Lookup</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div><Label className="text-xs">Group ID</Label><Input value={groupId} onChange={e => setGroupId(e.target.value)} /></div>
                <div className="rounded-lg bg-[var(--color-muted)]/30 p-3 text-sm font-mono">
                    Size: <span className="font-semibold">{size != null ? size.toString() : "—"}</span>
                </div>
                <div><Label className="text-xs">Check Address</Label><Input value={member} onChange={e => setMember(e.target.value)} placeholder="0x..." /></div>
                {/^0x[a-fA-F0-9]{40}$/.test(member) && (
                    <div className="text-sm">
                        Is Member: <span className={isMember ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>{String(isMember ?? "—")}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ── Instance Params Lookup ───────────────
function InstanceLookup() {
    const [instanceId, setInstanceId] = useState("");
    const id = instanceId ? BigInt(instanceId) : BigInt(0);

    const { data: instanceData } = useReadContract({
        address: CONTRACTS.PolicyGuardV3.address,
        abi: CONTRACTS.PolicyGuardV3.abi,
        functionName: "getInstanceParams",
        args: [id],
        query: { enabled: !!instanceId },
    });

    const { data: mode } = useReadContract({
        address: CONTRACTS.PolicyGuardV3.address,
        abi: CONTRACTS.PolicyGuardV3.abi,
        functionName: "executionMode",
        args: [id],
        query: { enabled: !!instanceId },
    });

    const modeNames = ["STRICT", "MANUAL", "EXPLORER"];

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm"><Search className="h-4 w-4" /> Instance Lookup</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div><Label className="text-xs">Instance Token ID</Label><Input value={instanceId} onChange={e => setInstanceId(e.target.value)} placeholder="Token ID" /></div>
                {instanceId && (
                    <div className="rounded-lg bg-[var(--color-muted)]/30 p-3 text-sm font-mono space-y-1">
                        <div>Execution Mode: <span className="font-semibold">{mode != null ? modeNames[Number(mode)] ?? String(mode) : "—"}</span></div>
                        {instanceData && (
                            <pre className="mt-2 text-xs overflow-auto max-h-48 whitespace-pre-wrap break-all">
                                {JSON.stringify(instanceData, (_, v) => typeof v === "bigint" ? v.toString() : v, 2)}
                            </pre>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function AdminDashboard() {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <ContractOverview />
            <PolicyLookup />
            <GroupLookup />
            <InstanceLookup />
        </div>
    );
}
