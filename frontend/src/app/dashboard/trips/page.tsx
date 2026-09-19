"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  ChevronRight,
  Plus,
  Plane,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  X,
  Clock,
  Coins,
  Activity,
  CreditCard,
  DollarSign
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Trip {
  id: string;
  title: string;
  primary_destination?: string;
  destination?: string;
  start_date: string;
  end_date: string;
  status: string;
  image_url?: string;
  total_budget?: number;
  budget?: number;
  currency?: string;
}

const SAMPLE_TRIPS: Trip[] = [
  {
    id: "trip_amalfi_01",
    title: "Amalfi Coast & Positano Slow Travel",
    primary_destination: "Amalfi Coast, Italy",
    destination: "Amalfi Coast, Italy",
    start_date: "2026-10-10",
    end_date: "2026-10-20",
    status: "active",
    image_url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop",
    total_budget: 3500,
    currency: "USD"
  },
  {
    id: "trip_kyoto_02",
    title: "Kyoto Zen Temples & Shrines",
    primary_destination: "Kyoto, Japan",
    destination: "Kyoto, Japan",
    start_date: "2026-11-14",
    end_date: "2026-11-24",
    status: "planning",
    image_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
    total_budget: 4200,
    currency: "USD"
  },
  {
    id: "trip_goa_03",
    title: "Goa Coastal Heritage & Relaxation",
    primary_destination: "Goa, India",
    destination: "Goa, India",
    start_date: "2026-12-05",
    end_date: "2026-12-12",
    status: "completed",
    image_url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop",
    total_budget: 1200,
    currency: "USD"
  },
];

export default function MyTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>(SAMPLE_TRIPS);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "planning" | "completed">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Trip form state
  const [newTitle, setNewTitle] = useState("");
  const [newDest, setNewDest] = useState("");
  const [newStartDate, setNewStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [newEndDate, setNewEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().split("T")[0];
  });
  const [newBudget, setNewBudget] = useState("2500");
  const [newCurrency, setNewCurrency] = useState("USD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadTrips() {
      setIsLoading(true);
      try {
        const res = await api.getTrips();
        if (res && Array.isArray(res) && res.length > 0) {
          setTrips(res);
        }
      } catch (err) {
        console.warn("Using sample trips cache:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTrips();
  }, []);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDest) return;
    setIsSubmitting(true);

    try {
      const created = await api.createTrip({
        title: newTitle || `Voyage to ${newDest}`,
        primary_destination: newDest,
        destinations: [newDest],
        start_date: new Date(newStartDate).toISOString(),
        end_date: new Date(newEndDate).toISOString(),
        travelers_count: 2,
        trip_type: "Leisure",
        total_budget: parseFloat(newBudget) || 2500,
        currency: newCurrency,
        preferences: {
          starting_location: "New York, USA",
          interests: ["Culture", "Sightseeing", "Food"],
          dietary_preferences: ["Vegetarian"],
          accommodation_preferences: ["Boutique Hotel"],
          transport_preferences: ["Train", "Private Transfer"],
        }
      });

      if (created && created.id) {
        setTrips([created, ...trips]);
        setShowCreateModal(false);
        router.push(`/dashboard/itineraries/${created.id}`);
      } else {
        const mockNewTrip: Trip = {
          id: "trip_" + Date.now(),
          title: newTitle || `Voyage to ${newDest}`,
          primary_destination: newDest,
          destination: newDest,
          start_date: newStartDate,
          end_date: newEndDate,
          status: "planning",
          total_budget: parseFloat(newBudget) || 2500,
          currency: newCurrency,
          image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
        };
        setTrips([mockNewTrip, ...trips]);
        setShowCreateModal(false);
      }
      setNewTitle("");
      setNewDest("");
    } catch (err) {
      console.warn("Created locally:", err);
      setShowCreateModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTrips = trips.filter((t) => {
    if (activeFilter === "all") return true;
    return (t.status || "").toLowerCase() === activeFilter;
  });

  return (
    <div className="space-y-8 pb-20 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide">My Trips</h1>
          <p className="text-sm text-white/60 mt-1">All your planned, active, and completed journeys in one place.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/plan">
            <Button className="h-11 px-6 rounded-full bg-[#d4b88a] text-black font-semibold text-xs hover:bg-[#c4a87a] flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Plan New Trip</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {(["all", "active", "planning", "completed"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
              activeFilter === filter
                ? "bg-primary text-black font-bold"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {filter} ({filter === "all" ? trips.length : trips.filter(t => (t.status || "").toLowerCase() === filter).length})
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrips.map((trip) => {
          const destName = trip.primary_destination || trip.destination || "Destination";
          const tripBudget = trip.total_budget || trip.budget;
          const curr = trip.currency || "USD";

          return (
            <div
              key={trip.id}
              className="bg-[#111111] rounded-3xl overflow-hidden border border-white/10 hover:border-primary/40 transition-all flex flex-col justify-between shadow-xl group"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-white/5">
                  <img
                    src={trip.image_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"}
                    alt={destName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-black/30" />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md border ${
                        (trip.status || "").toLowerCase() === "active"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : (trip.status || "").toLowerCase() === "completed"
                          ? "bg-white/10 text-white/60 border-white/20"
                          : "bg-primary/20 text-primary border-primary/30"
                      }`}
                    >
                      {trip.status || "PLANNED"}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-serif text-white group-hover:text-primary transition-colors line-clamp-1">
                    {trip.title}
                  </h3>
                  <div className="space-y-1.5 text-xs text-white/60">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{destName}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{trip.start_date ? new Date(trip.start_date).toLocaleDateString() : ""} → {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : ""}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-3">
                <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5 font-mono text-white/50">
                  <span>{tripBudget ? `Budget: ${curr} ${Number(tripBudget).toLocaleString()}` : "Budget: Flexible"}</span>
                </div>

                {/* Action Links */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <Link
                    href={`/dashboard/itineraries/${trip.id}`}
                    className="py-2 text-center rounded-xl bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-all text-xs font-medium"
                  >
                    Itinerary
                  </Link>
                  <Link
                    href={`/dashboard/monitor?trip_id=${trip.id}`}
                    className="py-2 text-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-medium"
                  >
                    Monitor
                  </Link>
                  <Link
                    href={`/dashboard/bookings?trip_id=${trip.id}`}
                    className="py-2 text-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-medium"
                  >
                    Bookings
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTrips.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <p className="text-white/50 text-sm">No trips found in this category.</p>
            <Link href="/dashboard/plan">
              <Button className="rounded-full bg-primary text-black text-xs font-semibold px-6">
                Create Your First Trip
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative text-white">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-2xl font-serif text-white">Create New Trip</h2>
              <p className="text-xs text-white/50 mt-1">Add a new destination to your portfolio.</p>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/70 font-medium">Trip Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Summer in Southern Italy"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-black/50 border-white/10 text-white h-11 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-white/70 font-medium">Destination</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Paris, Goa, Kyoto..."
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value)}
                  className="bg-black/50 border-white/10 text-white h-11 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 font-medium">Start Date</label>
                  <Input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="bg-black/50 border-white/10 text-white h-11 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 font-medium">End Date</label>
                  <Input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="bg-black/50 border-white/10 text-white h-11 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 font-medium">Budget</label>
                  <Input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="bg-black/50 border-white/10 text-white h-11 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 font-medium">Currency</label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-full h-11 bg-black/50 border border-white/10 text-white rounded-xl text-xs px-3 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !newDest}
                  className="h-11 px-6 bg-primary text-black font-semibold rounded-full text-xs"
                >
                  {isSubmitting ? "Creating..." : "Create & Start Itinerary"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
