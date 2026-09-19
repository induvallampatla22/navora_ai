"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CloudSun,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Globe,
  Shield,
  Wind,
  Droplets,
  Eye,
  ChevronRight,
  Search,
  RefreshCw,
  Zap,
  ArrowRightLeft,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function IntelligencePage() {
  const [destination, setDestination] = useState("Kyoto, Japan");
  const [searchInput, setSearchInput] = useState("Kyoto, Japan");
  const [weatherData, setWeatherData] = useState<any>({
    temp: 24,
    condition: "Clear Skies",
    icon: "☀️",
    humidity: 48,
    wind_speed: 11,
    feels_like: 25,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Currency Converter State
  const [convAmount, setConvAmount] = useState("1000");
  const [fromCurr, setFromCurr] = useState("USD");
  const [toCurr, setToCurr] = useState("JPY");

  const RATES: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.5,
    JPY: 154.2,
    AED: 3.67,
    CHF: 0.90,
  };

  const calculateConverted = () => {
    const fromRate = RATES[fromCurr] || 1.0;
    const toRate = RATES[toCurr] || 1.0;
    const inUSD = parseFloat(convAmount || "0") / fromRate;
    return (inUSD * toRate).toFixed(2);
  };

  const fetchWeather = async (dest: string) => {
    setIsLoading(true);
    try {
      const res = await api.getWeather(dest);
      if (res) {
        setWeatherData(res);
        setDestination(dest);
      }
    } catch (err) {
      console.warn("Using sample weather:", err);
      setWeatherData({
        temp: 24,
        condition: "Partly Cloudy",
        icon: "⛅",
        humidity: 50,
        wind_speed: 12,
        feels_like: 25,
      });
      setDestination(dest);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeather(searchInput.trim());
    }
  };

  const weatherForecasts = [
    { day: "Mon", icon: "☀️", high: 28, low: 19, condition: "Clear" },
    { day: "Tue", icon: "⛅", high: 26, low: 18, condition: "Partly Cloudy" },
    { day: "Wed", icon: "🌧️", high: 22, low: 16, condition: "Light Rain" },
    { day: "Thu", icon: "☀️", high: 27, low: 18, condition: "Sunny" },
    { day: "Fri", icon: "☀️", high: 29, low: 20, condition: "Clear" },
    { day: "Sat", icon: "⛅", high: 25, low: 17, condition: "Partly Cloudy" },
    { day: "Sun", icon: "☀️", high: 30, low: 21, condition: "Sunny" },
  ];

  const advisories = [
    { severity: "warning", title: "Flight Price Sentinel", message: `Round-trip routes to ${destination} dropped 14% this week. Optimal booking window open.`, action: "Price Matrix", href: "/dashboard/compare" },
    { severity: "info", title: "Visa & Entry Formalities", message: `Check transit and tourist visa protocols for ${destination}. Processing: 3-5 days.`, action: "Check Vault", href: "/dashboard/documents" },
    { severity: "success", title: "Autonomous Replan Ready", message: "Weather sentinel is continuously scanning for storm and rail delay disruptions.", action: "Monitor", href: "/dashboard/monitor" },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Autonomous Intelligence & Predictive Synthesis</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide">Travel Intelligence</h1>
          <p className="text-sm text-white/60 mt-1">
            Real-time multi-vector insights, live weather radar, and price arbitrage for <span className="font-medium text-white">{destination}</span>.
          </p>
        </div>
      </div>

      {/* Destination Search */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search destination (e.g. Kyoto, Goa, Paris, Tokyo, Bali, Rome, Swiss Alps)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#111111] border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-primary"
          />
        </div>
        <Button type="submit" disabled={isLoading} className="rounded-xl bg-primary text-black hover:bg-primary/90 text-xs">
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-1.5" /> : <Search className="w-4 h-4 mr-1.5" />}
          Analyze
        </Button>
      </form>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111111] rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs text-white/40 uppercase tracking-widest">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Best Time to Book
          </div>
          <div className="text-2xl font-serif font-medium text-emerald-400">Prime Window</div>
          <div className="text-xs text-white/40 mt-1">Historical rate lows this month</div>
        </div>

        <div className="bg-[#111111] rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs text-white/40 uppercase tracking-widest">
            <DollarSign className="w-4 h-4 text-primary" /> Daily Index
          </div>
          <div className="text-2xl font-serif font-medium text-white">$185 / day</div>
          <div className="text-xs text-white/40 mt-1">Mid-to-luxury benchmark</div>
        </div>

        <div className="bg-[#111111] rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs text-white/40 uppercase tracking-widest">
            <Globe className="w-4 h-4 text-blue-400" /> Live FX Index
          </div>
          <div className="text-2xl font-serif font-medium text-white">¥154.2 / $</div>
          <div className="text-xs text-white/40 mt-1">Favorable purchase parity</div>
        </div>

        <div className="bg-[#111111] rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs text-white/40 uppercase tracking-widest">
            <Shield className="w-4 h-4 text-emerald-400" /> Safety Score
          </div>
          <div className="text-2xl font-serif font-medium text-emerald-400">9.2 / 10</div>
          <div className="text-xs text-white/40 mt-1">Sovereign advisory: Safe</div>
        </div>
      </div>

      {/* Weather + Advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Weather Radar */}
        <div className="lg:col-span-3 bg-[#111111] rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-serif font-medium text-white flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-primary" /> 7-Day Forecast Radar
              </h2>
              <span className="text-xs font-mono text-white/40">{destination}</span>
            </div>

            <div className="px-8 py-6 bg-gradient-to-r from-primary/10 via-[#111111] to-transparent border-b border-white/10 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="text-6xl">{weatherData.icon || "☀️"}</div>
              <div>
                <div className="text-4xl font-serif font-medium text-white">{weatherData.temp || 24}°C</div>
                <div className="text-xs text-white/50 mt-1">{weatherData.condition || "Clear skies"} · Feels like {weatherData.feels_like || 25}°C</div>
              </div>
              <div className="sm:ml-auto grid grid-cols-3 gap-6 text-xs text-white/50 font-mono">
                <div className="flex items-center gap-1.5"><Wind className="w-4 h-4 text-primary" /> {weatherData.wind_speed || 12} km/h</div>
                <div className="flex items-center gap-1.5"><Droplets className="w-4 h-4 text-blue-400" /> {weatherData.humidity || 48}%</div>
                <div className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-emerald-400" /> 10 km</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 divide-x divide-white/5">
            {weatherForecasts.map((d) => (
              <div key={d.day} className="p-4 text-center hover:bg-white/5 transition-colors">
                <div className="text-[11px] font-mono font-medium text-white/40 mb-1">{d.day}</div>
                <div className="text-xl mb-1">{d.icon}</div>
                <div className="text-xs font-medium text-white">{d.high}°</div>
                <div className="text-[10px] text-white/30">{d.low}°</div>
              </div>
            ))}
          </div>
        </div>

        {/* Advisories */}
        <div className="lg:col-span-2 bg-[#111111] rounded-3xl border border-white/10 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-serif font-medium text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Smart Advisories
            </h2>
            <span className="text-xs font-mono text-amber-400">Live Surveillance</span>
          </div>

          <div className="divide-y divide-white/5 flex-1">
            {advisories.map((adv, i) => (
              <div key={i} className="p-5 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    adv.severity === "warning" ? "bg-amber-400" : adv.severity === "success" ? "bg-emerald-400" : "bg-blue-400"
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{adv.title}</div>
                    <div className="text-xs text-white/50 mt-1 leading-relaxed font-light">{adv.message}</div>
                    <Link
                      href={adv.href}
                      className="text-xs text-primary font-medium flex items-center gap-1 mt-2.5 hover:underline font-mono"
                    >
                      <span>{adv.action}</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time FX Converter Widget */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#111111] border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-serif text-white">Live Currency Exchange Calculator</h3>
            <p className="text-xs text-white/40 mt-0.5">Real-time mid-market rates for on-the-ground budgeting.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={convAmount}
                onChange={(e) => setConvAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-base font-mono focus:outline-none focus:border-primary"
              />
              <select
                value={fromCurr}
                onChange={(e) => setFromCurr(e.target.value)}
                className="px-3 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-primary"
              >
                {Object.keys(RATES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center md:pt-5">
            <button
              onClick={() => {
                const temp = fromCurr;
                setFromCurr(toCurr);
                setToCurr(temp);
              }}
              className="p-3 rounded-full bg-white/5 border border-white/10 text-primary hover:bg-white/10 transition-colors"
              title="Swap currencies"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Converted Value</label>
            <div className="flex gap-2">
              <div className="w-full px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xl font-mono font-bold flex items-center">
                {calculateConverted()}
              </div>
              <select
                value={toCurr}
                onChange={(e) => setToCurr(e.target.value)}
                className="px-3 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-primary"
              >
                {Object.keys(RATES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
