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
            if (res.error.includes("unverified")) {
                router.push(`/verify?email=${encodeURIComponent(email)}`);
            } else {
                setError(res.error);
                setIsLoading(false);
            }
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

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-neutral-200 dark:border-neutral-800" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/70 dark:bg-neutral-900 px-3 text-neutral-500 font-bold tracking-wider">Or continue with</span></div>
                </div>

                <Button variant="outline" type="button" onClick={() => signIn("google", { callbackUrl: "/" })} className="w-full h-12 rounded-2xl bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors shadow-sm">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                    Google
                </Button>

                <p className="text-center text-sm mt-8 text-neutral-500 dark:text-neutral-400">
                    Don't have an account? <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline hover:underline-offset-4 transition-all">Sign up</Link>
                </p>
            </motion.div>
        </div>
    );
}
