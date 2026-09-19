"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Calendar,
  Compass,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Coins,
  Plane,
  CloudSun,
  AlertTriangle,
  GitCompare,
  Activity,
  Bot,
  Clock,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function DashboardControlCenter() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    api.getTrips().then(data => {
      if (Array.isArray(data)) setTrips(data);
      setLoadingTrips(false);
    }).catch(() => setLoadingTrips(false));
  }, []);

  const activeTrip = trips.length > 0 ? trips[0] : null;

  const [stats, setStats] = useState({
    activeTrips: 1,
    savedItineraries: 4,
    coins: 1250,
    upcomingFlightStatus: "On Schedule",
  });
  const [weatherAlert, setWeatherAlert] = useState<{
    city: string;
    temp: string;
    condition: string;
    risk: "LOW" | "MODERATE" | "HIGH";
    advice: string;
  }>({
    city: "Kyoto, Japan",
    temp: "22°C",
    condition: "Partly Cloudy",
    risk: "LOW",
    advice: "Optimal autumn weather expected. Outdoor shrine walks highly recommended.",
  });

  const firstName = user?.full_name?.split(" ")[0] || "Traveler";

  return (
    <div className="space-y-8 pb-20">
      {/* Welcome & Command Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#121212] via-[#0c0c0c] to-[#080808] p-8 md:p-10 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Your Personal Travel Assistant</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-light text-white tracking-wide">
            Welcome back, <span className="font-normal italic text-primary">{firstName}</span>.
          </h1>
          <p className="text-sm md:text-base text-white/60 font-light leading-relaxed">
            Your AI assistant is ready to help you plan, book, and manage your perfect trip.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/plan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-semibold text-xs tracking-wider uppercase hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Plan a Trip</span>
            </Link>
            <Link
              href="/dashboard/compare"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-xs tracking-wider uppercase hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <GitCompare className="w-4 h-4 text-primary" />
              <span>Compare Prices</span>
            </Link>
            <Link
              href="/dashboard/replan"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-xs tracking-wider uppercase hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-primary" />
              <span>Manage Disruptions</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between text-white/40 mb-3">
            <span className="text-xs uppercase tracking-widest font-mono">Active Voyage</span>
            <Plane className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-serif text-white mb-1">Amalfi & Florence</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Flight AF114 • On Schedule
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between text-white/40 mb-3">
            <span className="text-xs uppercase tracking-widest font-mono">NAVORA Coins</span>
            <Coins className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-serif text-white mb-1">1,250</div>
          <div className="text-xs text-primary/80 flex items-center justify-between">
            <span>Worth ₹1,250 in discounts</span>
            <Link href="/dashboard/coins" className="hover:underline text-[11px]">Redeem →</Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between text-white/40 mb-3">
            <span className="text-xs uppercase tracking-widest font-mono">Weather Intelligence</span>
            <CloudSun className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-serif text-white mb-1">{weatherAlert.temp}</div>
          <div className="text-xs text-white/60">
            {weatherAlert.city} • {weatherAlert.condition}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between text-white/40 mb-3">
            <span className="text-xs uppercase tracking-widest font-mono">Autonomous Protection</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-serif text-white mb-1">Active Guard</div>
          <div className="text-xs text-emerald-400/80">
            Zero Disruption Alerts
          </div>
        </div>
      </div>

      {/* Primary Split: Active Voyage Control + Intelligence Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Voyage Card (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-[#0c0c0c] border border-white/10 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary block mb-1">Next Destination</span>
                {activeTrip ? (
                  <>
                    <h2 className="text-2xl md:text-3xl font-serif text-white">{activeTrip.title || `Trip to ${activeTrip.primary_destination}`}</h2>
                    <div className="flex items-center gap-3 text-xs text-white/50 mt-2 font-mono">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary" /> {new Date(activeTrip.start_date).toLocaleDateString()} – {new Date(activeTrip.end_date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" /> {activeTrip.travelers_count} Travelers</span>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl md:text-3xl font-serif text-white">No Upcoming Trips</h2>
                    <div className="flex items-center gap-3 text-xs text-white/50 mt-2 font-mono">
                      <span>Ready for your next adventure?</span>
                    </div>
                  </>
                )}
              </div>

              <Link
                href="/dashboard/itineraries"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white transition-all flex items-center gap-2"
              >
                <span>Full Itinerary</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Next Scheduled Actions */}
            <div className="p-6 md:p-8 space-y-4">
            {activeTrip ? (
              <>
              <span className="text-xs font-mono uppercase tracking-widest text-white/40">Today's Timeline</span>
              
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-medium text-white/60">Your itinerary is being prepared by our AI...</p>
                  </div>
                </div>
              </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Link href="/dashboard/plan" className="px-6 py-3 rounded-xl bg-primary text-black font-semibold text-sm hover:bg-primary/90 transition-colors">
                  Plan a New Trip
                </Link>
              </div>
            )}
            </div>
          </div>

          {/* Quick Hub Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/dashboard/explore"
              className="p-4 rounded-2xl bg-[#0e0e0e] border border-white/5 hover:border-primary/40 transition-all text-center group"
            >
              <Compass className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-white block">Explore Destinations</span>
              <span className="text-[10px] text-white/40">15 Curated Categories</span>
            </Link>

            <Link
              href="/dashboard/compare"
              className="p-4 rounded-2xl bg-[#0e0e0e] border border-white/5 hover:border-primary/40 transition-all text-center group"
            >
              <GitCompare className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-white block">Price Matrix</span>
              <span className="text-[10px] text-white/40">OTAs vs Local Stays</span>
            </Link>

            <Link
              href="/dashboard/bookings"
              className="p-4 rounded-2xl bg-[#0e0e0e] border border-white/5 hover:border-primary/40 transition-all text-center group"
            >
              <Clock className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-white block">Bookings & Vouchers</span>
              <span className="text-[10px] text-white/40">Instant Confirmation</span>
            </Link>

            <Link
              href="/dashboard/coins"
              className="p-4 rounded-2xl bg-[#0e0e0e] border border-white/5 hover:border-primary/40 transition-all text-center group"
            >
              <Coins className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-white block">NAVORA Coins</span>
              <span className="text-[10px] text-white/40">1,250 Available</span>
            </Link>
          </div>
        </div>

        {/* Intelligence & Autopilot Column */}
        <div className="space-y-6">
          {/* Weather Risk Card */}
          <div className="p-6 rounded-3xl bg-[#0c0c0c] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-white/40">Weather</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Risk: Low
              </span>
            </div>
            <div>
              <div className="text-3xl font-serif text-white">{weatherAlert.temp}</div>
              <p className="text-xs text-white/60 font-medium">{weatherAlert.city} • {weatherAlert.condition}</p>
            </div>
            <p className="text-xs text-white/70 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
              {weatherAlert.advice}
            </p>
          </div>

          {/* Autonomous Replanning Simulator Prompt */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#141414] to-[#0d0d0d] border border-primary/20 space-y-4">
            <div className="flex items-center gap-2 text-primary text-xs font-mono uppercase tracking-wider">
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Smart Replanning Hub</span>
            </div>
            <h3 className="text-lg font-serif text-white">Disruption Simulator</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Test how our autonomous agents recalculate connecting trains, dining reservations, and hotel check-ins during flight delays.
            </p>
            <Link
              href="/dashboard/replan"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
            >
              <span>Launch Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Agent Fleet Activity Log */}
          <div className="p-6 rounded-3xl bg-[#0c0c0c] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-white/40 uppercase tracking-wider">
              <span>AI Assistants</span>
              <span className="text-primary">18 Online</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-white/70 py-1 border-b border-white/5">
                <span className="flex items-center gap-2"><Bot className="w-3.5 h-3.5 text-primary" /> Route Assistant</span>
                <span className="text-[10px] text-white/40 font-mono">Synced 2m ago</span>
              </div>
              <div className="flex items-center justify-between text-white/70 py-1 border-b border-white/5">
                <span className="flex items-center gap-2"><Bot className="w-3.5 h-3.5 text-primary" /> Fare Finder</span>
                <span className="text-[10px] text-white/40 font-mono">Found 18% saving</span>
              </div>
              <div className="flex items-center justify-between text-white/70 py-1">
                <span className="flex items-center gap-2"><Bot className="w-3.5 h-3.5 text-primary" /> Weather Monitor</span>
                <span className="text-[10px] text-emerald-400 font-mono">Clear forecast</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
