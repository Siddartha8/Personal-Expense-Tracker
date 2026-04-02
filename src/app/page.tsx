import { getDashboardStats } from "@/actions/expenses";
import { MainExpenseChart, CategoryPieChart } from "@/components/DashboardCharts";
import { Card } from "@/components/ui/Card";
import { ArrowUpRight, ArrowDownRight, IndianRupee, Wallet2, TrendingUp, Users, BadgeIndianRupee } from "lucide-react";
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

      <Card className="p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 text-white shadow-xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] -ml-10 -mb-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div>
            <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs">Total Net Worth / Balance</p>
            <h2 className="text-5xl sm:text-6xl font-black mt-2 tracking-tight">₹{(totalBalance || 0).toFixed(2)}</h2>
            <p className="text-indigo-200 text-sm font-medium mt-2 max-w-sm">
              Absolute available capital dynamically calculated from securely inputted ledger transactions.
            </p>
          </div>
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner hidden sm:block">
            <BadgeIndianRupee className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 relative z-10">
          {["UPI", "Cash", "Card", "Net Banking"].map((wallet) => (
            <div key={wallet} className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-black/30 transition-colors">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">{wallet}</p>
              <p className="font-bold text-2xl truncate">₹{(balances?.[wallet] || 0).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Spent Today</p>
              <h3 className="text-4xl font-black tracking-tight mt-2 text-neutral-900 dark:text-white">₹{todayTotal?.toFixed(2) || '0.00'}</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl shadow-inner">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5 flex items-center text-sm font-medium relative z-10">
            <span className="flex items-center text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              12%
            </span>
            <span className="text-neutral-500 ml-3">vs yesterday</span>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-purple-500/20 transition-all duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">This Week</p>
              <h3 className="text-4xl font-black tracking-tight mt-2 text-neutral-900 dark:text-white">₹{weekTotal.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl shadow-inner">
              <Wallet2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5 flex items-center text-sm font-medium relative z-10">
            <span className="flex items-center text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-lg">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              8%
            </span>
            <span className="text-neutral-500 ml-3">vs last week</span>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-rose-500/20 transition-all duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Highest Category</p>
              <h3 className="text-3xl font-black tracking-tight mt-3 truncate w-36 text-neutral-900 dark:text-white">{highestCategory.name}</h3>
            </div>
            <div className="p-3 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl shadow-inner">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5 flex items-center text-sm font-medium relative z-10">
            <span className="text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-lg">₹{highestCategory.value.toFixed(2)} spent</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MainExpenseChart data={lineData} />
        <CategoryPieChart data={pieData} />
      </div>

      {/* Smart Insight Demo */}
      <Card className="p-6 border-blue-200/50 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/10 dark:to-indigo-900/10 backdrop-blur-xl shadow-inner">
        <div className="flex items-start gap-4">
          <div className="mt-1.5 flex-shrink-0">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600"></span>
            </span>
          </div>
          <div>
            <h4 className="font-bold text-blue-900 dark:text-blue-200 text-lg tracking-tight">AI Smart Insight</h4>
            <p className="text-blue-800/80 dark:text-blue-300/80 mt-1.5 leading-relaxed font-medium">
              You've spent the most on <span className="font-bold text-blue-700 dark:text-blue-400">{highestCategory.name}</span> recently. Your weekend spending shows a 15% increase compared to weekdays. Consider setting a custom budget for this category to reach your savings goal.
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">Recent Transactions</h3>
        <Card className="p-0 overflow-hidden border-white/40 dark:border-white/10 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs uppercase bg-neutral-100/50 dark:bg-neutral-900/50 text-neutral-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Note / Item</th>
                  <th className="px-6 py-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {safeExpenses.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-6 text-center text-neutral-500 font-medium">No transactions recorded yet.</td></tr>
                ) : (
                  safeExpenses.slice(0, 5).map((expense: any) => (
                    <tr key={expense.id} className="border-b last:border-0 border-neutral-100/50 dark:border-neutral-800/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                      <td className="px-6 py-4 font-medium">{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm" style={{ backgroundColor: `${expense.category?.color}20`, color: expense.category?.color || '#3b82f6' }}>
                          {expense.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 font-medium">{expense.note || <span className="opacity-40 italic">No note</span>}</td>
                      <td className="px-6 py-4 text-right font-bold text-neutral-900 dark:text-white">₹{expense.amount.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-emerald-600 dark:text-emerald-500 tracking-tight">Recent Income (This Month)</h3>
        <Card className="p-0 overflow-hidden border-emerald-500/20 dark:border-emerald-500/10 shadow-sm shadow-emerald-500/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs uppercase bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Destination Wallet</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Amount (₹)</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {safeIncomes.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-6 text-center text-emerald-600/50 font-medium">No income logged this month.</td></tr>
                ) : (
                  safeIncomes.slice(0, 5).map((income: any) => (
                    <tr key={income.id} className="border-b last:border-0 border-emerald-100/30 dark:border-emerald-900/30 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                      <td className="px-6 py-4 font-medium text-emerald-950 dark:text-emerald-100">{format(new Date(income.date), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                          {income.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-medium">{income.source || <span className="opacity-40 italic">Unknown Source</span>}</td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600 dark:text-emerald-400">+ ₹{income.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <form action={async () => {
                          "use server";
                          const { deleteIncome } = await import("@/actions/income");
                          await deleteIncome(income.id);
                        }}>
                          <button type="submit" className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
