"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { addExpense } from "@/actions/expenses";
import { getCategories } from "@/actions/categories";
import { ArrowLeft, Save, Plus, Trash } from "lucide-react";
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

    const [isSplit, setIsSplit] = useState(false);
    const [splits, setSplits] = useState([{ method: "UPI", amount: "" }, { method: "Cash", amount: "" }]);

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

        if (!categoryId || !date) {
            alert("Please select a category and date.");
            setIsLoading(false);
            return;
        }

        if (isSplit) {
            const promises = splits.map(split => {
                const parsedSplitAmount = parseFloat(split.amount);
                if (isNaN(parsedSplitAmount) || parsedSplitAmount <= 0) return null;
                return addExpense({
                    amount: parsedSplitAmount,
                    categoryId,
                    date: new Date(date),
                    note: note ? `${note} (Split: ${split.method})` : `Split Payment (${split.method})`,
                    paymentMethod: split.method,
                    location,
                });
            }).filter(Boolean);

            if (promises.length === 0) {
                alert("Please enter valid split amounts.");
                setIsLoading(false);
                return;
            }

            const results = await Promise.all(promises);
            const error = results.find((r: any) => r?.error);
            if (error) {
                alert(error.error);
                setIsLoading(false);
                return;
            }
            router.push("/");
            return;
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            alert("Please enter a valid amount.");
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
                            
                            <div className="sm:col-span-2 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/30 p-2 rounded-xl">
                                <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400 pl-2">Payment Details</span>
                                <button type="button" onClick={() => setIsSplit(!isSplit)} className="px-4 py-1.5 bg-white dark:bg-neutral-800 text-xs font-bold rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 transition-colors">
                                    {isSplit ? "Use Single Payment" : "Split Payment Mode"}
                                </button>
                            </div>

                            {!isSplit ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Amount (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium pb-0.5">₹</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                required={!isSplit}
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="pl-8 text-lg font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Payment Method</label>
                                        <div className="relative">
                                            <select
                                                className="flex h-12 w-full rounded-2xl border border-neutral-200 bg-white/50 px-4 py-2 text-sm shadow-sm transition-colors backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-white font-medium appearance-none pr-10"
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                required={!isSplit}
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
                                </>
                            ) : (
                                <div className="sm:col-span-2 space-y-4 bg-neutral-50/50 dark:bg-neutral-900/30 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800/80">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">Split Amounts</label>
                                    {splits.map((split, idx) => (
                                        <div key={idx} className="flex gap-3 items-center group">
                                            <select 
                                                value={split.method}
                                                onChange={(e) => {
                                                    const newSplits = [...splits];
                                                    newSplits[idx].method = e.target.value;
                                                    setSplits(newSplits);
                                                }}
                                                className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm flex-1 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white font-medium shadow-sm outline-none focus:border-blue-500"
                                            >
                                                <option value="UPI">UPI</option>
                                                <option value="Card">Card</option>
                                                <option value="Cash">Cash</option>
                                                <option value="Net Banking">Net Banking</option>
                                            </select>
                                            <div className="relative flex-[2]">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
                                                <Input 
                                                    type="number" 
                                                    step="0.01" 
                                                    placeholder="0.00" 
                                                    value={split.amount}
                                                    onChange={(e) => {
                                                        const newSplits = [...splits];
                                                        newSplits[idx].amount = e.target.value;
                                                        setSplits(newSplits);
                                                    }}
                                                    className="pl-8 h-11 font-bold"
                                                />
                                            </div>
                                            {splits.length > 1 && (
                                                <button type="button" onClick={() => setSplits(splits.filter((_, i) => i !== idx))} className="text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 rounded-lg transition-colors">
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setSplits([...splits, { method: "Cash", amount: "" }])} className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center mt-2 hover:underline w-fit">
                                        <Plus className="w-3 h-3 mr-1" /> Add Another Wallet
                                    </button>
                                    <div className="pt-4 mt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                                        <span className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Total Split Value</span>
                                        <span className="text-xl font-black text-neutral-900 dark:text-white bg-white dark:bg-neutral-950 px-4 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                            ₹{splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}

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

                            {/* Payment Method removed from here because it's bundled in the Split Payment toggle above */}

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
