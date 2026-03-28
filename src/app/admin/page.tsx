"use client";

import { useState, useEffect } from "react";
import { getAdminUsers, toggleUserStatus, deleteUserByAdmin } from "@/actions/admin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Trash2, Power, PowerOff } from "lucide-react";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        if (session?.user?.email !== "admin") {
            router.push("/");
            return;
        }

        const fetchUsers = async () => {
            const res = await getAdminUsers();
            if (res.success) {
                setUsers(res.users);
            }
            setIsLoading(false);
        };
        fetchUsers();
    }, [session, status, router]);

    const handleToggle = async (userId: string, currentStatus: boolean, email: string) => {
        if (email === "admin") {
            alert("Security Protocol: You cannot deactivate the master admin account.");
            return;
        }
        if (!confirm(`Are you certain you want to ${currentStatus ? "SUSPEND" : "REINSTATE"} access for ${email}?`)) return;
        
        const res = await toggleUserStatus(userId, !currentStatus);
        if (res.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
        } else {
            alert(res.error);
        }
    };

    const handleDelete = async (userId: string, email: string) => {
        if (email === "admin") {
            alert("Security Protocol: You cannot delete the master admin account.");
            return;
        }
        if (!confirm(`CRITICAL: You are about to permanently obliterate ${email} and all transactional data. Proceed?`)) return;
        if (!confirm(`ABSOLUTELY SURE? This action is physically irreversible.`)) return;
        
        const res = await deleteUserByAdmin(userId);
        if (res.success) {
            setUsers(users.filter(u => u.id !== userId));
        } else {
            alert(res.error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8 pb-10">
            <div>
                <div className="flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-indigo-500" />
                    <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Admin Control Panel</h1>
                </div>
                <p className="text-neutral-500 font-medium mt-2">Master system override and user management</p>
            </div>

            <Card className="p-1 max-w-5xl border-white/40 dark:border-white/10 shadow-sm relative overflow-hidden bg-white/50 dark:bg-neutral-900/50">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 text-xs font-bold uppercase tracking-wider text-neutral-500">
                                <th className="p-4">User Details</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Transactions</th>
                                <th className="p-4 text-right">Total Spent</th>
                                <th className="p-4 text-right">Overrides</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-neutral-900 dark:text-white">{user.name || "Unknown"}</p>
                                        <p className="text-xs text-neutral-500">{user.email}</p>
                                    </td>
                                    <td className="p-4">
                                        {user.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                                                Suspended
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right font-mono text-sm text-neutral-600 dark:text-neutral-400">
                                        {user.expenseCount} entries
                                    </td>
                                    <td className="p-4 text-right font-mono font-bold text-neutral-900 dark:text-white">
                                        ${user.totalSpent.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className={`h-8 font-bold text-xs ${user.isActive ? "text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-500 dark:border-amber-900/50 dark:hover:bg-amber-900/20" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-500 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20"}`}
                                                onClick={() => handleToggle(user.id, user.isActive, user.email)}
                                            >
                                                {user.isActive ? <PowerOff className="w-3 h-3 mr-1" /> : <Power className="w-3 h-3 mr-1" />}
                                                {user.isActive ? "Suspend" : "Reinstate"}
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-500 dark:border-red-900/50 dark:hover:bg-red-900/20"
                                                onClick={() => handleDelete(user.id, user.email)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500 font-medium">No users found in database.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </motion.div>
    );
}
