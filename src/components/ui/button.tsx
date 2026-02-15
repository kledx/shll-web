import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-45",
    {
        variants: {
            variant: {
                default: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-[var(--color-burgundy-strong)] active:translate-y-0",
                destructive: "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] hover:bg-[#a92828]",
                outline: "border border-[var(--color-border)] bg-white text-[var(--color-foreground)] hover:border-[var(--color-primary)]/35 hover:text-[var(--color-primary)]",
                secondary: "bg-[var(--color-sky)] text-white hover:bg-[#086a95]",
                ghost: "text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)]",
                link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
                suppressHydrationWarning={true}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
