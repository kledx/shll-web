"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Play, Terminal, ArrowRightLeft, Banknote, ShieldAlert } from "lucide-react";
import { Address, Hex, isAddress, isHex } from "viem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwapTemplate } from "./swap-template";
import { RepayTemplate } from "./repay-template";
import { useTranslation } from "@/hooks/useTranslation";
import { usePolicyPreflight } from "@/hooks/usePolicyPreflight";

export interface Action {
    target: Address;
    value: bigint;
    data: Hex;
}

interface ActionBuilderProps {
    onSimulate: (action: Action) => void;
    onExecute: (action: Action) => void;
    isSimulating: boolean;
    isExecuting: boolean;
    simulationResult: { success: boolean, data: Hex } | null;
    simulationError?: string | null;
    agentAccount?: Address;
}

export function ActionBuilder({
    onSimulate,
    onExecute,
    isSimulating,
    isExecuting,
    simulationResult,
    simulationError,
    agentAccount
}: ActionBuilderProps) {
    const { t } = useTranslation();
    const [target, setTarget] = useState<string>("");
    const [value, setValue] = useState<string>("0");
    const [data, setData] = useState<string>("0x");

    const isValid = isAddress(target) && isHex(data);

    // Preflight check — read on-chain policy state
    const preflightAction = isValid ? { target: target as Address, value: BigInt(value || "0"), data: data as Hex } : null;
    const { violations, isChecking: isPreflightChecking } = usePolicyPreflight(preflightAction);

    const handleActionGenerated = (action: Action) => {
        setTarget(action.target);
        setValue(action.value.toString());
        setData(action.data);
    };

    const handleSimulate = () => {
        if (!isValid) return;
        onSimulate({
            target: target as Address,
            value: BigInt(value),
            data: data as Hex
        });
    };

    const handleExecute = () => {
        if (!isValid) return;
        onExecute({
            target: target as Address,
            value: BigInt(value),
            data: data as Hex
        });
    };

    const getPolicyHint = (raw?: string | null) => {
        if (!raw) return null;
        if (/Target not allowed/i.test(raw)) {
            return "策略未授权目标合约，请让管理员在 PolicyGuard 白名单中放行该 token/router。";
        }
        if (/Selector not allowed/i.test(raw)) {
            return "策略未授权该函数选择器，请更新 PolicyGuard 的 selector 白名单。";
        }
        if (/Token not allowed/i.test(raw)) {
            return "策略未授权该 token，请更新 PolicyGuard token allowlist。";
        }
        if (/Spender not allowed/i.test(raw)) {
            return "策略未授权该 spender，请更新 token->spender 白名单。";
        }
        if (/PolicyViolation/i.test(raw)) {
            return "策略校验未通过，请检查 PolicyGuard 配置。";
        }
        if (/amountOutMin is zero/i.test(raw)) {
            return "滑点保护：最小输出金额不能为零，请设置合理的 amountOutMin。";
        }
        if (/Slippage exceeds/i.test(raw)) {
            return "滑点超出上限，当前策略限制最大滑点为 3%。请调整交易参数。";
        }
        if (/Quote unavailable/i.test(raw)) {
            return "链上报价失败，交易对可能不存在或路径无效。";
        }
        return null;
    };

    const policyHint = getPolicyHint(simulationError);

    return (
        <div className="space-y-6">
            <Card className="border-[var(--color-burgundy)]/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Terminal className="w-5 h-5" /> {t.agent.console.builder.title}
                    </CardTitle>
                    <CardDescription>
                        {t.agent.console.builder.subtitle}
                        <br />
                        {t.agent.console.builder.account}: <span className="font-mono text-xs bg-muted px-1 rounded">{agentAccount || t.agent.detail.loading}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <Tabs defaultValue="swap" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="swap" className="gap-2"><ArrowRightLeft className="w-4 h-4" /> {t.agent.console.builder.tabs.swap}</TabsTrigger>
                            <TabsTrigger value="repay" className="gap-2"><Banknote className="w-4 h-4" /> {t.agent.console.builder.tabs.repay}</TabsTrigger>
                            <TabsTrigger value="raw" className="gap-2"><Terminal className="w-4 h-4" /> {t.agent.console.builder.tabs.raw}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="swap">
                            <SwapTemplate onActionGenerated={handleActionGenerated} agentAccount={agentAccount} />
                        </TabsContent>

                        <TabsContent value="repay">
                            {/* TODO: Pass real renter address */}
                            <RepayTemplate onActionGenerated={handleActionGenerated} renterAddress="0xYourAddress" />
                        </TabsContent>

                        <TabsContent value="raw">
                            <div className="p-4 border rounded-lg bg-[var(--color-paper)]/50 text-sm text-muted-foreground text-center">
                                {t.agent.console.builder.manual}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-muted-foreground">{t.agent.console.builder.preview}</Label>
                            {isValid ?
                                <span className="text-xs text-green-600">{t.agent.console.builder.valid}</span> :
                                <span className="text-xs text-red-600">{t.agent.console.builder.invalid}</span>
                            }
                        </div>

                        <div className="space-y-2">
                            <Label>{t.agent.console.builder.target}</Label>
                            <Input
                                placeholder="0x..."
                                value={target}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTarget(e.target.value)}
                                className="font-mono text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t.agent.console.builder.value}</Label>
                                <Input
                                    type="number"
                                    value={value}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                                    className="font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{t.agent.console.builder.data}</Label>
                            <Textarea
                                placeholder="0x..."
                                value={data}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData(e.target.value)}
                                className="font-mono text-xs h-24"
                            />
                        </div>
                    </div>

                    {/* Preflight Warning Card */}
                    {violations.length > 0 && (
                        <div className="mt-4 p-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700">
                            <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                                <ShieldAlert className="w-4 h-4" />
                                策略预检发现 {violations.length} 项缺失
                            </div>
                            <ul className="space-y-2">
                                {violations.map((v, i) => (
                                    <li key={i} className="text-sm">
                                        <div className="flex items-start gap-1.5 text-amber-800 dark:text-amber-300">
                                            <span className="mt-0.5">⚠</span>
                                            <span>{v.messageZh}</span>
                                        </div>
                                        {v.fixCommand && (
                                            <div className="mt-2 ml-5 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(v.fixCommand!);
                                                            // Simple toast fallback
                                                            alert('修复命令已复制到剪贴板');
                                                        }}
                                                        className="px-2 py-1 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors"
                                                    >
                                                        📋 复制修复命令
                                                    </button>
                                                </div>
                                                <code className="block text-xs bg-amber-100 dark:bg-amber-900/50 p-2 rounded font-mono overflow-x-auto">
                                                    {v.fixCommand}
                                                </code>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {/* Batch copy all fix commands */}
                            {violations.filter(v => v.fixCommand).length > 1 && (
                                <div className="mt-3 pt-3 border-t border-amber-300 dark:border-amber-700">
                                    <button
                                        onClick={() => {
                                            const allCommands = violations
                                                .map(v => v.fixCommand)
                                                .filter(Boolean)
                                                .join('\n\n');
                                            navigator.clipboard.writeText(allCommands);
                                            alert(`已复制 ${violations.filter(v => v.fixCommand).length} 条修复命令`);
                                        }}
                                        className="w-full px-3 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors font-medium"
                                    >
                                        📋 批量复制所有修复命令 ({violations.filter(v => v.fixCommand).length} 条)
                                    </button>
                                </div>
                            )}

                            <div className="mt-2 text-sm text-amber-600 dark:text-amber-500">
                                您仍可继续模拟，但链上执行大概率会被 PolicyGuard 拒绝。
                            </div>
                        </div>
                    )}
                    {isPreflightChecking && isValid && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            正在预检策略...
                        </div>
                    )}

                    <div className="flex gap-4 pt-2">
                        <Button
                            variant="secondary"
                            onClick={handleSimulate}
                            disabled={!isValid || isSimulating || isExecuting}
                            className="flex-1"
                        >
                            {isSimulating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                            {t.agent.console.builder.simulate}
                        </Button>

                        <Button
                            onClick={handleExecute}
                            disabled={!isValid || isSimulating || isExecuting || !simulationResult?.success}
                            className="flex-1 bg-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)]/90"
                        >
                            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {t.agent.console.builder.execute}
                        </Button>
                    </div>

                    {simulationResult && (
                        <div className={`mt-4 p-4 rounded border ${simulationResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            <div className="font-bold mb-1">
                                {simulationResult.success ? t.agent.console.builder.simulation.success : t.agent.console.builder.simulation.reverted}
                            </div>
                            <div className="text-xs font-mono break-all opacity-80">
                                {t.agent.console.builder.simulation.return}: {simulationResult.data}
                            </div>
                            {!simulationResult.success && policyHint && (
                                <div className="mt-2 text-xs font-medium">
                                    {policyHint}
                                </div>
                            )}
                            {!simulationResult.success && simulationError && (
                                <div className="mt-1 text-[11px] font-mono break-all opacity-80">
                                    {simulationError}
                                </div>
                            )}
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
