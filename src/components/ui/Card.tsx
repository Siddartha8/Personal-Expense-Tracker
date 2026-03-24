import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-3xl border border-neutral-200 bg-white/50 backdrop-blur-xl text-neutral-950 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-50",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

export { Card }
