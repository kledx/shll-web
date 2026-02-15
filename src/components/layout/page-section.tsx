"use client";

import { cn } from "@/lib/utils";

type PageSectionProps = {
    children: React.ReactNode;
    className?: string;
    tone?: "default" | "muted" | "warning" | "dashed";
    compact?: boolean;
    as?: "div" | "section";
};

export function PageSection({
    children,
    className,
    tone = "default",
    compact = false,
    as = "div",
}: PageSectionProps) {
    const Component = as;
    const baseByTone =
        tone === "default"
            ? cn(
                  "rounded-2xl border border-[var(--color-border)] bg-white/72 shadow-[var(--shadow-soft)]",
                  compact ? "p-5 md:p-6" : "p-6 md:p-8"
              )
            : tone === "muted"
              ? "rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/45 px-4 py-3"
              : tone === "warning"
                ? "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
                : "rounded-lg border border-dashed border-[var(--color-border)] px-4 py-6";
    return (
        <Component className={cn(baseByTone, className)}>
            {children}
        </Component>
    );
}
