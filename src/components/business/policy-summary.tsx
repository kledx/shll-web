import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Shield, Clock, ArrowRightLeft, DollarSign } from "lucide-react";

export interface PolicyRules {
    maxDeadlineWindow: number;
    maxPathLength: number;
    maxSwapAmountIn: string;
    maxApproveAmount: string;
    maxRepayAmount: string;
    allowedTokens: string[];
    allowedSpenders: string[];
}

export function PolicySummary({ rules }: { rules: PolicyRules }) {
    const { t } = useTranslation();

    return (
        <Card className="border-[var(--color-border)] bg-white/72">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[var(--color-primary)]" />
                    <CardTitle className="text-lg">{t.agent.policy.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
                <div className="space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                    <div className="flex items-center gap-2 font-medium text-[var(--color-foreground)]/85">
                        <ArrowRightLeft className="h-4 w-4" /> {t.agent.policy.swap}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-6 text-[var(--color-foreground)]">
                        <div className="text-[var(--color-muted-foreground)]">{t.agent.policy.maxAmountIn}:</div>
                        <div className="font-mono truncate" title={rules.maxSwapAmountIn}>
                            {formatLimit(rules.maxSwapAmountIn, t.agent.policy.unlimited)}
                        </div>
                        <div className="text-[var(--color-muted-foreground)]">{t.agent.policy.maxPathLength}:</div>
                        <div className="font-mono">{rules.maxPathLength} {t.agent.policy.hops}</div>
                    </div>
                </div>

                <div className="space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                    <div className="flex items-center gap-2 font-medium text-[var(--color-foreground)]/85">
                        <Clock className="h-4 w-4" /> {t.agent.policy.time}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-6 text-[var(--color-foreground)]">
                        <div className="text-[var(--color-muted-foreground)]">{t.agent.policy.deadline}:</div>
                        <div className="font-mono">{rules.maxDeadlineWindow}s</div>
                    </div>
                </div>

                <div className="space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                    <div className="flex items-center gap-2 font-medium text-[var(--color-foreground)]/85">
                        <DollarSign className="h-4 w-4" /> {t.agent.policy.spend}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-6 text-[var(--color-foreground)]">
                        <div className="text-[var(--color-muted-foreground)]">{t.agent.policy.maxApprove}:</div>
                        <div className="font-mono truncate" title={rules.maxApproveAmount}>
                            {formatLimit(rules.maxApproveAmount, t.agent.policy.unlimited)}
                        </div>
                        <div className="text-[var(--color-muted-foreground)]">{t.agent.policy.maxRepay}:</div>
                        <div className="font-mono truncate" title={rules.maxRepayAmount}>
                            {formatLimit(rules.maxRepayAmount, t.agent.policy.unlimited)}
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                        {t.agent.policy.whitelist}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {rules.allowedTokens.map((token, i) => (
                            <Chip key={i} variant="outline" className="bg-white/65 text-xs">
                                {token.slice(0, 6)}...{token.slice(-4)}
                            </Chip>
                        ))}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}

function formatLimit(value: string | number, unlimitedLabel: string) {
    const s = value.toString();
    // Check for uint256 max (approx check by prefix)
    if (s.startsWith("1157920892373161954235709850086879")) return unlimitedLabel;
    if (s.length > 12) return s.slice(0, 6) + "..." + s.slice(-4);
    return s;
}
