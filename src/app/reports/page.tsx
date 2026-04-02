"use client";

import { useState, useEffect, Suspense } from "react";
import { getAllTransactions, deleteExpense, updateExpense } from "@/actions/expenses";
import { deleteIncome, updateIncome } from "@/actions/income";
import { getCategories } from "@/actions/categories";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Trash2, Edit3, DownloadCloud, FileText, Calendar, X, Save } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function ReportsContent() {
    const searchParams = useSearchParams();
    const viewUser = searchParams?.get('viewUser') || undefined;

    const [transactions, setTransactions] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

    const [editingTx, setEditingTx] = useState<any | null>(null);
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
        const res = await getAllTransactions(viewUser);
        if (res.success && res.transactions) {
            setTransactions(res.transactions);
        }
        setIsLoading(false);
    }

    const handleDelete = async (t: any) => {
        if (!confirm(`Are you positive you want to instantly delete this ${t.type.toLowerCase()} completely?`)) return;
        const res = t.type === 'INCOME' ? await deleteIncome(t.id) : await deleteExpense(t.id);
        if (res.success) {
            fetchData();
        } else {
            alert(res.error);
        }
    };

    const openEditModal = (t: any) => {
        setEditingTx(t);
        setEditAmount(t.amount.toString());
        setEditDate(new Date(t.date).toISOString().split('T')[0]);
        setEditPaymentMethod(t.paymentMethod || "UPI");
        
        if (t.type === 'INCOME') {
            setEditNote(t.note || ""); // mapped from source
        } else {
            setEditCategoryId(t.categoryId);
            setEditNote(t.note || "");
            setEditLocation(t.location || "");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTx) return;
        setIsSaving(true);
        
        let res;
        if (editingTx.type === 'INCOME') {
            res = await updateIncome(editingTx.id, {
                amount: parseFloat(editAmount),
                date: new Date(editDate),
                source: editNote,
                paymentMethod: editPaymentMethod
            });
        } else {
            res = await updateExpense(editingTx.id, {
                amount: parseFloat(editAmount),
                categoryId: editCategoryId,
                date: new Date(editDate),
                note: editNote,
                paymentMethod: editPaymentMethod,
                location: editLocation
            });
        }

        setIsSaving(false);
        if (res.error) {
            alert(res.error);
        } else {
            setEditingTx(null);
            fetchData();
        }
    };

    const monthlyTransactions = transactions.filter(t => {
        if (!selectedMonth) return true;
        return selectedMonth === format(new Date(t.date), 'yyyy-MM');
    });

    const monthlyIncome = monthlyTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const monthlySpend = monthlyTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const netFlow = monthlyIncome - monthlySpend;

    const exportPDF = () => {
        if (monthlyTransactions.length === 0) return alert("No data available to construct PDF payload");

        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.text("SID Financial Ledger", 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        const periodText = selectedMonth ? format(parseISO(selectedMonth + '-01'), 'MMMM yyyy') : 'All Time History';
        doc.text(`Official Transaction Report | ${periodText}`, 14, 30);
        
        // Financial Summary Matrix
        doc.setFontSize(10);
        doc.setTextColor(20, 20, 20);
        doc.text(`Total Income: Rs ${monthlyIncome.toFixed(2)}`, 14, 40);
        doc.text(`Total Spend: Rs ${monthlySpend.toFixed(2)}`, 80, 40);
        doc.text(`Net Cash Flow: Rs ${netFlow.toFixed(2)}`, 146, 40);

        const tableColumn = ["Date", "Type", "Category", "Note / Source", "Wallet", "Amount (Rs)"];
        const tableRows: any[] = [];

        monthlyTransactions.forEach(t => {
            const rowData = [
                format(new Date(t.date), 'MMM dd, yyyy'),
                t.type,
                t.category?.name || 'Uncategorized',
                t.note || '--',
                t.paymentMethod,
                `${t.type === 'INCOME' ? '+' : '-'} ${t.amount.toFixed(2)}`
            ];
            tableRows.push(rowData);
        });

        // Autotable seamlessly handles unlimited array pages and boundaries
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 48,
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            didParseCell: function(data) {
                if (data.section === 'body' && data.column.index === 5) { // Amount
                    const isIncome = data.row.raw[1] === 'INCOME';
                    if (isIncome) {
                        data.cell.styles.textColor = [16, 185, 129];
                        data.cell.styles.fontStyle = 'bold';
                    } else {
                        data.cell.styles.textColor = [225, 29, 72];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
                if (data.section === 'body' && data.column.index === 1) { // Type
                    const isIncome = data.row.raw[1] === 'INCOME';
                    if (isIncome) {
                        data.cell.styles.textColor = [16, 185, 129];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            }
        });

        doc.save(`SID_Ledger_${selectedMonth || 'All'}.pdf`);
    };

    const exportCSV = () => {
        if (monthlyTransactions.length === 0) return alert("No data available to construct CSV sheet payload");
        const headers = ["Type", "Date", "Category", "Note/Source", "Amount", "Payment Method", "Location"];
        const rows = monthlyTransactions.map(t => [
            t.type,
            format(new Date(t.date), 'yyyy-MM-dd'),
            t.category?.name || 'Uncategorized',
            `"${(t.note || '').replace(/"/g, '""')}"`,
            t.amount,
            t.paymentMethod,
            `"${(t.location || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `SID_Ledger_${selectedMonth || 'All'}.csv`);
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
                        <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Unified Ledger</h1>
                        <p className="text-neutral-500 font-medium">Manage and export all incoming and outgoing funds</p>
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

                    <Button variant="outline" onClick={exportPDF} className="rounded-xl shadow-sm bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md hidden sm:flex border border-neutral-200 dark:border-neutral-800">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" /> Export PDF
                    </Button>
                    <Button onClick={exportCSV} className="rounded-xl shadow-md shadow-blue-500/20 px-6 font-bold">
                        <DownloadCloud className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-none shadow-lg shadow-emerald-500/30 overflow-hidden relative print:border-solid print:border-2 print:border-neutral-200 print:bg-none print:shadow-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none print:hidden" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-emerald-100 print:text-neutral-500">Income In</p>
                    <h3 className="text-3xl font-black tracking-tight mt-1 print:text-black">+ ₹{monthlyIncome.toFixed(2)}</h3>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-rose-500 to-rose-700 text-white border-none shadow-lg shadow-rose-500/30 overflow-hidden relative print:border-solid print:border-2 print:border-neutral-200 print:bg-none print:shadow-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none print:hidden" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-rose-100 print:text-neutral-500">Spent Out</p>
                    <h3 className="text-3xl font-black tracking-tight mt-1 print:text-black">- ₹{monthlySpend.toFixed(2)}</h3>
                </Card>
                <Card className={`p-6 bg-gradient-to-br ${netFlow >= 0 ? 'from-blue-600 to-indigo-700 shadow-blue-500/30' : 'from-orange-500 to-red-600 shadow-orange-500/30'} text-white border-none shadow-lg overflow-hidden relative print:border-solid print:border-2 print:border-neutral-200 print:bg-none print:shadow-none`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none print:hidden" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-white/80 print:text-neutral-500">Period Net Flow</p>
                    <h3 className="text-3xl font-black tracking-tight mt-1 print:text-black">₹{netFlow.toFixed(2)}</h3>
                </Card>
            </div>

            <Card className="p-0 overflow-hidden print:overflow-visible border-white/40 dark:border-white/10 shadow-xl shadow-neutral-200/50 dark:shadow-black/50 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

                <div className="overflow-x-auto relative z-10 w-full no-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-neutral-100/50 dark:bg-neutral-900/50 text-neutral-500 font-bold tracking-wider">
                            <tr>
                                <th className="px-4 py-4 whitespace-nowrap">Date</th>
                                <th className="px-4 py-4 whitespace-nowrap">Type / Category</th>
                                <th className="px-4 py-4">Note / Source</th>
                                <th className="px-4 py-4 whitespace-nowrap">Wallet</th>
                                <th className="px-4 py-4 text-right whitespace-nowrap">Amount (₹)</th>
                                <th className="px-4 py-4 text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-500 font-medium">Syncying unified ledger...</td></tr>
                            ) : monthlyTransactions.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-500 font-medium bg-neutral-50/50 dark:bg-neutral-950/20">No active transactions reported this cycle.</td></tr>
                            ) : (
                                <AnimatePresence>
                                    {monthlyTransactions.map((t) => (
                                        <motion.tr
                                            key={t.id + t.type}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            className="border-b last:border-0 border-neutral-100/50 dark:border-neutral-800/50 hover:bg-neutral-50/50 dark:hover:bg-blue-900/10 transition-colors group print:break-inside-avoid print:page-break-inside-avoid"
                                        >
                                            <td className="px-4 py-4 font-medium whitespace-nowrap">{format(new Date(t.date), 'MMM dd, yyyy')}</td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm" style={{ backgroundColor: `${t.category?.color}20`, color: t.category?.color || '#3b82f6' }}>
                                                    {t.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-neutral-600 dark:text-neutral-400 font-medium max-w-[200px] truncate" title={t.note}>
                                                {t.note || <span className="opacity-40 italic">--</span>}
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">{t.paymentMethod}</td>
                                            <td className={`px-4 py-4 text-right font-black whitespace-nowrap ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-neutral-900 dark:text-white'}`}>
                                                {t.type === 'INCOME' ? '+ ' : '- '}₹{t.amount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-full" onClick={() => openEditModal(t)}>
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-full" onClick={() => handleDelete(t)}>
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
                {editingTx && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-neutral-900 rounded-[2rem] p-6 w-full max-w-md shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Edit {editingTx.type === 'INCOME' ? 'Income' : 'Expense'}</h3>
                                <Button variant="ghost" size="icon" onClick={() => setEditingTx(null)} className="rounded-full">
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
                                    
                                    {editingTx.type !== 'INCOME' && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Category</label>
                                            <select className="flex h-12 w-full rounded-2xl border border-neutral-200 bg-white/50 px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-white font-medium" value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} required>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    )}
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
                                    {editingTx.type !== 'INCOME' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Location</label>
                                        <Input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="Optional" />
                                    </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">{editingTx.type === 'INCOME' ? 'Source / Note' : 'Custom Note / Item'}</label>
                                    <Input type="text" value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder={editingTx.type === 'INCOME' ? 'e.g. Salary' : 'Expense note'} />
                                </div>

                                <Button type="submit" className={`w-full h-12 mt-4 rounded-xl font-bold ${editingTx.type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`} disabled={isSaving}>
                                    {isSaving ? "Syncing changes..." : <><Save className="w-4 h-4 mr-2" /> Modify {editingTx.type === 'INCOME' ? 'Income' : 'Expense'}</>}
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
        <Suspense fallback={<div className="font-bold text-neutral-500 m-10">Compiling Unified Ledger...</div>}>
            <ReportsContent />
        </Suspense>
    );
}
