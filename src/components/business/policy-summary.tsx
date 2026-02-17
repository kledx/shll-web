import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Shield, Clock, ArrowRightLeft, DollarSign, Target, Zap, Waves } from "lucide-react";
import { decodeAbiParameters, parseAbiParameters, Hex, formatEther } from 'viem';
import { INSTANCE_PARAMS_ABI_TYPES } from "@/hooks/usePolicy";

export interface PolicyRules {
    maxDeadlineWindow: number;
    maxPathLength: number;
    maxSwapAmountIn: string;
    maxApproveAmount: string;
    maxRepayAmount: string;
    allowedTokens: string[];
    allowedSpenders: string[];
}

interface PolicySummaryProps {
    rules: PolicyRules;
    v14Policy?: {
        policyId: number;
        version: number;
        paramsPacked: Hex;
    };
}

export function PolicySummary({ rules, v14Policy }: PolicySummaryProps) {
    const { t, language } = useTranslation();

    // Decode V1.4 instance parameters if available
    const instanceParams = v14Policy ? (() => {
        try {
            const decoded = decodeAbiParameters(
                parseAbiParameters(INSTANCE_PARAMS_ABI_TYPES),
                v14Policy.paramsPacked
            );
            return {
                slippageBps: decoded[0] as number,
                tradeLimit: decoded[1] as bigint,
                dailyLimit: decoded[2] as bigint,
                tokenGroupId: decoded[3] as number,
                dexGroupId: decoded[4] as number,
                riskTier: decoded[5] as number,
            };
        } catch (e) {
            console.error("Failed to decode instance params", e);
            return null;
        }
    })() : null;

    return (
        <Card className="border-[var(--color-border)] bg-white/72">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-[var(--color-primary)]" />
                        <CardTitle className="text-lg">{t.agent.policy.title}</CardTitle>
                    </div>
                    {v14Policy && (
                        <Chip className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-bold">
                            V1.4 INSTANCE
                        </Chip>
                    )}
                </div>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">

                {/* V1.4 Instance Limits Section */}
                {instanceParams && (
                    <div className="space-y-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-tight">
                            <Target className="h-3.5 w-3.5" />
                            {language === 'zh' ? '当前安全防护参数' : 'Active Security Parameters'}
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                            <div className="space-y-1">
                                <div className="text-xs text-blue-600/70 font-medium">{language === 'zh' ? '最大滑点' : 'Max Slippage'}</div>
                                <div className="font-mono text-blue-900 font-semibold">{(instanceParams.slippageBps / 100).toFixed(2)}%</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs text-blue-600/70 font-medium">{language === 'zh' ? '单笔上限' : 'Per-Trade Limit'}</div>
                                <div className="font-mono text-blue-900 font-semibold truncate" title={formatEther(instanceParams.tradeLimit)}>
                                    {formatEther(instanceParams.tradeLimit)} BNB
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs text-blue-600/70 font-medium">{language === 'zh' ? '每日预算' : 'Daily Budget'}</div>
                                <div className="font-mono text-blue-900 font-semibold truncate" title={formatEther(instanceParams.dailyLimit)}>
                                    {formatEther(instanceParams.dailyLimit)} BNB
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs text-blue-600/70 font-medium">{language === 'zh' ? '风险偏好' : 'Risk Preference'}</div>
                                <div className="font-mono text-blue-900 font-semibold">Tier {instanceParams.riskTier}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Legacy / Shared Policy Rules */}
                <div className="space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3 opacity-80 scale-[0.98] origin-top">
                    <div className="flex items-center gap-2 font-medium text-[var(--color-foreground)]/85 text-xs">
                        <Zap className="h-3.5 w-3.5" /> {language === 'zh' ? '共享策略模板限制' : 'Shared Policy Template'}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pl-5 text-[var(--color-foreground)] text-xs">
                        <div className="text-[var(--color-muted-foreground)]">{t.agent.policy.maxAmountIn}:</div>
                        <div className="font-mono truncate">
                            {formatLimit(rules.maxSwapAmountIn, t.agent.policy.unlimited)}
                        </div>

                        <div className="text-[var(--color-muted-foreground)]">{t.agent.policy.deadline}:</div>
                        <div className="font-mono">{rules.maxDeadlineWindow}s</div>

                        <div className="text-[var(--color-muted-foreground)]">{t.agent.policy.maxPathLength}:</div>
                        <div className="font-mono">{rules.maxPathLength} {t.agent.policy.hops}</div>
                    </div>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] flex items-center gap-1">
                        <Waves className="h-3 w-3" />
                        {t.agent.policy.whitelist}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {rules.allowedTokens.length > 0 ? rules.allowedTokens.map((token, i) => (
                            <Chip key={i} variant="outline" className="bg-white/65 text-xs h-5 py-0 px-2">
                                {token.slice(0, 6)}...{token.slice(-4)}
                            </Chip>
                        )) : (
                            <span className="text-xs text-[var(--color-muted-foreground)] italic">All Tokens Allowed</span>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}

function formatLimit(value: string | number, unlimitedLabel: string) {
    const s = value.toString();
    if (s.startsWith("1157920892373161954235709850086879")) return unlimitedLabel;
    if (s.length > 12) return s.slice(0, 6) + "..." + s.slice(-4);
    return s;
}
