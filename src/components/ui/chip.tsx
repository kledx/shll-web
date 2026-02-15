import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)]",
    {
        variants: {
            variant: {
                default: "border-[var(--color-border)] bg-white text-[var(--color-foreground)]",
                secondary: "border-transparent bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
                destructive: "border-transparent bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]",
                outline: "border-[var(--color-border)] bg-transparent text-[var(--color-foreground)]",
                sticker: "border-[#eacb7d] bg-[#fff7d8] text-[#835f1f] rotate-1 shadow-sm font-serif",
                burgundy: "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
                sky: "border-[var(--color-sky)]/20 bg-[var(--color-accent)] text-[var(--color-sky)]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface ChipProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> { }

function Chip({ className, variant, ...props }: ChipProps) {
    return (
        <div className={cn(chipVariants({ variant }), className)} {...props} />
    );
}

export { Chip, chipVariants };
