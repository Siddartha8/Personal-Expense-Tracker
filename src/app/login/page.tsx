"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
        if (res?.error) {
            setError("Invalid credentials");
            setIsLoading(false);
        } else {
            router.push("/");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-neutral-50 dark:bg-neutral-950">
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-overlay -z-10 pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-overlay -z-10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
                className="w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] bg-white/70 dark:bg-neutral-900/70 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-2xl shadow-blue-500/5 mx-4"
            >
                <div className="flex justify-center mb-10">
                    <Logo />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome back</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Enter your credentials to access SID</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="p-3 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-500/10 rounded-xl outline outline-1 outline-red-200 dark:outline-red-500/20">{error}</div>}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold ml-1 uppercase tracking-wider text-neutral-500">Email or Username</label>
                        <Input
                            type="text"
                            placeholder="hello@example.com or admin"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Password</label>
                        </div>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full h-12 mt-6 rounded-2xl text-base" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                </form>

                <p className="text-center text-sm mt-8 text-neutral-500 dark:text-neutral-400">
                    Don't have an account? <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline hover:underline-offset-4 transition-all">Sign up</Link>
                </p>
            </motion.div>
        </div>
    );
}
