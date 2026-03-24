"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { addExpense } from "@/actions/expenses";
import { getCategories } from "@/actions/categories";
import { ArrowLeft, Save, Plus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AddExpensePage() {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [note, setNote] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [location, setLocation] = useState("");

    useEffect(() => {
        async function fetchCats() {
            const res = await getCategories();
            if (res.success) {
                setCategories(res.categories);
                if (res.categories.length > 0) {
                    setCategoryId(res.categories[0].id);
                }
            }
        }
        fetchCats();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0 || !categoryId || !date) {
            alert("Please fill all required fields correctly.");
            setIsLoading(false);
            return;
        }

        const res = await addExpense({
            amount: parsedAmount,
            categoryId,
            date: new Date(date),
            note,
            paymentMethod,
            location,
        });

        if (res.error) {
            alert(res.error);
            setIsLoading(false);
        } else {
            router.push("/");
        }
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
                    <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Add New Expense</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1 font-medium">Record a new transaction</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="p-6 sm:p-8 border-white/40 dark:border-white/10 shadow-xl shadow-neutral-200/50 dark:shadow-black/50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium pb-0.5">₹</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="pl-8 text-lg font-bold"
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
                                    className="font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Category</label>
                                    <Link href="/categories" className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center">
                                        <Plus className="w-3 h-3 mr-0.5" /> Manage
                                    </Link>
                                </div>
                                <div className="relative">
                                    <select
                                        className="flex h-12 w-full rounded-2xl border border-neutral-200 bg-white/50 px-4 py-2 text-sm shadow-sm transition-colors backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-white font-medium appearance-none pr-10"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        required
                                    >
                                        {categories.length === 0 && <option value="" disabled>Loading/No categories...</option>}
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Payment Method</label>
                                <div className="relative">
                                    <select
                                        className="flex h-12 w-full rounded-2xl border border-neutral-200 bg-white/50 px-4 py-2 text-sm shadow-sm transition-colors backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-white font-medium appearance-none pr-10"
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
                                        <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Location (Optional)</label>
                                <Input
                                    type="text"
                                    placeholder="e.g. Starbucks, Zomato, Amazon"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Note (Optional)</label>
                                <Input
                                    type="text"
                                    placeholder="Add any extra details..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-neutral-200/50 dark:border-neutral-800/50 flex justify-end">
                            <Button type="submit" size="lg" className="rounded-2xl px-10 shadow-lg shadow-blue-500/25 h-12 text-base font-bold" disabled={isLoading || categories.length === 0}>
                                {isLoading ? "Saving..." : <><Save className="w-5 h-5 mr-2" /> Save Expense</>}
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
