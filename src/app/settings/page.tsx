"use client";

import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { updateProfile } from "@/actions/auth";

export default function SettingsPage() {
    const { data: session } = useSession();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
    }, [session]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const res = await updateProfile({ name, password });
        setIsLoading(false);
        if (res.error) {
            alert(res.error);
        } else {
            alert("Profile successfully updated!");
            setPassword("");
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Settings</h1>
                <p className="text-neutral-500 font-medium mt-1">Manage your account preferences</p>
            </div>

            <Card className="p-6 max-w-2xl border-white/40 dark:border-white/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none" />
                <h3 className="font-bold text-lg mb-6 relative z-10 text-neutral-900 dark:text-white">Appearance</h3>
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <p className="font-medium text-neutral-900 dark:text-white">Theme Preference</p>
                        <p className="text-sm text-neutral-500 mt-1">Switch between light and dark mode securely</p>
                    </div>
                    <ThemeToggle className="scale-125 ml-4" />
                </div>
            </Card>

            <Card className="p-6 max-w-2xl border-white/40 dark:border-white/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -ml-10 -mt-10 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
                <h3 className="font-bold text-lg mb-6 text-neutral-900 dark:text-white relative z-10">Profile Settings</h3>
                <form onSubmit={handleUpdate} className="space-y-5 relative z-10">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Full Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-white/50 dark:bg-neutral-900/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Email Address (Username)</label>
                        <Input
                            value={session?.user?.email || ""}
                            disabled
                            className="opacity-60 bg-neutral-100 dark:bg-neutral-950 font-medium shadow-none select-none"
                        />
                        <p className="text-xs text-neutral-400 font-medium">Email addresses cannot be changed directly.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">New Password</label>
                        <Input
                            type="password"
                            placeholder="Leave blank to carefully keep current password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/50 dark:bg-neutral-900/50"
                        />
                    </div>
                    <div className="pt-2">
                        <Button type="submit" disabled={isLoading} className="shadow-lg shadow-blue-500/25 px-8 h-11 text-base w-full sm:w-auto">
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Card>
        </motion.div>
    );
}
