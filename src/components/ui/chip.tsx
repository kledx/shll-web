import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
    "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                sticker: "bg-yellow-100 text-yellow-800 border border-yellow-200 rotate-1 shadow-sm font-serif", // Sticker style
                burgundy: "bg-[var(--color-burgundy)]/10 text-[var(--color-burgundy)] border border-[var(--color-burgundy)]/20",
                sky: "bg-[var(--color-sky)]/10 text-[var(--color-sky)] border border-[var(--color-sky)]/20",
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
