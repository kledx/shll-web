"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

export type StatusFilter = "all" | "available" | "rented";

interface MarketplaceSearchProps {
    onSearchChange: (query: string) => void;
    onStatusChange: (status: StatusFilter) => void;
    status: StatusFilter;
}

export function MarketplaceSearch({
    onSearchChange,
    onStatusChange,
    status,
}: MarketplaceSearchProps) {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");

    const handleChange = (value: string) => {
        setQuery(value);
        onSearchChange(value);
    };

    const statusOptions: { key: StatusFilter; label: string }[] = [
        { key: "all", label: t.marketplace.filterAll },
        { key: "available", label: t.marketplace.filterAvailable },
        { key: "rented", label: t.marketplace.filterRented },
    ];

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-white/70 p-4 shadow-[var(--shadow-soft)] md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                <Input
                    value={query}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={t.marketplace.searchPlaceholder}
                    className="h-11 rounded-xl border-[var(--color-border)] bg-white pl-10"
                />
            </div>
            <div className="flex flex-wrap gap-2">
                {statusOptions.map((opt) => (
                    <button
                        type="button"
                        key={opt.key}
                        onClick={() => onStatusChange(opt.key)}
                        aria-pressed={status === opt.key}
                        className={cn(
                            "min-h-9 rounded-full px-1 focus:outline-none transition-transform hover:-translate-y-px",
                            status === opt.key ? "shadow-[var(--shadow-soft)]" : ""
                        )}
                    >
                        <Chip
                            variant={status === opt.key ? "burgundy" : "default"}
                            className={cn(
                                "cursor-pointer px-3 py-2 text-xs tracking-wide",
                                status === opt.key ? "border-[var(--color-primary)]/30" : "hover:border-[var(--color-primary)]/25 hover:text-[var(--color-primary)]"
                            )}
                        >
                            {opt.label}
                        </Chip>
                    </button>
                ))}
            </div>
        </div>
    );
}
