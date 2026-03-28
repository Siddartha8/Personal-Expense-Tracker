"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, PlusCircle, PieChart, Layers, FileText, Settings, LogOut, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Add Expense", href: "/add", icon: PlusCircle },
  { name: "Analytics", href: "/analytics", icon: PieChart },
  { name: "Categories", href: "/categories", icon: Layers },
  { name: "Transactions", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const viewUser = searchParams?.get('viewUser');
  const query = viewUser ? `?viewUser=${viewUser}` : '';

  const isAdmin = session?.user?.email === "admin";
  
  const displayItems = viewUser
    ? navItems.filter(item => ["Dashboard", "Analytics", "Transactions"].includes(item.name))
    : [...navItems, ...(isAdmin ? [{ name: "Admin Control", href: "/admin", icon: ShieldAlert }] : [])];

  return (
    <aside className="print:hidden fixed inset-y-0 left-0 z-40 w-64 border-r border-neutral-200 bg-white/50 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/50 hidden lg:flex flex-col">
      <div className="flex flex-col h-24 shrink-0 justify-center px-6 border-b border-neutral-200 dark:border-neutral-800">
        <Logo />
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-1 ml-1">Personal Expense Tracker</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {displayItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={`${item.href}${query}`}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors hover:scale-[1.02] active:scale-95",
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/50"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-neutral-500 dark:text-neutral-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <button onClick={() => signOut()} className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
        <ThemeToggle />
      </div>
    </aside>
  );
}
