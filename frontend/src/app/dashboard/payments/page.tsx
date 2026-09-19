"use client";

import { ShieldCheck, CreditCard, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentsPage() {
  return (
    <div className="space-y-10 pb-20">
      <div className="pt-4">
        <h1 className="text-4xl font-serif font-medium text-white tracking-wide mb-3">Wallet & Payments</h1>
        <p className="text-lg text-white/60">Securely manage your payment methods and view billing history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-medium text-white border-b border-white/10 pb-4">Payment Methods</h2>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary to-primary/70 text-white p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="font-medium tracking-widest opacity-80 text-sm">CHASE SAPPHIRE</div>
                <CreditCard className="w-8 h-8 opacity-80" />
              </div>
              <div className="font-mono text-xl mb-2 relative z-10">•••• •••• •••• 4242</div>
              <div className="flex justify-between items-end text-sm opacity-80 relative z-10">
                <div>Exp: 12/26</div>
                <div className="flex items-center gap-1 font-medium bg-white/20 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-4 h-4" /> Default
                </div>
              </div>
            </div>
            <button className="w-full p-4 border-2 border-dashed border-white/20 rounded-2xl text-white/40 font-medium hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Add Payment Method
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-medium text-white border-b border-white/10 pb-4">Upcoming Payments</h2>
          <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/5 hover:bg-white/5 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-white">The Ritz-Carlton Deposit</div>
                  <div className="text-sm text-white/40">Due: Oct 1, 2026</div>
                </div>
                <div className="font-serif text-xl font-medium text-white">$1,600.00</div>
              </div>
              <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline mt-2">
                Pay Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 hover:bg-white/5 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-white">JAL Flight Balance</div>
                  <div className="text-sm text-white/40">Due: Oct 5, 2026</div>
                </div>
                <div className="font-serif text-xl font-medium text-white">$6,500.00</div>
              </div>
              <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline mt-2">
                Pay Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-serif font-medium text-white border-b border-white/10 pb-4 mb-6">Billing History</h2>
        <div className="bg-[#111111] rounded-3xl border border-white/10 p-8 text-center text-white/40">
          No past transactions found.
        </div>
      </div>
    </div>
  );
}
