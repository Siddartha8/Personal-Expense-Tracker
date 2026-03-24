import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-900/90 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200": variant === "default",
                        "border border-neutral-200 bg-white shadow-sm hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-50": variant === "outline",
                        "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50": variant === "ghost",
                        "text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50": variant === "link",
                        "h-10 px-4 py-2": size === "default",
                        "h-8 rounded-lg px-3 text-xs": size === "sm",
                        "h-12 rounded-2xl px-8": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
