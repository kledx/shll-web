"use client";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
    title: string;
    subtitle?: string;
    align?: "left" | "center";
    rightSlot?: React.ReactNode;
    className?: string;
};

export function PageHeader({
    title,
    subtitle,
    align = "left",
    rightSlot,
    className,
}: PageHeaderProps) {
    const centered = align === "center";
    return (
        <section
            className={cn(
                "rounded-2xl border border-[var(--color-border)] bg-white/72 p-6 shadow-[var(--shadow-soft)] md:p-8",
                centered
                    ? "text-center"
                    : "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
                className
            )}
        >
            <div className={cn("space-y-2", centered && "mx-auto")}>
                <h1 className="page-title">{title}</h1>
                {subtitle ? (
                    <p className={cn("page-subtitle text-base md:text-lg", centered && "mx-auto")}>{subtitle}</p>
                ) : null}
            </div>
            {!centered && rightSlot ? <div className="text-left md:text-right">{rightSlot}</div> : null}
        </section>
    );
}
