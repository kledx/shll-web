"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RiskPanel() {
    const { t } = useTranslation();

    return (
        <Card className="border-[var(--color-border)] bg-white/72 shadow-[var(--shadow-soft)]">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[var(--color-primary)]" />
                    <CardTitle className="text-lg">{t.agent.detail.risk.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Lock className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="font-medium text-[var(--color-foreground)]">{t.agent.detail.risk.allowlist}</div>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                            {t.agent.detail.risk.allowlistDesc}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="font-medium text-[var(--color-foreground)]">{t.agent.detail.risk.spendLimit}</div>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                            {t.agent.detail.risk.spendLimitDesc}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Shield className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="font-medium text-[var(--color-foreground)]">{t.agent.detail.risk.nonCustodial}</div>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                            {t.agent.detail.risk.nonCustodialDesc}
                        </p>
                    </div>
                </div>

                <div className="mt-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--color-muted-foreground)]">
                            {t.agent.detail.risk.trustScore}
                        </span>
                        <span className="text-xl font-bold text-emerald-600">
                            98/100
                        </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-[var(--color-border)]">
                        <div className="h-full w-[98%] rounded-full bg-emerald-500" />
                    </div>
                </div>

                <Button variant="outline" size="sm" className="w-full gap-2">
                    {t.agent.detail.risk.viewPolicy} <ExternalLink className="h-3 w-3" />
                </Button>
            </CardContent>
        </Card>
    );
}
