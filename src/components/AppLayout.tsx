"use client";

import { useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function AppLayout({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/verify";

    useEffect(() => {
        if (status !== "loading") {
            if (!session && !isAuthPage) {
                router.push("/login");
            } else if (session && isAuthPage) {
                router.push("/");
            }
        }
    }, [session, isAuthPage, status, router]);

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center p-4"><div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" /></div>;
    }

    if (!session && !isAuthPage) return null;
    if (session && isAuthPage) return null;

    if (isAuthPage) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        );
    }

    return (
        <div className="flex min-h-screen relative overflow-hidden bg-neutral-50/50 dark:bg-neutral-950/50">
            {/* Background decoration elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-overlay" />
                <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-overlay" />
            </div>

            <Sidebar />
            <main className="flex-1 lg:pl-64">
                <div className="mx-auto max-w-6xl p-6 lg:p-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
