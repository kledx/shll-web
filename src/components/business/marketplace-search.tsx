"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                    value={query}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={t.marketplace.searchPlaceholder}
                    className="pl-9"
                />
            </div>
            <div className="flex gap-2">
                {statusOptions.map((opt) => (
                    <button
                        key={opt.key}
                        onClick={() => onStatusChange(opt.key)}
                        className="focus:outline-none"
                    >
                        <Chip
                            variant={status === opt.key ? "burgundy" : "default"}
                            className={`cursor-pointer transition-colors ${status === opt.key
                                    ? ""
                                    : "hover:bg-[var(--color-burgundy)]/10"
                                }`}
                        >
                            {opt.label}
                        </Chip>
                    </button>
                ))}
            </div>
        </div>
    );
}
