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
        <Card className="border-[var(--color-burgundy)]/10">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--color-burgundy)]" />
                    <CardTitle className="text-lg">{t.agent.policy.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">

                {/* Swap Rules */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-medium text-[var(--color-dark-text)]/80">
                        <ArrowRightLeft className="w-4 h-4" /> {t.agent.policy.swap}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-6">
                        <div className="text-muted-foreground">{t.agent.policy.maxAmountIn}:</div>
                        <div className="font-mono truncate" title={rules.maxSwapAmountIn}>
                            {formatLimit(rules.maxSwapAmountIn, t)}
                        </div>
                        <div className="text-muted-foreground">{t.agent.policy.maxPathLength}:</div>
                        <div className="font-mono">{rules.maxPathLength} {t.agent.policy.hops}</div>
                    </div>
                </div>

                {/* Time Rules */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-medium text-[var(--color-dark-text)]/80">
                        <Clock className="w-4 h-4" /> {t.agent.policy.time}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-6">
                        <div className="text-muted-foreground">{t.agent.policy.deadline}:</div>
                        <div className="font-mono">{rules.maxDeadlineWindow}s</div>
                    </div>
                </div>

                {/* Allowance Rules */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-medium text-[var(--color-dark-text)]/80">
                        <DollarSign className="w-4 h-4" /> {t.agent.policy.spend}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-6">
                        <div className="text-muted-foreground">{t.agent.policy.maxApprove}:</div>
                        <div className="font-mono truncate" title={rules.maxApproveAmount}>
                            {formatLimit(rules.maxApproveAmount, t)}
                        </div>
                        <div className="text-muted-foreground">{t.agent.policy.maxRepay}:</div>
                        <div className="font-mono truncate" title={rules.maxRepayAmount}>
                            {formatLimit(rules.maxRepayAmount, t)}
                        </div>
                    </div>
                </div>

                {/* Whitelists */}
                <div className="pt-2 border-t border-[var(--color-burgundy)]/10">
                    <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t.agent.policy.whitelist}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {rules.allowedTokens.map((token, i) => (
                            <Chip key={i} variant="outline" className="text-xs bg-white/50">
                                {token.slice(0, 6)}...{token.slice(-4)}
                            </Chip>
                        ))}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}

function formatLimit(value: string | number, t: any) {
    const s = value.toString();
    // Check for uint256 max (approx check by prefix)
    if (s.startsWith("1157920892373161954235709850086879")) return t.agent.policy.unlimited;
    if (s.length > 12) return s.slice(0, 6) + "..." + s.slice(-4);
    return s;
}
