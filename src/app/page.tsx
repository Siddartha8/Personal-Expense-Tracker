import { getDashboardStats } from "@/actions/expenses";
import { MainExpenseChart, CategoryPieChart } from "@/components/DashboardCharts";
import { Card } from "@/components/ui/Card";
import { ArrowUpRight, ArrowDownRight, IndianRupee, Wallet2, TrendingUp, Users, BadgeIndianRupee, Layers, Zap } from "lucide-react";
import { format, subDays } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function DashboardPage(props: { searchParams: Promise<{ viewUser?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.email === "admin";

  if (isAdmin && !searchParams.viewUser) {
    const { getAdminUsers } = await import("@/actions/admin");
    const res = await getAdminUsers();
    const users: any[] = (res.users as any[]) || [];

    return (
      <div className="space-y-8 pb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Admin Hub</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1 font-medium">Platform Users Dashboard <span className="text-indigo-500 font-bold ml-2 bg-indigo-500/10 px-2 py-0.5 rounded-md">Total Active Users: {users.length}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u: any) => (
            <Card key={u.id} className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 border-white/40 dark:border-white/10 shadow-sm hover:shadow-xl shadow-neutral-200/50 dark:shadow-black/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all duration-500 pointer-events-none" />
              <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">{u.name}</h3>
              <p className="text-sm font-medium text-neutral-500 mb-5">{u.email}</p>

              <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl mb-6 shadow-inner border border-neutral-100/50 dark:border-neutral-800/50">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Transactions</p>
                  <p className="font-black text-lg text-neutral-700 dark:text-neutral-300 mt-0.5">{u.expenseCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Spent</p>
                  <p className="font-black text-lg text-indigo-600 dark:text-indigo-400 mt-0.5">₹{u.totalSpent.toFixed(2)}</p>
                </div>
              </div>

              <Link href={`/?viewUser=${u.id}`}>
                <Button className="w-full rounded-xl shadow-md shadow-indigo-500/20 font-bold bg-indigo-600 hover:bg-indigo-700 text-white">View Full Dashboard</Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { todayTotal, recentExpenses, recentIncomes, balances, totalBalance, error } = await getDashboardStats(searchParams.viewUser);

  if (error) {
    return <div className="p-8 text-center text-red-500 font-medium bg-red-50 dark:bg-red-500/10 rounded-2xl">Failed to load dashboard data. Please make sure you are logged in.</div>;
  }

  const safeExpenses = recentExpenses || [];
  const safeIncomes = recentIncomes || [];

  const categoryMap = new Map();
  safeExpenses.forEach((exp: any) => {
    const catName = exp.category?.name || 'Uncategorized';
    const catColor = exp.category?.color || '#3b82f6';
    const current = categoryMap.get(catName) || { amount: 0, color: catColor };
    categoryMap.set(catName, { amount: current.amount + exp.amount, color: catColor });
  });
  const pieData = Array.from(categoryMap.entries()).map(([name, data]) => ({ name, value: data.amount, color: data.color })).sort((a, b) => b.value - a.value).slice(0, 5);

  const lineData = [];
  let weekTotal = 0;
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const dateStr = format(d, 'MMM dd');
    const dayExpenses = safeExpenses.filter((e: any) => format(new Date(e.date), 'MMM dd') === dateStr);
    const sum = dayExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    lineData.push({ date: dateStr, amount: sum });
    weekTotal += sum;
  }

  const highestCategory = pieData.length > 0 ? pieData[0] : { name: "N/A", value: 0 };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            {searchParams.viewUser ? "User Dashboard Overview" : "Dashboard"}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
            {searchParams.viewUser ? "Viewing an isolated external user's financial breakdown." : `Here's your financial overview for ${format(new Date(), 'MMMM yyyy')}.`}
          </p>
        </div>
        <div className="flex gap-3">
          {searchParams.viewUser && isAdmin && (
            <Link href="/">
              <Button variant="outline" className="rounded-full px-6 h-12 text-base font-bold bg-white/50 dark:bg-neutral-900 shadow-sm border-neutral-200 dark:border-neutral-800">
                Back to Admin Hub
              </Button>
            </Link>
          )}
          {!searchParams.viewUser && (
            <Link href="/add">
              <Button className="rounded-full shadow-lg shadow-blue-500/25 px-8 h-12 text-base font-bold">
                Add Expense
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="relative mt-8 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 via-indigo-500/30 to-purple-600/30 rounded-[2rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-1000 pointer-events-none" />
        <Card className="p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-900 border border-white/10 dark:border-indigo-500/20 text-white shadow-2xl shadow-blue-500/30 backdrop-blur-3xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-[80px] -ml-10 -mb-10 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-6">
            <div>
              <p className="text-indigo-200/80 font-bold uppercase tracking-widest text-xs drop-shadow-sm">Total Net Worth / Balance</p>
              <h2 className="text-5xl sm:text-6xl font-black mt-2 tracking-tight drop-shadow-md">₹{(totalBalance || 0).toFixed(2)}</h2>
              <p className="text-indigo-200/90 text-sm font-medium mt-3 max-w-sm leading-relaxed">
                Absolute available capital dynamically calculated from securely inputted ledger transactions.
              </p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner hidden sm:block">
              <BadgeIndianRupee className="w-10 h-10 text-white drop-shadow-md" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 relative z-10">
            {["UPI", "Cash", "Card", "Net Banking"].map((wallet) => (
              <div key={wallet} className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-black/30 hover:scale-[1.02] transition-all duration-300">
                <p className="text-indigo-200/80 text-[10px] font-black uppercase tracking-widest mb-1.5">{wallet}</p>
                <p className="font-bold text-2xl truncate drop-shadow-sm">₹{(balances?.[wallet] || 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Soft background meshes for the cards */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <Card className="p-1 relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 dark:from-neutral-950 dark:to-blue-950/20 shadow-xl shadow-blue-500/5 border border-blue-100/50 dark:border-blue-900/30 group hover:-translate-y-1 hover:shadow-blue-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none" />
          <div className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md rounded-[14px] p-5 h-full relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">Spent Today</p>
                <h3 className="text-4xl font-black tracking-tight mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">₹{todayTotal?.toFixed(2) || '0.00'}</h3>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-blue-100/50 dark:border-blue-900/20 flex items-center text-[11px] font-bold tracking-wide">
              <span className="flex items-center text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 px-2 py-1 rounded shadow-sm border border-emerald-100 dark:border-emerald-500/20">
                <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
                12%
              </span>
              <span className="text-neutral-400 ml-3 uppercase">vs yesterday</span>
            </div>
          </div>
        </Card>

        <Card className="p-1 relative overflow-hidden bg-gradient-to-br from-white to-purple-50/50 dark:from-neutral-950 dark:to-purple-950/20 shadow-xl shadow-purple-500/5 border border-purple-100/50 dark:border-purple-900/30 group hover:-translate-y-1 hover:shadow-purple-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md rounded-[14px] p-5 h-full relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">This Week</p>
                <h3 className="text-4xl font-black tracking-tight mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-300">₹{weekTotal.toFixed(2)}</h3>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/40 dark:to-fuchsia-900/40 border border-purple-100 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Wallet2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-purple-100/50 dark:border-purple-900/20 flex items-center text-[11px] font-bold tracking-wide">
              <span className="flex items-center text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10 px-2 py-1 rounded shadow-sm border border-rose-100 dark:border-rose-500/20">
                <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                8%
              </span>
              <span className="text-neutral-400 ml-3 uppercase">vs last week</span>
            </div>
          </div>
        </Card>

        <Card className="p-1 relative overflow-hidden bg-gradient-to-br from-white to-rose-50/50 dark:from-neutral-950 dark:to-rose-950/20 shadow-xl shadow-rose-500/5 border border-rose-100/50 dark:border-rose-900/30 group hover:-translate-y-1 hover:shadow-rose-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-rose-500/20 transition-all duration-500 pointer-events-none" />
          <div className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md rounded-[14px] p-5 h-full relative z-10 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">Highest Category</p>
                <h3 className="text-3xl font-black tracking-tight mt-2 truncate max-w-[140px] text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-orange-600 dark:from-rose-400 dark:to-orange-300">{highestCategory.name}</h3>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/40 dark:to-orange-900/40 border border-rose-100 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-auto pt-4 flex items-center text-[11px] font-bold tracking-wide">
              <span className="text-neutral-500 bg-neutral-100/80 dark:bg-neutral-800/80 px-2.5 py-1 rounded shadow-sm border border-neutral-200 dark:border-neutral-700">₹{highestCategory.value.toFixed(2)} spent</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MainExpenseChart data={lineData} />
        <CategoryPieChart data={pieData} />
      </div>

      {/* Smart Insight Demo */}
      <div className="relative group mt-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none" />
        <Card className="p-1 relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30 dark:from-neutral-950 dark:to-indigo-950/20 shadow-xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-800/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none" />
          <div className="bg-white/60 dark:bg-neutral-950/60 backdrop-blur-3xl rounded-[10px] p-6 relative z-10 flex items-start gap-5">
            <div className="mt-1 flex-shrink-0 relative">
              <span className="absolute -inset-2 bg-blue-500/20 rounded-full blur-md animate-pulse" />
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-600 dark:bg-blue-500 shadow-md shadow-blue-500/50"></span>
              </span>
            </div>
            <div>
              <h4 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-lg tracking-tight flex items-center gap-2">
                AI Smart Insight
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-[10px] uppercase tracking-widest text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">Beta</span>
              </h4>
              <p className="text-blue-900/80 dark:text-blue-200/80 mt-2 leading-relaxed font-medium text-sm">
                You've spent the most on <span className="font-black px-2 py-0.5 rounded-md bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 mx-1 shadow-inner">{highestCategory.name}</span> recently. Your weekend spending shows a 15% increase compared to weekdays. Consider setting a custom budget for this category to reach your savings goal.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-12 relative">
        <div className="flex items-center gap-3 mb-5 relative z-10">
          <div className="p-2.5 bg-gradient-to-br from-neutral-700 to-neutral-900 dark:from-neutral-700 dark:to-neutral-800 rounded-xl shadow-lg shadow-neutral-500/20">
             <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-800 to-neutral-500 dark:from-white dark:to-neutral-400 tracking-tight">Recent Transactions</h3>
            <p className="text-sm font-bold text-neutral-500 dark:text-neutral-500 uppercase tracking-widest mt-0.5">Latest Activity Log</p>
          </div>
        </div>

        <Card className="p-1 relative overflow-hidden bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900/50 shadow-xl shadow-neutral-200/50 dark:shadow-black/50 border border-neutral-200/50 dark:border-neutral-800/80">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neutral-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
          
          <div className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-3xl rounded-[14px] overflow-hidden relative z-10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[10px] uppercase bg-neutral-100/80 dark:bg-neutral-900/80 text-neutral-500 dark:text-neutral-400 font-black tracking-[0.2em] border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-6 py-4">Transaction Date</th>
                    <th className="px-6 py-4">Category Badge</th>
                    <th className="px-6 py-4">Item Details</th>
                    <th className="px-6 py-4 text-right">Debit (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {safeExpenses.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-neutral-500 font-medium">No transactions recorded yet.</td></tr>
                  ) : (
                    safeExpenses.slice(0, 5).map((expense: any) => (
                      <tr key={expense.id} className="border-b last:border-0 border-neutral-100 dark:border-neutral-800/60 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50 transition-all duration-300 group">
                        <td className="px-6 py-5 font-bold text-neutral-700 dark:text-neutral-300">
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm inline-flex items-center gap-1.5 border border-white/40 dark:border-white/10" style={{ backgroundColor: `${expense.category?.color}20`, color: expense.category?.color || '#3b82f6' }}>
                            <span className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: expense.category?.color || '#3b82f6' }} />
                            {expense.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-bold text-neutral-800 dark:text-neutral-200 opacity-90 group-hover:opacity-100 transition-opacity">
                            {expense.note || <span className="opacity-40 italic">No note</span>}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="inline-flex items-center justify-end font-black text-lg text-neutral-800 dark:text-neutral-100 group-hover:scale-105 transition-transform origin-right">
                            ₹{expense.amount.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-10 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[2rem] blur-xl opacity-50 pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-5 relative z-10">
          <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 tracking-tight">Income Stream</h3>
            <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mt-0.5">This Month's Inflow</p>
          </div>
        </div>

        <Card className="p-1 relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/50 dark:from-neutral-950 dark:to-emerald-950/20 border-emerald-500/30 dark:border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
          
          <div className="bg-white/60 dark:bg-neutral-950/60 backdrop-blur-3xl rounded-[14px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[10px] uppercase bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black tracking-[0.2em] border-b border-emerald-500/10">
                  <tr>
                    <th className="px-6 py-4">Date Recieved</th>
                    <th className="px-6 py-4">Credit Wallet</th>
                    <th className="px-6 py-4">Origin / Source</th>
                    <th className="px-6 py-4 text-right">Net Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {safeIncomes.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-emerald-600/50 font-medium">No inflow detected yet this month.</td></tr>
                  ) : (
                    safeIncomes.slice(0, 5).map((income: any) => (
                      <tr key={income.id} className="border-b last:border-0 border-emerald-500/5 dark:border-emerald-500/10 hover:bg-emerald-50/80 dark:hover:bg-emerald-500/5 transition-all duration-300 group">
                        <td className="px-6 py-5 font-bold text-neutral-700 dark:text-neutral-300">
                          {format(new Date(income.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm bg-gradient-to-r from-emerald-100 to-teal-100 text-teal-800 dark:from-emerald-900/40 dark:to-teal-900/40 dark:text-teal-300 border border-emerald-200/50 dark:border-emerald-800/50">
                            {income.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-bold text-emerald-800 dark:text-emerald-200 opacity-90 group-hover:opacity-100 transition-opacity">
                            {income.source || <span className="opacity-40 italic">Unknown Source</span>}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="inline-flex items-center justify-end font-black text-lg text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform origin-right">
                            <span className="mr-1 text-sm">+</span>
                            ₹{income.amount.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
