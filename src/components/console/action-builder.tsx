"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Play, ShieldAlert, Terminal } from "lucide-react";
import { Address, Hex, isAddress, isHex } from "viem";
import { toast } from "sonner";
import { usePolicyPreflight } from "@/hooks/usePolicyPreflight";
import { useTranslation } from "@/hooks/useTranslation";
import { Action, TemplateKey } from "./action-types";
import { TemplatesPanel } from "./templates-panel";

interface ActionBuilderProps {
    onSimulate: (action: Action) => void;
    onExecute: (action: Action) => void;
    isSimulating: boolean;
    isExecuting: boolean;
    simulationResult: { success: boolean; data: Hex } | null;
    simulationError?: string | null;
    agentAccount?: Address;
    enabledTemplates?: TemplateKey[];
    renterAddress?: string;
    readOnly?: boolean;
    readOnlyMessage?: string;
    executeDisabled?: boolean;
    executeDisabledMessage?: string;
    templateBoundaryHint?: string;
}

export function ActionBuilder({
    onSimulate,
    onExecute,
    isSimulating,
    isExecuting,
    simulationResult,
    simulationError,
    agentAccount,
    enabledTemplates,
    renterAddress,
    readOnly = false,
    readOnlyMessage,
    executeDisabled = false,
    executeDisabledMessage,
    templateBoundaryHint,
}: ActionBuilderProps) {
    const { t, language } = useTranslation();
    const [target, setTarget] = useState<string>("");
    const [value, setValue] = useState<string>("0");
    const [data, setData] = useState<string>("0x");

    const isValid = isAddress(target) && isHex(data);

    const preflightAction = isValid
        ? { target: target as Address, value: BigInt(value || "0"), data: data as Hex }
        : null;
    const { violations, isChecking: isPreflightChecking } = usePolicyPreflight(preflightAction);

    const handleActionGenerated = (action: Action) => {
        setTarget(action.target);
        setValue(action.value.toString());
        setData(action.data);
    };

    const preflightUi = language === "zh"
        ? {
            issuesFound: (count: number) => `已发现 ${count} 项策略限制`,
            blockedHint: "请先调整模板、代币或参数，再进行模拟。",
            simulateBlockedToast: "当前参数不满足策略限制，请先按提示调整。",
            checking: "正在检查策略限制...",
        }
        : {
            issuesFound: (count: number) => `Preflight found ${count} policy issue(s)`,
            blockedHint: "Please adjust template, tokens, or parameters before simulation.",
            simulateBlockedToast: "Current parameters are blocked by policy. Please adjust and try again.",
            checking: "Checking policy preflight...",
        };

    const handleSimulate = () => {
        if (!isValid) return;
        if (isPreflightChecking) {
            toast.message(preflightUi.checking);
            return;
        }
        if (violations.length > 0) {
            toast.warning(preflightUi.simulateBlockedToast);
            return;
        }
        onSimulate({
            target: target as Address,
            value: BigInt(value),
            data: data as Hex,
        });
    };

    const handleExecute = () => {
        if (!isValid) return;
        onExecute({
            target: target as Address,
            value: BigInt(value),
            data: data as Hex,
        });
    };

    const getPolicyHint = (raw?: string | null) => {
        if (!raw) return null;
        const zh = language === "zh";
        if (/Target not allowed/i.test(raw)) {
            return zh
                ? "当前策略暂不支持这个目标，请换一个模板或交易对。"
                : "Current policy does not allow this target. Please try another template or pair.";
        }
        if (/Selector not allowed/i.test(raw)) {
            return zh
                ? "当前策略暂不支持这个动作类型，请尝试其他操作。"
                : "Current policy does not allow this action type. Try a different operation.";
        }
        if (/Token not allowed/i.test(raw)) {
            return zh
                ? "当前策略不支持该代币组合，请更换输入或输出代币。"
                : "Current policy does not allow this token pair. Please choose different tokens.";
        }
        if (/Spender not allowed/i.test(raw)) {
            return zh
                ? "当前策略不支持该授权路径，请更换操作后重试。"
                : "Current policy does not allow this approval route. Try a different action.";
        }
        if (/PolicyViolation/i.test(raw)) {
            return zh
                ? "当前策略校验未通过，请调整参数后重试。"
                : "Policy validation did not pass. Please adjust parameters and try again.";
        }
        if (/amountOutMin is zero/i.test(raw)) {
            return zh
                ? "滑点保护触发：最小输出不能为 0，请调整后再试。"
                : "Slippage guard triggered: minimum output cannot be zero.";
        }
        if (/Slippage exceeds/i.test(raw)) {
            return zh
                ? "滑点超过策略限制，请降低滑点或调整交易参数。"
                : "Slippage exceeds policy limit. Please adjust trade parameters.";
        }
        if (/Quote unavailable/i.test(raw)) {
            return zh
                ? "暂时无法获取报价，请稍后重试或更换交易对。"
                : "Quote unavailable right now. Please retry or change the pair.";
        }
        return null;
    };

    const policyHint = getPolicyHint(simulationError);
    const templateOrder: TemplateKey[] = ["swap", "repay", "raw"];
    const effectiveTemplates = (enabledTemplates || []).filter(
        (item, index, arr): item is TemplateKey =>
            templateOrder.includes(item) && arr.indexOf(item) === index
    );
    const defaultTemplate = effectiveTemplates[0];

    if (!defaultTemplate) {
        return null;
    }

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
                        {t.agent.console.builder.account}:{" "}
                        <span className="font-mono text-xs bg-muted px-1 rounded">
                            {agentAccount || t.agent.detail.loading}
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <TemplatesPanel
                        defaultTemplate={defaultTemplate}
                        effectiveTemplates={effectiveTemplates}
                        agentAccount={agentAccount}
                        renterAddress={renterAddress}
                        onActionGenerated={handleActionGenerated}
                    />

                    {templateBoundaryHint && (
                        <div className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-sm text-sky-900">
                            {templateBoundaryHint}
                        </div>
                    )}

                    {executeDisabled && executeDisabledMessage && (
                        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                            {executeDisabledMessage}
                        </div>
                    )}

                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-muted-foreground">{t.agent.console.builder.preview}</Label>
                            {isValid ? (
                                <span className="text-xs text-green-600">{t.agent.console.builder.valid}</span>
                            ) : (
                                <span className="text-xs text-red-600">{t.agent.console.builder.invalid}</span>
                            )}
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

                    {violations.length > 0 && (
                        <div className="mt-4 p-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700">
                            <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                                <ShieldAlert className="w-4 h-4" />
                                {preflightUi.issuesFound(violations.length)}
                            </div>
                            <ul className="space-y-2">
                                {violations.map((v, i) => (
                                    <li key={i} className="text-sm text-amber-800 dark:text-amber-300">
                                        • {language === "zh" ? v.messageZh : v.messageEn}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                                {preflightUi.blockedHint}
                            </div>
                        </div>
                    )}

                    {isPreflightChecking && isValid && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {preflightUi.checking}
                        </div>
                    )}

                    {readOnly && (
                        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                            {readOnlyMessage || "Console is currently in read-only mode."}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 sm:gap-4">
                        <Button
                            variant="secondary"
                            onClick={handleSimulate}
                            disabled={readOnly || !isValid || isSimulating || isExecuting}
                            className="flex-1"
                        >
                            {isSimulating ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Play className="w-4 h-4 mr-2" />
                            )}
                            {t.agent.console.builder.simulate}
                        </Button>

                        <Button
                            onClick={handleExecute}
                            disabled={
                                readOnly ||
                                executeDisabled ||
                                !isValid ||
                                isSimulating ||
                                isExecuting ||
                                !simulationResult?.success
                            }
                            className="flex-1 bg-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)]/90"
                        >
                            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {t.agent.console.builder.execute}
                        </Button>
                    </div>

                    {simulationResult && (
                        <div
                            className={`mt-4 p-4 rounded border ${
                                simulationResult.success
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : "bg-red-50 border-red-200 text-red-700"
                            }`}
                        >
                            <div className="font-bold mb-1">
                                {simulationResult.success
                                    ? t.agent.console.builder.simulation.success
                                    : t.agent.console.builder.simulation.reverted}
                            </div>
                            <div className="text-xs font-mono break-all opacity-80">
                                {t.agent.console.builder.simulation.return}: {simulationResult.data}
                            </div>
                            {!simulationResult.success && policyHint && (
                                <div className="mt-2 text-xs font-medium">{policyHint}</div>
                            )}
                            {!simulationResult.success && !policyHint && simulationError && (
                                <div className="mt-1 text-[11px] break-all opacity-80">{simulationError}</div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
