"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { verifyOTP } from "@/actions/auth";
import { signIn } from "next-auth/react";

function VerifyForm() {
    const searchParams = useSearchParams();
    const email = searchParams?.get("email") || "";
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    if (!email) {
        return <div className="text-center mt-20 font-medium text-neutral-500">No email parameter securely provided. Return to signup.</div>;
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const res = await verifyOTP(email, otp);
        setIsLoading(false);

        if (res.error) {
            setError(res.error);
        } else {
            const tempPass = sessionStorage.getItem("sid_temp_registration_pass");
            if (tempPass) {
                await signIn("credentials", {
                    email,
                    password: tempPass,
                    redirect: false,
                });
                sessionStorage.removeItem("sid_temp_registration_pass");
            }
            router.push(`/`);
        }
    };

    return (
        <div className="bg-white/70 dark:bg-neutral-900/70 border border-white/40 dark:border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl w-full max-w-md mx-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
            
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white relative z-10 mb-2">Verify Your Identity</h2>
            <p className="text-neutral-500 text-sm font-medium mb-6">We securely dispatched a 6-digit verification code to <strong className="text-neutral-700 dark:text-neutral-300">{email}</strong>.</p>
            
            {error && (
                <div className="bg-red-50 dark:bg-red-500/10 text-red-600 p-3 rounded-xl text-sm font-bold mb-5 outline outline-1 outline-red-200 dark:outline-red-500/20">
                    {error}
                </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4 relative z-10">
                <Input 
                    type="text" 
                    placeholder="Enter OTP" 
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="bg-white/50 dark:bg-neutral-800 text-center text-xl tracking-[0.5em] font-mono h-14 font-black"
                    required
                />
                <Button type="submit" className="w-full h-12 shadow-lg shadow-blue-500/25 mt-4 rounded-2xl" disabled={isLoading || otp.length < 6}>
                    {isLoading ? "Validating securely..." : "Verify & Enable Account"}
                </Button>
            </form>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-neutral-50 dark:bg-neutral-950">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-overlay -z-10 pointer-events-none" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full flex justify-center">
                <Suspense fallback={<div className="font-bold text-neutral-500">Loading secure gateway...</div>}>
                    <VerifyForm />
                </Suspense>
            </motion.div>
        </div>
    );
}
