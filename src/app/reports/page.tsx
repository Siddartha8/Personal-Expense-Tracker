"use client";

import { useState, useEffect, Suspense } from "react";
import { getAllExpenses, deleteExpense, updateExpense } from "@/actions/expenses";
import { getCategories } from "@/actions/categories";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Trash2, Edit3, DownloadCloud, FileText, Calendar, X, Save } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

function ReportsContent() {
    const searchParams = useSearchParams();
    const viewUser = searchParams?.get('viewUser') || undefined;

    const [expenses, setExpenses] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

    const [editingExpense, setEditingExpense] = useState<any | null>(null);
    const [editAmount, setEditAmount] = useState("");
    const [editCategoryId, setEditCategoryId] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editNote, setEditNote] = useState("");
    const [editPaymentMethod, setEditPaymentMethod] = useState("");
    const [editLocation, setEditLocation] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
        fetchCats();
    }, []);

    async function fetchCats() {
        const res = await getCategories();
        if (res.success) setCategories(res.categories);
    }

    async function fetchData() {
        setIsLoading(true);
        const res = await getAllExpenses(viewUser);
        if (res.success && res.expenses) {
            setExpenses(res.expenses);
        }
        setIsLoading(false);
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you positive you want to instantly delete this transaction completely?")) return;
        const res = await deleteExpense(id);
        if (res.success) {
            fetchData();
        } else {
            alert(res.error);
        }
    };

    const openEditModal = (expense: any) => {
        setEditingExpense(expense);
        setEditAmount(expense.amount.toString());
        setEditCategoryId(expense.categoryId);
        setEditDate(new Date(expense.date).toISOString().split('T')[0]);
        setEditNote(expense.note || "");
        setEditPaymentMethod(expense.paymentMethod || "UPI");
        setEditLocation(expense.location || "");
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingExpense) return;
        setIsSaving(true);
        
        const res = await updateExpense(editingExpense.id, {
            amount: parseFloat(editAmount),
            categoryId: editCategoryId,
            date: new Date(editDate),
            note: editNote,
            paymentMethod: editPaymentMethod,
            location: editLocation
        });

        setIsSaving(false);
        if (res.error) {
            alert(res.error);
        } else {
            setEditingExpense(null);
            fetchData();
        }
    };

    const monthlyExpenses = expenses.filter(e => {
        if (!selectedMonth) return true;
        return selectedMonth === format(new Date(e.date), 'yyyy-MM');
    });

    const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    const exportCSV = () => {
        if (monthlyExpenses.length === 0) return alert("No data available to construct CSV sheet payload");
        const headers = ["Date", "Category", "Item/Note", "Amount", "Payment Method", "Location"];
        const rows = monthlyExpenses.map(e => [
            format(new Date(e.date), 'yyyy-MM-dd'),
            e.category?.name || 'Uncategorized',
            `"${(e.note || '').replace(/"/g, '""')}"`,
            e.amount,
            e.paymentMethod,
            `"${(e.location || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `SID_Expenses_${selectedMonth || 'All'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/50 dark:hover:bg-neutral-800">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Reports & Transactions</h1>
                        <p className="text-neutral-500 font-medium">Manage and export your financial records</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 print:hidden">
                    <div className="flex items-center bg-white/50 dark:bg-neutral-900/50 p-1.5 rounded-2xl backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm mr-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400 mr-2">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <Input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="h-10 w-auto rounded-xl border-none bg-transparent shadow-none font-bold text-sm"
                        />
                    </div>

                    <Button variant="outline" onClick={() => window.print()} className="rounded-xl shadow-sm bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md hidden sm:flex">
                        <FileText className="w-4 h-4 mr-2 text-rose-500" /> Export PDF
                    </Button>
                    <Button onClick={exportCSV} className="rounded-xl shadow-md shadow-blue-500/20 px-6 font-bold">
                        <DownloadCloud className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                </div>
            </div>

            <Card className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none shadow-lg shadow-blue-500/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">Total Expenses ({selectedMonth ? format(parseISO(selectedMonth + '-01'), 'MMMM yyyy') : 'All Time'})</p>
                <h3 className="text-4xl font-black tracking-tight mt-2">₹{monthlyTotal.toFixed(2)}</h3>
            </Card>

            <Card className="p-0 overflow-hidden border-white/40 dark:border-white/10 shadow-xl shadow-neutral-200/50 dark:shadow-black/50 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs uppercase bg-neutral-100/50 dark:bg-neutral-900/50 text-neutral-500 font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5">Category</th>
                                <th className="px-6 py-5">Note / Item</th>
                                <th className="px-6 py-5">Payment</th>
                                <th className="px-6 py-5 text-right">Amount (₹)</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-500 font-medium">Loading transactions registry...</td></tr>
                            ) : monthlyExpenses.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-500 font-medium bg-neutral-50/50 dark:bg-neutral-950/20">No active transactions reported this cycle.</td></tr>
                            ) : (
                                <AnimatePresence>
                                    {monthlyExpenses.map((expense) => (
                                        <motion.tr
                                            key={expense.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            className="border-b last:border-0 border-neutral-100/50 dark:border-neutral-800/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group"
                                        >
                                            <td className="px-6 py-5 font-medium">{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm" style={{ backgroundColor: `${expense.category?.color}20`, color: expense.category?.color || '#3b82f6' }}>
                                                    {expense.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-neutral-600 dark:text-neutral-400 font-medium">{expense.note || <span className="opacity-40 italic">--</span>}</td>
                                            <td className="px-6 py-5 font-semibold text-neutral-700 dark:text-neutral-300">{expense.paymentMethod}</td>
                                            <td className="px-6 py-5 text-right font-black text-neutral-900 dark:text-white">₹{expense.amount.toFixed(2)}</td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-full" onClick={() => openEditModal(expense)}>
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-full" onClick={() => handleDelete(expense.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AnimatePresence>
                {editingExpense && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-neutral-900 rounded-[2rem] p-6 w-full max-w-md shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Edit Transaction Details</h3>
                                <Button variant="ghost" size="icon" onClick={() => setEditingExpense(null)} className="rounded-full">
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
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Category</label>
                                        <select className="flex h-12 w-full rounded-2xl border border-neutral-200 bg-white/50 px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-white font-medium" value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} required>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Payment</label>
                                        <select className="flex h-12 w-full rounded-2xl border border-neutral-200 bg-white/50 px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-white font-medium" value={editPaymentMethod} onChange={(e) => setEditPaymentMethod(e.target.value)} required>
                                            <option value="UPI">UPI</option>
                                            <option value="Card">Card</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Net Banking">Net Banking</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Location</label>
                                        <Input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="Optional" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Custom Note / Item</label>
                                    <Input type="text" value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Expense note" />
                                </div>

                                <Button type="submit" className="w-full h-12 mt-4 rounded-xl font-bold" disabled={isSaving}>
                                    {isSaving ? "Syncing changes..." : <><Save className="w-4 h-4 mr-2" /> Modify Expense</>}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ReportsPage() {
    return (
        <Suspense fallback={<div className="font-bold text-neutral-500 m-10">Compiling Report Sheet...</div>}>
            <ReportsContent />
        </Suspense>
    );
}
