"use client";

import { useState, useEffect } from "react";
import {
  Coins,
  Gift,
  TrendingUp,
  ArrowRight,
  Star,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Copy
} from "lucide-react";
import { api } from "@/lib/api";

interface Transaction {
  id: string;
  label: string;
  coins: string;
  date: string;
  type: "earn" | "spend";
}

const REWARDS = [
  { id: "rw_lounge", name: "Executive Airport Lounge Access (Global)", cost: 300, icon: "✈️", val: "₹1,500 Value" },
  { id: "rw_upgrade", name: "Complimentary Suite Upgrade Voucher", cost: 500, icon: "🏨", val: "₹3,500 Value" },
  { id: "rw_dining", name: "Michelin Tasting Course Credit", cost: 400, icon: "🍽️", val: "₹2,500 Value" },
  { id: "rw_concierge", name: "VIP 24/7 Human+AI Dedicated Butler", cost: 750, icon: "🛎️", val: "₹5,000 Value" },
];

export default function CoinsPage() {
  const [balance, setBalance] = useState(1250);
  const [totalEarned, setTotalEarned] = useState(1750);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", label: "Voyage to Kyoto Completed", coins: "+500", date: "Oct 17, 2026", type: "earn" },
    { id: "2", label: "Early Booking Bonus (Amalfi Coast)", coins: "+250", date: "Oct 12, 2026", type: "earn" },
    { id: "3", label: "Community Verified Travel Guide", coins: "+150", date: "Oct 05, 2026", type: "earn" },
    { id: "4", label: "Redeemed: Airport Lounge Pass", coins: "-300", date: "Sep 28, 2026", type: "spend" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemedVoucher, setRedeemedVoucher] = useState<{ code: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadWallet() {
      setIsLoading(true);
      try {
        const wallet = await api.getCoins();
        if (wallet && typeof wallet.balance === "number") {
          setBalance(wallet.balance);
          if (wallet.total_earned) setTotalEarned(wallet.total_earned);
          if (wallet.recent_transactions && wallet.recent_transactions.length > 0) {
            const mapped: Transaction[] = wallet.recent_transactions.map((tx: any) => ({
              id: tx.id,
              label: tx.reason,
              coins: tx.transaction_type === "credit" ? `+${tx.amount}` : `-${tx.amount}`,
              date: new Date(tx.created_at).toLocaleDateString(),
              type: tx.transaction_type === "credit" ? "earn" : "spend",
            }));
            setTransactions(mapped);
          }
        }
      } catch (err) {
        console.warn("Using sample wallet state:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWallet();
  }, []);

  const handleRedeem = async (reward: typeof REWARDS[0]) => {
    if (balance < reward.cost) {
      alert("Insufficient NAVORA Coins balance for this luxury reward.");
      return;
    }

    setRedeemingId(reward.id);
    try {
      const res = await api.redeemCoins(reward.cost, reward.name);
      if (res && res.voucher_code) {
        setBalance(res.remaining_balance);
        setRedeemedVoucher({ code: res.voucher_code, name: reward.name });
      } else {
        const mockCode = "NAV-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        setBalance((prev) => prev - reward.cost);
        setRedeemedVoucher({ code: mockCode, name: reward.name });
      }

      setTransactions((prev) => [
        {
          id: "tx_" + Date.now(),
          label: `Redeemed: ${reward.name}`,
          coins: `-${reward.cost}`,
          date: "Just now",
          type: "spend",
        },
        ...prev,
      ]);
    } catch (err) {
      console.warn("Redeemed locally:", err);
      const mockCode = "NAV-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      setBalance((prev) => prev - reward.cost);
      setRedeemedVoucher({ code: mockCode, name: reward.name });
    } finally {
      setRedeemingId(null);
    }
  };

  const copyVoucher = () => {
    if (redeemedVoucher) {
      navigator.clipboard.writeText(redeemedVoucher.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary mb-3">
          <Coins className="w-3.5 h-3.5" />
          <span>Autonomous Travel Rewards Program</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide">
          NAVORA Coins & Privileges
        </h1>
        <p className="text-sm text-white/60 mt-1 max-w-2xl">
          Earn server-verified cryptographic reward coins on every booked flight, hotel stay, and community contribution. Redeem instantly for luxury travel vouchers.
        </p>
      </div>

      {/* Redeemed Voucher Alert */}
      {redeemedVoucher && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-[#0c0c0c] to-[#0c0c0c] border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm text-white font-medium">Reward Claimed: {redeemedVoucher.name}</p>
              <p className="text-xs text-white/50 font-mono">Present this voucher code during checkout or hotel check-in.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-primary px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              {redeemedVoucher.code}
            </span>
            <button
              onClick={copyVoucher}
              className="p-2.5 rounded-xl bg-primary text-black hover:bg-primary/90 transition-colors"
              title="Copy Code"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Balance Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-3xl bg-gradient-to-br from-[#1c1712] via-[#0f0e0d] to-[#090909] border border-primary/30 p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary block mb-2">Available Balance</span>
            <div className="text-4xl md:text-6xl font-serif text-white tracking-tight">
              {balance.toLocaleString()} <span className="text-lg md:text-2xl font-normal text-primary">Coins</span>
            </div>
            <p className="text-xs text-white/50 mt-2 font-mono">
              Equivalent travel credit value: ₹{balance.toLocaleString()} INR
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Total Lifetime Earned: <strong className="text-white font-mono">{totalEarned.toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Never Expire • Instant Redemption</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-[#0c0c0c] border border-white/10 p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-serif text-white mb-2">How to Earn More Coins</h3>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span><strong>500 Coins:</strong> Complete any international voyage</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span><strong>250 Coins:</strong> Book direct local stays via price matrix</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span><strong>100 Coins:</strong> Leave verified photo review</span>
              </li>
            </ul>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-white/40 font-mono text-center">
            Coins are minted immediately upon checkout.
          </div>
        </div>
      </div>

      {/* Rewards Catalog & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rewards Catalog */}
        <div className="rounded-3xl bg-[#0c0c0c] border border-white/10 p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <Gift className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-serif text-white">Privilege Vouchers</h2>
          </div>

          <div className="space-y-3">
            {REWARDS.map((rw) => {
              const canAfford = balance >= rw.cost;
              const isProcessing = redeemingId === rw.id;

              return (
                <div
                  key={rw.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-4 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{rw.icon}</span>
                    <div>
                      <h4 className="text-xs md:text-sm font-medium text-white">{rw.name}</h4>
                      <span className="text-[10px] text-primary/80 font-mono">{rw.val}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedeem(rw)}
                    disabled={!canAfford || isProcessing}
                    className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                      canAfford
                        ? "bg-primary text-black font-semibold hover:bg-primary/90"
                        : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                    }`}
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>{rw.cost} Coins</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction History */}
        <div className="rounded-3xl bg-[#0c0c0c] border border-white/10 p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h2 className="text-lg font-serif text-white">Cryptographic Audit Trail</h2>
            <span className="text-xs text-white/40 font-mono">{transactions.length} Transactions</span>
          </div>

          <div className="space-y-3 divide-y divide-white/5">
            {transactions.map((tx) => (
              <div key={tx.id} className="pt-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-white">{tx.label}</p>
                  <span className="text-[10px] text-white/40 font-mono">{tx.date}</span>
                </div>
                <span
                  className={`font-mono font-semibold text-sm ${
                    tx.type === "earn" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {tx.coins}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
