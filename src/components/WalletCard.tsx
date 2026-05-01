"use client";

import { useState } from "react";
import { reconcileWalletBalance } from "@/actions/expenses";
import { Edit2, Loader2, IndianRupee } from "lucide-react";

export function WalletCard({ name, balance }: { name: string; balance: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState(balance.toString());
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    setIsLoading(true);
    await reconcileWalletBalance(name, parseFloat(target) || 0);
    setIsLoading(false);
    setIsOpen(false);
  }

  return (
    <>
      <div 
        className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-black/30 hover:scale-[1.02] transition-all duration-300 relative group cursor-pointer shadow-lg"
        onClick={() => {
            setTarget(balance.toString());
            setIsOpen(true);
        }}
      >
        <p className="text-indigo-200/80 text-[10px] font-black uppercase tracking-widest mb-1.5">{name}</p>
        <p className="font-bold text-2xl truncate drop-shadow-sm">₹{balance.toFixed(2)}</p>
        <div className="absolute top-4 right-4 bg-white/10 p-1.5 rounded-md backdrop-blur-md shadow-sm border border-white/10 hover:bg-white/20 transition-colors">
          <Edit2 className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-1">Adjust {name}</h3>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">Set your exact real-world balance. The system will automatically inject a reconciliation transaction to fix the math.</p>
            
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-neutral-500" />
                </div>
                <input 
                  type="number" 
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-black/50 border border-neutral-700 rounded-xl py-3 pl-10 pr-4 text-white text-lg font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="0.00"
                  autoFocus
                />
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsOpen(false)} 
                className="px-4 py-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={isLoading} 
                className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Balance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
