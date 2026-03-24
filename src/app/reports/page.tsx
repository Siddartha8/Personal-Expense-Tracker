"use client";

import { useState, useEffect } from "react";
import { getAllExpenses, deleteExpense } from "@/actions/expenses";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Trash2, DownloadCloud, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function ReportsPage() {
    const searchParams = useSearchParams();
    const viewUser = searchParams?.get('viewUser') || undefined;

    const [expenses, setExpenses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setIsLoading(true);
        const res = await getAllExpenses(viewUser);
        if (res.success && res.expenses) {
            setExpenses(res.expenses);
        }
        setIsLoading(false);
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this expense permanently?")) return;
        const res = await deleteExpense(id);
        if (res.success) {
            fetchData();
        } else {
            alert(res.error);
        }
    };

    const monthlyExpenses = expenses.filter(e => {
        if (!selectedMonth) return true;
        return selectedMonth === format(new Date(e.date), 'yyyy-MM');
    });

    const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    const exportCSV = () => {
        if (monthlyExpenses.length === 0) return alert("No data to export for this month");
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
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-500 font-medium">Loading transactions...</td></tr>
                            ) : monthlyExpenses.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-500 font-medium bg-neutral-50/50 dark:bg-neutral-950/20">No transactions recorded for this month.</td></tr>
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
                                            <td className="px-6 py-5 text-neutral-600 dark:text-neutral-400 font-medium">{expense.note || <span className="opacity-40 italic">No note</span>}</td>
                                            <td className="px-6 py-5 font-semibold text-neutral-700 dark:text-neutral-300">{expense.paymentMethod}</td>
                                            <td className="px-6 py-5 text-right font-black text-neutral-900 dark:text-white">₹{expense.amount.toFixed(2)}</td>
                                            <td className="px-6 py-5 text-right">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all rounded-full" onClick={() => handleDelete(expense.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
