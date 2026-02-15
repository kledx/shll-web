import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
    "flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-white/85 px-3 py-2 text-sm text-[var(--color-foreground)] shadow-[inset_0_1px_2px_rgba(32,26,22,0.03)] transition-[border-color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-muted-foreground)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {},
        defaultVariants: {},
    }
)

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(inputVariants(), className)}
                ref={ref}
                {...props}
                suppressHydrationWarning={true}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
