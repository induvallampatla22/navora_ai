"use client";

import { useState, useEffect } from "react";
import { Plane, Train, Car, Search, ArrowRight, ShieldCheck, Clock, Check, Sparkles, Navigation, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TransitCard {
  id: string;
  mode: "flight" | "train" | "car" | "ferry";
  provider: string;
  route: string;
  departure: string;
  arrival: string;
  duration: string;
  transfers: string;
  price: number;
  currency: string;
  comfort: string;
  co2: string;
  cancellation: string;
}

const SAMPLE_TRANSIT: TransitCard[] = [
  {
    id: "fl-01",
    mode: "flight",
    provider: "Air France / Delta",
    route: "New York (JFK) → Paris (CDG)",
    departure: "18:30 (Day 1)",
    arrival: "08:15 (Day 2)",
    duration: "7h 45m",
    transfers: "Non-stop",
    price: 680,
    currency: "USD",
    comfort: "Premium Economy",
    co2: "180 kg CO2",
    cancellation: "Free cancellation within 24h"
  },
  {
    id: "tr-01",
    mode: "train",
    provider: "Eurostar High-Speed",
    route: "London St Pancras → Paris Gare du Nord",
    departure: "09:31",
    arrival: "12:47",
    duration: "2h 16m",
    transfers: "Direct",
    price: 145,
    currency: "USD",
    comfort: "Standard Premier",
    co2: "12 kg CO2 (90% lower emissions)",
    cancellation: "Flexible exchange up to 1h before"
  },
  {
    id: "car-01",
    mode: "car",
    provider: "NAVORA Executive Chauffeur",
    route: "Milan Malpensa Airport → Lake Como",
    departure: "On-demand",
    arrival: "Direct door-to-door",
    duration: "55m",
    transfers: "Private Mercedes V-Class",
    price: 180,
    currency: "USD",
    comfort: "Luxury Private Chauffeur",
    co2: "35 kg CO2",
    cancellation: "Free cancellation up to 4h before"
  },
  {
    id: "fl-02",
    mode: "flight",
    provider: "IndiGo / Air India Direct",
    route: "Mumbai (BOM) → Goa Dabolim (GOI)",
    departure: "11:20",
    arrival: "12:35",
    duration: "1h 15m",
    transfers: "Non-stop",
    price: 65,
    currency: "USD",
    comfort: "Economy Extra Legroom",
    co2: "45 kg CO2",
    cancellation: "Free date change allowed"
  },
  {
    id: "tr-02",
    mode: "train",
    provider: "Vande Bharat Express",
    route: "Mumbai CSMT → Madgaon (Goa)",
    departure: "05:25",
    arrival: "13:10",
    duration: "7h 45m",
    transfers: "Direct Executive Scenic Rail",
    price: 42,
    currency: "USD",
    comfort: "Executive Chair Car",
    co2: "18 kg CO2",
    cancellation: "Full refund 48h prior"
  }
];

export default function TransportSearchPage() {
  const [mode, setMode] = useState<"all" | "flight" | "train" | "car">("all");
  const [origin, setOrigin] = useState("New York");
  const [destination, setDestination] = useState("Paris");
  const [departDate, setDepartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [transitList, setTransitList] = useState<TransitCard[]>(SAMPLE_TRANSIT);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    // Filter sample list or generate relevant options
    const filtered = SAMPLE_TRANSIT.filter(t => {
      if (mode !== "all" && t.mode !== mode) return false;
      return true;
    });
    setTransitList(filtered);
  };

  const displayedList = transitList.filter(t => mode === "all" || t.mode === mode);

  return (
    <div className="space-y-8 pb-24 text-white max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary mb-3">
          <Plane className="w-3.5 h-3.5" />
          <span>Multi-Modal Transit Intelligence</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif text-white font-normal">
          Transport & Transit Search
        </h1>
        <p className="text-sm text-white/60 mt-1">
          Compare flights, high-speed rail, and private chauffeur options side-by-side with clear pricing and emission metrics.
        </p>
      </div>

      {/* Search Form Card */}
      <div className="bg-[#111111] rounded-3xl p-6 md:p-8 border border-white/10 space-y-6 shadow-xl">
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {[
            { id: "all", label: "All Modes", icon: Navigation },
            { id: "flight", label: "Flights", icon: Plane },
            { id: "train", label: "High-Speed Rail", icon: Train },
            { id: "car", label: "Private Chauffeur", icon: Car },
          ].map((m) => {
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-black font-semibold shadow-md shadow-primary/20"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <m.icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Inputs */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-white/60 font-medium pl-1">Departure Origin</label>
            <Input
              type="text"
              required
              placeholder="e.g. New York, London, Mumbai..."
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="h-11 bg-black/50 border-white/10 text-white rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-white/60 font-medium pl-1">Destination</label>
            <Input
              type="text"
              required
              placeholder="e.g. Paris, Goa, Kyoto..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="h-11 bg-black/50 border-white/10 text-white rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-white/60 font-medium pl-1">Travel Date</label>
            <Input
              type="date"
              required
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              className="h-11 bg-black/50 border-white/10 text-white rounded-xl text-xs"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#d4b88a] text-black font-semibold hover:bg-[#c4a87a] text-xs flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Options</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif text-white">Available Transit Routes</h2>
          <span className="text-xs font-mono text-white/50">{displayedList.length} Options Found</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {displayedList.map((t) => (
            <div
              key={t.id}
              className="bg-[#111111] p-6 rounded-3xl border border-white/10 hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                  {t.mode === "flight" ? <Plane className="w-6 h-6" /> : t.mode === "train" ? <Train className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {t.mode.toUpperCase()}
                    </span>
                    <span className="text-xs font-medium text-white/80">{t.provider}</span>
                  </div>

                  <h3 className="text-lg font-serif text-white group-hover:text-primary transition-colors">
                    {t.route}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/50 font-mono pt-1">
                    <span>Dep: {t.departure}</span>
                    <span>•</span>
                    <span>Arr: {t.arrival} ({t.duration})</span>
                    <span>•</span>
                    <span className="text-emerald-400">{t.transfers}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                <div className="text-left md:text-right">
                  <div className="text-2xl font-serif text-[#d4b88a] font-bold">
                    ${t.price}
                  </div>
                  <div className="text-[10px] text-white/40 font-mono">per traveler</div>
                </div>

                <Link href={`/dashboard/bookings?type=transit&provider=${encodeURIComponent(t.provider)}&amount=${t.price}&title=${encodeURIComponent(t.route)}`}>
                  <Button className="h-9 px-5 rounded-full bg-[#d4b88a] text-black font-semibold text-xs hover:bg-[#c4a87a]">
                    Select & Book
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
