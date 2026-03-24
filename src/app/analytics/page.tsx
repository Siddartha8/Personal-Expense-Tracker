"use client";

import { useState, useEffect } from "react";
import { getDashboardStats, getAllExpenses } from "@/actions/expenses";
import { MainExpenseChart, CategoryPieChart } from "@/components/DashboardCharts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { format, subDays, isWithinInterval } from "date-fns";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Filter, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function AnalyticsPage() {
    const searchParams = useSearchParams();
    const viewUser = searchParams?.get('viewUser') || undefined;

    const [expenses, setExpenses] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [showMonthly, setShowMonthly] = useState(false);

    useEffect(() => {
        async function load() {
            const res = await getAllExpenses(viewUser);
            if (res.success && res.expenses) {
                setExpenses(res.expenses);
                filterData(res.expenses, startDate, endDate);
            }
        }
        load();
    }, []);

    const filterData = (data: any[], start: string, end: string) => {
        const s = new Date(start);
        const e = new Date(end);
        e.setHours(23, 59, 59, 999);
        const result = data.filter(item => {
            const d = new Date(item.date);
            return d >= s && d <= e;
        });
        setFiltered(result);
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        filterData(expenses, startDate, endDate);
    };

    const totalSpent = filtered.reduce((sum, e) => sum + e.amount, 0);
    const avgDaily = filtered.length > 0 ? (totalSpent / Math.max(1, (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24))) : 0;

    // Category Bar
    const categoryMap = new Map();
    filtered.forEach(exp => {
        const catName = exp.category?.name || 'Uncategorized';
        const catColor = exp.category?.color || '#3b82f6';
        const current = categoryMap.get(catName) || { amount: 0, color: catColor };
        categoryMap.set(catName, { amount: current.amount + exp.amount, color: catColor });
    });
    const categoryData = Array.from(categoryMap.entries()).map(([name, data]) => ({ name, value: data.amount, color: data.color })).sort((a, b) => b.value - a.value);

    // Daily Trend
    const trendMap = new Map();
    filtered.forEach(exp => {
        const dateStr = format(new Date(exp.date), 'MMM dd');
        trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + exp.amount);
    });
    const trendData = Array.from(trendMap.entries()).map(([date, amount]) => ({ date, amount })).reverse();

    const peakDay = trendData.length > 0 ? trendData.reduce((prev, current) => (prev.amount > current.amount) ? prev : current) : { date: "N/A", amount: 0 };
    const topCategory = categoryData.length > 0 ? categoryData[0] : { name: "N/A", value: 0 };

    // Monthly Aggregate
    const monthMap = new Map();
    expenses.forEach(exp => {
        const m = format(new Date(exp.date), 'MMMM yyyy');
        monthMap.set(m, (monthMap.get(m) || 0) + exp.amount);
    });
    const monthlyData = Array.from(monthMap.entries()).map(([month, amount]) => ({ month, amount }));

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
                        <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Analytics & Reports</h1>
                        <p className="text-neutral-500 font-medium">Deep dive into your spending habits</p>
                    </div>
                </div>

                <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3 bg-white/50 dark:bg-neutral-900/50 p-2 rounded-2xl backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm">
                    <Input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="h-10 w-auto rounded-xl border-none bg-white dark:bg-neutral-900 shadow-none font-medium text-sm"
                    />
                    <span className="text-neutral-500 font-medium">to</span>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="h-10 w-auto rounded-xl border-none bg-white dark:bg-neutral-900 shadow-none font-medium text-sm"
                    />
                    <Button type="submit" size="sm" className="h-10 rounded-xl px-5 font-bold shadow-md shadow-blue-500/20">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </Button>
                </form>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Card className="p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-[30px] -mr-8 -mt-8" />
                        <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Total Spent</p>
                        <h3 className="text-4xl font-black tracking-tight mt-2 text-neutral-900 dark:text-white">₹{totalSpent.toFixed(2)}</h3>
                    </Card>

                    <Card className="p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-[30px] -mr-8 -mt-8" />
                        <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Average Daily</p>
                        <h3 className="text-4xl font-black tracking-tight mt-2 text-neutral-900 dark:text-white">₹{avgDaily.toFixed(2)}</h3>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg shadow-blue-500/30 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
                        <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">Peak Spending Day</p>
                        <h3 className="text-4xl font-black tracking-tight mt-2">{peakDay.date}</h3>
                        <p className="text-blue-100 mt-2 font-medium bg-white/10 inline-block px-3 py-1 rounded-lg">₹{peakDay.amount.toFixed(2)}</p>
                    </Card>
                </div>
            </motion.div>

            <Card className="p-6 bg-amber-50/80 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/50 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-2xl text-amber-600 dark:text-amber-400 shadow-inner">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-900 dark:text-amber-300 text-lg">Smart Analysis & Insights</h4>
                        <p className="text-amber-800/80 dark:text-amber-400/80 mt-1.5 font-medium leading-relaxed">
                            During this period, your highest expense category was <strong className="text-amber-900 dark:text-amber-200">{topCategory.name}</strong>, accounting for ₹{topCategory.value.toFixed(2)}.
                            Your peak spending occurred on <strong className="text-amber-900 dark:text-amber-200">{peakDay.date}</strong>. To lower your average daily spend of ₹{avgDaily.toFixed(2)}, monitor your expenses in the {topCategory.name} category.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="flex justify-start">
                <Button variant="outline" onClick={() => setShowMonthly(!showMonthly)} className="font-bold border-neutral-200 dark:border-neutral-800 rounded-xl bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md">
                    <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
                    {showMonthly ? "Hide Monthly Breakdown" : "Reveal Monthly Expense Breakdown"}
                </Button>
            </div>

            <AnimatePresence>
                {showMonthly && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <Card className="p-6 border-white/40 dark:border-white/10 bg-indigo-50/50 dark:bg-indigo-950/20 backdrop-blur-xl">
                            <h3 className="text-lg font-bold mb-4 text-neutral-800 dark:text-neutral-200">Total Monthly Expenses</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {monthlyData.map((data, idx) => (
                                    <div key={idx} className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800 flex justify-between items-center group hover:scale-[1.02] transition-transform">
                                        <p className="font-medium text-neutral-600 dark:text-neutral-400">{data.month}</p>
                                        <p className="font-black text-lg text-indigo-600 dark:text-indigo-400">₹{data.amount.toFixed(2)}</p>
                                    </div>
                                ))}
                                {monthlyData.length === 0 && (
                                    <p className="text-neutral-500 font-medium">No expense data available.</p>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border-white/40 dark:border-white/10">
                    <h3 className="text-lg font-bold mb-6 text-neutral-800 dark:text-neutral-200">Category Distribution</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" strokeOpacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, className: "fill-neutral-500 dark:fill-neutral-400 font-semibold" }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, className: "fill-neutral-500 dark:fill-neutral-400 font-semibold" }} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,15,15,0.95)', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={36}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <CategoryPieChart data={categoryData} />
            </div>

        </div>
    );
}
