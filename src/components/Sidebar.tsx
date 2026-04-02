"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, PlusCircle, PieChart, Layers, FileText, Settings, LogOut, ShieldAlert, BadgeIndianRupee, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Add Expense", href: "/add", icon: PlusCircle },
  { name: "Add Income", href: "/income", icon: BadgeIndianRupee },
  { name: "Analytics", href: "/analytics", icon: PieChart },
  { name: "Transactions", href: "/reports", icon: FileText },
  { name: "Categories", href: "/categories", icon: Layers },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  
  // Close sidebar on route change automatically for mobile UX
  useEffect(() => {
     setIsOpen(false);
  }, [pathname]);

  const viewUser = searchParams?.get('viewUser');
  const query = viewUser ? `?viewUser=${viewUser}` : '';

  const isAdmin = session?.user?.email === "admin";
  
  const displayItems = viewUser
    ? navItems.filter(item => ["Dashboard", "Analytics", "Transactions"].includes(item.name))
    : [...navItems, ...(isAdmin ? [{ name: "Admin Control", href: "/admin", icon: ShieldAlert }] : [])];

  return (
    <>
      {/* Mobile Trigger Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50 print:hidden animate-in fade-in zoom-in duration-500">
         <button 
           onClick={() => setIsOpen(!isOpen)} 
           className="w-14 h-14 flex items-center justify-center bg-blue-600 hover:bg-blue-700 active:scale-90 transition-all rounded-full shadow-2xl shadow-blue-500/50 text-white"
         >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
         </button>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-40 lg:hidden print:hidden transition-all animate-in fade-in" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Primary Sidebar Architecture */}
      <aside className={cn(
        "print:hidden fixed inset-y-0 left-0 z-50 w-72 border-r border-neutral-200 bg-white/95 backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-950/95 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0",
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-24 shrink-0 justify-center px-8 border-b border-neutral-200 dark:border-neutral-800">
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
    </>
  );
}
