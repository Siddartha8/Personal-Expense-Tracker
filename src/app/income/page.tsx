"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { addIncome, getRecentIncomes, deleteIncome, updateIncome } from "@/actions/income";
import { ArrowLeft, Save, Trash2, Edit2, X, Edit3 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function AddIncomePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [source, setSource] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [incomes, setIncomes] = useState<any[]>([]);

    const [editingIncome, setEditingIncome] = useState<any | null>(null);
    const [editAmount, setEditAmount] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editSource, setEditSource] = useState("");
    const [editPaymentMethod, setEditPaymentMethod] = useState("UPI");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadIncomes();
    }, []);

    const loadIncomes = async () => {
        const res = await getRecentIncomes();
        if (res.success) {
            setIncomes(res.incomes);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you certain you want to permanently delete this income payload?")) return;
        const res = await deleteIncome(id);
        if (res.success) {
            setIncomes(incomes.filter((inc) => inc.id !== id));
        } else {
            alert(res.error);
        }
    };

    const handleEditClick = (income: any) => {
        setEditingIncome(income);
        setEditAmount(income.amount.toString());
        setEditDate(new Date(income.date).toISOString().split("T")[0]);
        setEditPaymentMethod(income.paymentMethod);
        setEditSource(income.source || "");
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingIncome) return;
        setIsUpdating(true);

        const res = await updateIncome(editingIncome.id, {
            amount: parseFloat(editAmount),
            date: new Date(editDate),
            source: editSource,
            paymentMethod: editPaymentMethod,
        });

        if (res.error) {
            alert(res.error);
        } else {
            setEditingIncome(null);
            loadIncomes();
        }
        setIsUpdating(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0 || !date) {
            alert("Please fill all required fields correctly.");
            setIsLoading(false);
            return;
        }

        const res = await addIncome({
            amount: parsedAmount,
            date: new Date(date),
            source,
            paymentMethod,
        });

        if (res.error) {
            alert(res.error);
        } else {
            setAmount("");
            setSource("");
            loadIncomes();
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-10">
            <div className="flex items-center gap-4">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/50 dark:hover:bg-neutral-800">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">Add Income</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1 font-medium">Log new funds to your asset ledger</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="p-6 sm:p-8 border-emerald-500/20 dark:border-emerald-500/20 shadow-xl shadow-emerald-200/20 dark:shadow-black/50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-medium pb-0.5">₹</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="pl-8 text-lg font-bold border-emerald-200 focus-visible:ring-emerald-500 bg-white/50 dark:bg-neutral-900/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Date</label>
                                <Input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="font-medium bg-white/50 dark:bg-neutral-900/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Destination Account</label>
                                <div className="relative">
                                    <select
                                        className="flex h-12 w-full rounded-2xl border border-neutral-200 bg-white/50 px-4 py-2 text-sm shadow-sm transition-colors backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-white font-medium appearance-none pr-10"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        required
                                    >
                                        <option value="UPI">UPI</option>
                                        <option value="Card">Card</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Net Banking">Net Banking</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Source (Optional)</label>
                                <Input
                                    type="text"
                                    placeholder="e.g. Salary, Friend, Bonus"
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    className="bg-white/50 dark:bg-neutral-900/50"
                                />
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-emerald-200/30 dark:border-emerald-800/30 flex justify-end">
                            <Button type="submit" size="lg" className="rounded-2xl px-10 shadow-lg shadow-emerald-500/25 h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
                                {isLoading ? "Saving..." : <><Save className="w-5 h-5 mr-2" /> Save Income</>}
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>

            {/* Injected Secure Ledger Table */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white tracking-tight">Recent Income Log</h3>
                <Card className="p-0 overflow-hidden border-emerald-500/20 dark:border-emerald-500/10 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-xs uppercase bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-500 font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Wallet</th>
                                    <th className="px-6 py-4">Source</th>
                                    <th className="px-6 py-4 text-right">Amount (₹)</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomes.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-6 text-center text-neutral-400 font-medium">No income recorded. Log one above!</td></tr>
                                ) : (
                                    incomes.map((income) => (
                                        <tr key={income.id} className="border-b last:border-0 border-neutral-100/50 dark:border-neutral-800/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-neutral-950 dark:text-neutral-100">
                                                {format(new Date(income.date), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
                                                {income.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 font-medium">
                                                {income.source || <span className="opacity-40 italic">Not set</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                                                + ₹{income.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleEditClick(income)}
                                                        className="w-8 h-8 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDelete(income.id)}
                                                        className="w-8 h-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>

            <AnimatePresence>
                {editingIncome && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-neutral-900 rounded-[2rem] p-6 w-full max-w-md shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-500">Edit Income Payload</h3>
                                <Button variant="ghost" size="icon" onClick={() => setEditingIncome(null)} className="rounded-full">
                                    <X className="w-5 h-5 text-neutral-500" />
                                </Button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Amount (₹)</label>
                                    <Input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} required className="font-bold text-lg" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Date</label>
                                        <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Wallet</label>
                                        <select className="flex h-12 w-full rounded-2xl border border-neutral-200 bg-white/50 px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-white font-medium" value={editPaymentMethod} onChange={(e) => setEditPaymentMethod(e.target.value)} required>
                                            <option value="UPI">UPI</option>
                                            <option value="Card">Card</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Net Banking">Net Banking</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Source (Optional)</label>
                                    <Input type="text" value={editSource} onChange={(e) => setEditSource(e.target.value)} placeholder="e.g. Salary, Dividend" />
                                </div>

                                <Button type="submit" className="w-full h-12 mt-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isUpdating}>
                                    {isUpdating ? "Syncing changes..." : <><Save className="w-4 h-4 mr-2" /> Modify Income</>}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
