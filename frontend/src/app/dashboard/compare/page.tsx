"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitCompare,
  Search,
  Check,
  X,
  Plane,
  Building2,
  Compass,
  Utensils,
  Briefcase,
  Star,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { api } from "@/lib/api";

interface CompareItem {
  id: string;
  category: string;
  name: string;
  sub_title: string;
  price: number;
  currency: string;
  rating: number;
  duration?: string;
  location?: string;
  preference_match_score: number;
  budget_impact: string;
  cancellation_terms: string;
  pros: string[];
  trade_offs: string[];
  is_demo_data?: boolean;
}

const TABS = ["All", "Transport", "Stays", "Activities", "Restaurants", "Agencies"];

export default function CentralPriceMatrixPage() {
  const [destination, setDestination] = useState("Kyoto, Japan");
  const [activeTab, setActiveTab] = useState("All");
  const [excludeFlights, setExcludeFlights] = useState(false);
  const [items, setItems] = useState<CompareItem[]>([]);
  const [summary, setSummary] = useState("");
  const [tradeOffNote, setTradeOffNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchMatrix = async (dest = destination, tab = activeTab, noFlights = excludeFlights) => {
    setIsLoading(true);
    try {
      const res = await api.getCompareMatrix(dest, tab, "Hyderabad (HYD)", noFlights);
      if (res && res.items) {
        setItems(res.items);
        setSummary(res.summary);
        setTradeOffNote(res.trade_off_explanation);
      }
    } catch (err) {
      console.warn("Using sample matrix:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, [activeTab, excludeFlights]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim()) {
      fetchMatrix(destination, activeTab, excludeFlights);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "transport":
        return <Plane className="w-4 h-4 text-primary" />;
      case "stay":
        return <Building2 className="w-4 h-4 text-primary" />;
      case "activity":
        return <Compass className="w-4 h-4 text-primary" />;
      case "dining":
      case "restaurant":
        return <Utensils className="w-4 h-4 text-primary" />;
      default:
        return <Briefcase className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary mb-3">
          <GitCompare className="w-3.5 h-3.5" />
          <span>Universal Arbitrage & Price Matrix</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide">
          Compare Everything in One Matrix
        </h1>
        <p className="text-sm text-white/60 mt-1 max-w-3xl">
          Multi-modal comparison across flights, bullet trains, boutique riads, local activities, and curated agency offerings with explicit trade-offs and net savings.
        </p>
      </div>

      {/* Destination & Filter Bar */}
      <div className="p-6 rounded-3xl bg-[#0c0c0c] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination (e.g. Kyoto, Amalfi, Kashmir, Paris, Bali)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-primary text-black font-semibold text-xs tracking-wider uppercase hover:bg-primary/90 transition-all flex items-center gap-2 shrink-0"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Compare</span>
          </button>
        </form>

        {/* Exclude Flights Toggle */}
        <div className="flex items-center gap-3 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70 hover:text-white">
            <input
              type="checkbox"
              checked={excludeFlights}
              onChange={(e) => setExcludeFlights(e.target.checked)}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
            <span>Exclude Flights (Road / Train Only)</span>
          </label>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === tab
                ? "bg-primary text-black font-semibold shadow-lg shadow-primary/20"
                : "bg-[#0e0e0e] text-white/60 hover:text-white border border-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* AI Trade-Off Synthesis */}
      {summary && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/10 via-[#0c0c0c] to-[#0c0c0c] border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary text-xs font-mono uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>AI Arbitrage Insight</span>
            </div>
            <p className="text-sm text-white font-medium">{summary}</p>
            {tradeOffNote && <p className="text-xs text-white/60 leading-relaxed">{tradeOffNote}</p>}
          </div>
        </div>
      )}

      {/* Matrix Cards Grid */}
      {isLoading ? (
        <div className="flex justify-center py-24">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-[#0c0c0c] border border-white/10 p-6 md:p-8 flex flex-col justify-between hover:border-primary/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white/5">{getCategoryIcon(item.category)}</div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary font-mono font-semibold">
                    <Star className="w-3.5 h-3.5 fill-primary" />
                    <span>{item.rating.toFixed(1)}</span>
                  </div>
                </div>

                <h3 className="text-xl font-serif text-white group-hover:text-primary transition-colors mb-1">
                  {item.name}
                </h3>
                <p className="text-xs text-white/50 mb-4 font-light">{item.sub_title}</p>

                <div className="py-3 border-y border-white/5 mb-6 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-serif font-medium text-white">
                      {item.currency === "INR" ? "₹" : item.currency}
                      {item.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-white/40 ml-1">/ person</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                      item.budget_impact === "High"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {item.budget_impact} Tier
                  </span>
                </div>

                {/* Pros */}
                <div className="space-y-3 mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Key Strengths</span>
                  <ul className="space-y-2">
                    {item.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/80">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trade-Offs */}
                {item.trade_offs.length > 0 && (
                  <div className="space-y-2 mb-6">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Trade-Offs</span>
                    <ul className="space-y-1.5">
                      {item.trade_offs.map((to, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                          <X className="w-3.5 h-3.5 text-red-400/80 shrink-0 mt-0.5" />
                          <span>{to}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-white/40 font-mono">
                  <span>Cancellation:</span>
                  <span className="text-white/70">{item.cancellation_terms}</span>
                </div>

                <Link
                  href={`/dashboard/bookings?item_id=${item.id}&title=${encodeURIComponent(item.name)}&amount=${item.price}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-transparent text-xs font-semibold uppercase tracking-wider text-white transition-all group/btn"
                >
                  <span>Select & Book</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full py-24 text-center text-white/40">
              No comparison items available for {destination}. Try another location.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
