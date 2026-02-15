"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SortOption } from "@/hooks/useAgentFilter";

interface MarketToolbarProps {
    search: string;
    setSearch: (value: string) => void;
    sort: SortOption;
    setSort: (value: SortOption) => void;
    onToggleFilters?: () => void;
}

export function MarketToolbar({
    search,
    setSearch,
    sort,
    setSort,
    onToggleFilters,
}: MarketToolbarProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-4 md:flex-row md:items-center md:justify-between md:gap-4 md:p-5">
            {/* Search */}
            <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                <Input
                    placeholder={t.marketplace.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="flex items-center gap-2">
                {/* Mobile Filter Toggle */}
                <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    onClick={onToggleFilters}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                </Button>

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <span className="hidden text-sm text-[var(--color-muted-foreground)] md:inline-block">
                        {t.marketplace.sort.label}:
                    </span>
                    <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t.marketplace.sort.newest} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">{t.marketplace.sort.newest}</SelectItem>
                            <SelectItem value="oldest">{t.marketplace.sort.oldest}</SelectItem>
                            <SelectItem value="price_asc">{t.marketplace.sort.priceAsc}</SelectItem>
                            <SelectItem value="price_desc">{t.marketplace.sort.priceDesc}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
