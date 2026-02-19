"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { FilterState } from "@/hooks/useAgentFilter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Human-readable labels for agent type codes */
const AGENT_TYPE_LABELS: Record<string, { en: string; zh: string }> = {
    llm_trader: { en: "LLM Trader", zh: "LLM 交易" },
    llm_defi: { en: "LLM DeFi", zh: "LLM DeFi" },
    hot_token: { en: "Hot Token", zh: "热门代币" },
};

interface AgentFiltersProps {
    filters: FilterState;
    setStatus: (status: FilterState["status"]) => void;
    setAgentType?: (agentType: string) => void;
    clearFilters: () => void;
    className?: string;
    stats?: { total: number; available: number; rented: number; };
    agentTypes?: string[];
}

export function AgentFilters({
    filters,
    setStatus,
    setAgentType,
    clearFilters,
    className,
    stats,
    agentTypes,
}: AgentFiltersProps) {
    const { t, language } = useTranslation();
    const isZh = language === "zh";

    const hasActiveFilters = filters.status !== "all"
        || filters.search !== ""
        || filters.agentType !== "all";

    return (
        <div className={cn("w-full space-y-5", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t.marketplace.filters.title}</h3>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-sm h-8 text-[var(--color-destructive)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10"
                    >
                        {t.marketplace.filters.clear}
                    </Button>
                )}
            </div>

            {/* Status Filter */}
            <div className="space-y-2.5">
                <h4 className="text-sm font-medium text-[var(--color-muted-foreground)]">
                    {t.marketplace.filters.status}
                </h4>
                <RadioGroup
                    value={filters.status}
                    onValueChange={(v) => setStatus(v as FilterState["status"])}
                >
                    <div className="flex items-center justify-between space-x-2">
                        <Label
                            htmlFor="status-all"
                            className="flex flex-1 cursor-pointer items-center space-x-2 text-sm font-normal"
                        >
                            <RadioGroupItem value="all" id="status-all" />
                            <span>{t.marketplace.filterAll}</span>
                        </Label>
                        <span className="text-sm text-[var(--color-muted-foreground)]">{stats?.total}</span>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label
                            htmlFor="status-available"
                            className="flex flex-1 cursor-pointer items-center space-x-2 text-sm font-normal"
                        >
                            <RadioGroupItem value="available" id="status-available" />
                            <span>{t.marketplace.filterAvailable}</span>
                        </Label>
                        <span className="text-sm text-[var(--color-muted-foreground)]">{stats?.available}</span>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label
                            htmlFor="status-rented"
                            className="flex flex-1 cursor-pointer items-center space-x-2 text-sm font-normal"
                        >
                            <RadioGroupItem value="rented" id="status-rented" />
                            <span>{t.marketplace.filterRented}</span>
                        </Label>
                        <span className="text-sm text-[var(--color-muted-foreground)]">{stats?.rented}</span>
                    </div>
                </RadioGroup>
            </div>

            {/* Agent Type Filter */}
            {agentTypes && agentTypes.length > 0 && setAgentType && (
                <div className="space-y-2.5">
                    <h4 className="text-sm font-medium text-[var(--color-muted-foreground)]">
                        {isZh ? "Agent 类型" : "Agent Type"}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            onClick={() => setAgentType("all")}
                            className={cn(
                                "rounded-md border px-2.5 py-1 text-sm font-medium transition-colors",
                                filters.agentType === "all"
                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                    : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)]/50",
                            )}
                        >
                            {t.marketplace.filterAll}
                        </button>
                        {agentTypes.map((type) => {
                            const label = AGENT_TYPE_LABELS[type];
                            const displayName = label
                                ? (isZh ? label.zh : label.en)
                                : type;
                            return (
                                <button
                                    key={type}
                                    onClick={() => setAgentType(type)}
                                    className={cn(
                                        "rounded-md border px-2.5 py-1 text-sm font-medium transition-colors",
                                        filters.agentType === type
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                            : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)]/50",
                                    )}
                                >
                                    {displayName}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
