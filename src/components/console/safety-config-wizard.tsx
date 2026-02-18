"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import {
    Shield, ChevronDown, Loader2, Info,
    CheckCircle, XCircle, Puzzle,
} from "lucide-react";

/* ── Types ── */

interface PolicyPlugin {
    pluginAddress: string;
    pluginName: string;
    active: boolean;
    attachedAt: string;
}

interface SafetyConfigWizardProps {
    tokenId: string;
    language?: "en" | "zh";
}

/* ── Copy ── */

const copy = {
    en: {
        title: "Safety Config (V3)",
        subtitle: "Policy plugins attached to this agent via PolicyGuardV4.",
        loading: "Loading policy plugins...",
        error: "Failed to load plugins",
        noPlugins: "No policy plugins attached yet.",
        pluginName: "Plugin",
        status: "Status",
        active: "Active",
        inactive: "Inactive",
        attachedAt: "Attached",
        address: "Address",
        version: "Contract",
        v3: "V3.0 Composable",
        v1: "V1.x Legacy",
    },
    zh: {
        title: "安全配置 (V3)",
        subtitle: "通过 PolicyGuardV4 挂载到此 Agent 的策略插件。",
        loading: "加载策略插件中...",
        error: "加载插件失败",
        noPlugins: "暂无挂载的策略插件。",
        pluginName: "插件",
        status: "状态",
        active: "已启用",
        inactive: "未启用",
        attachedAt: "挂载时间",
        address: "地址",
        version: "合约",
        v3: "V3.0 可组合",
        v1: "V1.x 旧版",
    },
};

/* ── Component ── */

export function SafetyConfigWizard({ tokenId, language = "en" }: SafetyConfigWizardProps) {
    const t = copy[language];
    const [isExpanded, setIsExpanded] = useState(false);
    const [plugins, setPlugins] = useState<PolicyPlugin[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPlugins = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/agent-policies?tokenId=${tokenId}`, { cache: "no-store" });
            if (!res.ok) throw new Error(`${res.status}`);
            const json = await res.json();
            setPlugins(json.items ?? []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsLoading(false);
        }
    }, [tokenId]);

    useEffect(() => {
        fetchPlugins();
    }, [fetchPlugins]);

    /* ── Collapsed ── */
    if (!isExpanded) {
        return (
            <Card
                className="border-[var(--color-border)] bg-white/72 hover:bg-white/90 transition-colors cursor-pointer"
                onClick={() => setIsExpanded(true)}
            >
                <CardContent className="flex items-center justify-between py-3 px-4">
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-sky-500" />
                        <span className="text-sm font-semibold text-slate-700">
                            {t.title}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Chip className="bg-sky-500/10 text-sky-700 border-sky-500/20 text-xs font-bold">
                            {t.v3}
                        </Chip>
                        <Chip className="bg-slate-100 text-slate-500 border-slate-200 text-xs">
                            {plugins.length} {t.pluginName}
                        </Chip>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    /* ── Expanded ── */
    return (
        <Card className="border-sky-500/20 bg-gradient-to-br from-sky-50/30 to-white/80">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(false)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-sky-50/50 transition-colors rounded-t-xl"
            >
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-sky-600" />
                    <span className="text-sm font-bold text-slate-800">{t.title}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 rotate-180 transition-transform" />
            </button>

            <CardContent className="space-y-3 text-sm pt-0 pb-4">
                <p className="text-xs text-slate-500 leading-relaxed">{t.subtitle}</p>

                {isLoading && (
                    <div className="flex items-center justify-center gap-2 py-6 text-sm text-[var(--color-muted-foreground)]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.loading}
                    </div>
                )}

                {error && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        {t.error}: {error}
                    </div>
                )}

                {!isLoading && !error && plugins.length === 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm text-slate-500">
                        <Info className="h-4 w-4 flex-shrink-0" />
                        {t.noPlugins}
                    </div>
                )}

                {/* Plugin List */}
                {!isLoading && plugins.length > 0 && (
                    <div className="space-y-1.5">
                        {plugins.map((plugin, i) => (
                            <div
                                key={`${plugin.pluginAddress}-${i}`}
                                className={`rounded-lg border px-3 py-2 transition-colors ${plugin.active
                                        ? "border-emerald-200 bg-emerald-50/40"
                                        : "border-slate-200 bg-white/60"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Puzzle className={`h-4 w-4 flex-shrink-0 ${plugin.active ? "text-emerald-600" : "text-slate-400"
                                            }`} />
                                        <span className="font-semibold text-slate-700 truncate">
                                            {plugin.pluginName || `Plugin ${i + 1}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {plugin.active ? (
                                            <Chip className="bg-emerald-100 text-emerald-700 text-xs">
                                                <CheckCircle className="h-3 w-3 mr-0.5" />
                                                {t.active}
                                            </Chip>
                                        ) : (
                                            <Chip className="bg-slate-100 text-slate-500 text-xs">
                                                <XCircle className="h-3 w-3 mr-0.5" />
                                                {t.inactive}
                                            </Chip>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-slate-500">
                                    <span>{t.address}</span>
                                    <span className="font-mono truncate text-slate-700">
                                        {plugin.pluginAddress.slice(0, 10)}...{plugin.pluginAddress.slice(-6)}
                                    </span>
                                    {plugin.attachedAt && (
                                        <>
                                            <span>{t.attachedAt}</span>
                                            <span className="text-slate-700">
                                                {new Date(Number(plugin.attachedAt) * 1000).toLocaleDateString()}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
