"use client";

import { Search } from "lucide-react";

export default function HotelsSearchPage() {
  return (
    <div className="space-y-10 pb-20">
      <div className="pt-4">
        <h1 className="text-4xl font-serif font-medium text-white tracking-wide mb-3">Curated Stays</h1>
        <p className="text-lg text-white/60">Discover exclusive boutique hotels and luxury resorts.</p>
      </div>

      <div className="bg-[#111111] rounded-3xl p-8 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-white/50 mb-2">Destination</label>
            <input type="text" placeholder="Where to?" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-white/50 mb-2">Check In</label>
            <input type="date" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-white/50 mb-2">Check Out</label>
            <input type="date" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div className="md:col-span-1 flex items-end">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
              <Search className="w-5 h-5" /> Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
