"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { FilterState } from "@/hooks/useAgentFilter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AgentFiltersProps {
    filters: FilterState;
    setStatus: (status: FilterState["status"]) => void;
    clearFilters: () => void;
    className?: string;
    stats?: { total: number; available: number; rented: number; };
}

export function AgentFilters({
    filters,
    setStatus,
    clearFilters,
    className,
    stats
}: AgentFiltersProps) {
    const { t } = useTranslation();

    return (
        <div className={cn("w-full space-y-5", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t.marketplace.filters.title}</h3>
                {(filters.status !== "all" || filters.search !== "") && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs h-8 text-[var(--color-destructive)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10"
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
                        <span className="text-xs text-[var(--color-muted-foreground)]">{stats?.total}</span>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label
                            htmlFor="status-available"
                            className="flex flex-1 cursor-pointer items-center space-x-2 text-sm font-normal"
                        >
                            <RadioGroupItem value="available" id="status-available" />
                            <span>{t.marketplace.filterAvailable}</span>
                        </Label>
                        <span className="text-xs text-[var(--color-muted-foreground)]">{stats?.available}</span>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label
                            htmlFor="status-rented"
                            className="flex flex-1 cursor-pointer items-center space-x-2 text-sm font-normal"
                        >
                            <RadioGroupItem value="rented" id="status-rented" />
                            <span>{t.marketplace.filterRented}</span>
                        </Label>
                        <span className="text-xs text-[var(--color-muted-foreground)]">{stats?.rented}</span>
                    </div>
                </RadioGroup>
            </div>

            {/* Future filters: Price Range, Capabilities */}
        </div>
    );
}
