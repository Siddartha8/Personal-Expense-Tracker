"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/Button";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="w-10 h-10" />;

    const current = theme === 'system' ? resolvedTheme : theme;

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(current === "dark" ? "light" : "dark")}
            className={`text-neutral-500 hover:text-neutral-900 dark:hover:text-white ${className}`}
        >
            {current === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
