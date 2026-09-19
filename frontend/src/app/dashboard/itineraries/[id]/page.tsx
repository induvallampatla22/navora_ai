"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Share2,
  CreditCard,
  Activity,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Plane,
  Hotel,
  Utensils,
  Camera,
  Navigation
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ItineraryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch Trip
        let tripData: any = null;
        try {
          tripData = await api.getTrip(tripId);
          setTrip(tripData);
        } catch {
          tripData = {
            id: tripId,
            title: `Voyage (${tripId.slice(0, 8)})`,
            primary_destination: "Goa, India",
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 5 * 86400000).toISOString(),
            travelers_count: 2,
            total_budget: 2500,
            currency: "USD",
            status: "PLANNED"
          };
          setTrip(tripData);
        }

        // Fetch Itinerary
        try {
          const itinData = await api.getTripItinerary(tripId);
          setItinerary(itinData);
        } catch {
          // If no active itinerary yet, fallback generated days
          setItinerary({
            id: "itin-" + tripId,
            trip_id: tripId,
            title: `${tripData?.primary_destination || "Curated"} Itinerary`,
            plan_tier: "Plan B (Comfort & Curated)",
            total_cost: tripData?.total_budget || 2200,
            currency: tripData?.currency || "USD",
            items: [
              {
                id: "item-1",
                day_number: 1,
                time_slot: "14:00",
                item_type: "Transport",
                title: `Arrival & Transfer in ${tripData?.primary_destination || "Destination"}`,
                description: "Executive vehicle transfer from arrival terminal to hotel check-in.",
                location_name: "Arrival Terminal",
                start_time: "14:00",
                duration_minutes: 60,
                cost: 45,
                currency: "USD",
                transport_mode: "Private Chauffeur",
                weather_suitability: "Optimal",
                status: "CONFIRMED"
              },
              {
                id: "item-2",
                day_number: 1,
                time_slot: "16:00",
                item_type: "Stay",
                title: "Hotel Check-In & Welcome Refreshments",
                description: "Check into your boutique resort with garden and ocean views.",
                location_name: "Heritage Boutique Resort",
                start_time: "16:00",
                duration_minutes: 60,
                cost: 180,
                currency: "USD",
                transport_mode: "Walking",
                weather_suitability: "Optimal",
                status: "CONFIRMED"
              },
              {
                id: "item-3",
                day_number: 1,
                time_slot: "19:30",
                item_type: "Dining",
                title: "Welcome Dinner at Coastal Waterside",
                description: "Curated multi-course tasting menu with local specialties.",
                location_name: "Riverside Bistro",
                start_time: "19:30",
                duration_minutes: 120,
                cost: 60,
                currency: "USD",
                transport_mode: "Walking",
                weather_suitability: "Optimal",
                status: "CONFIRMED"
              },
              {
                id: "item-4",
                day_number: 2,
                time_slot: "09:30",
                item_type: "Activity",
                title: "Guided Heritage Landmark Walk",
                description: "Private guided historical tour of ancient architecture and vibrant streets.",
                location_name: "Old Quarter",
                start_time: "09:30",
                duration_minutes: 180,
                cost: 40,
                currency: "USD",
                transport_mode: "Walking",
                weather_suitability: "Optimal",
                status: "CONFIRMED"
              },
              {
                id: "item-5",
                day_number: 2,
                time_slot: "17:00",
                item_type: "Activity",
                title: "Sunset Boat Cruise & Refreshments",
                description: "Golden hour sailing along the coastline with scenic views.",
                location_name: "Marina Pier",
                start_time: "17:00",
                duration_minutes: 120,
                cost: 75,
                currency: "USD",
                transport_mode: "Private Cab",
                weather_suitability: "Optimal",
                status: "CONFIRMED"
              }
            ]
          });
        }
      } catch (err) {
        console.warn("Error loading itinerary:", err);
      } finally {
        setLoading(false);
      }
    }

    if (tripId) {
      loadData();
    }
  }, [tripId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 text-white">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-white/50">Loading Itinerary...</p>
      </div>
    );
  }

  // Group items by day
  const itemsByDay: { [day: number]: any[] } = {};
  if (itinerary?.items) {
    itinerary.items.forEach((item: any) => {
      const d = item.day_number || 1;
      if (!itemsByDay[d]) itemsByDay[d] = [];
      itemsByDay[d].push(item);
    });
  }

  const getItemIcon = (type: string) => {
    switch ((type || "").toLowerCase()) {
      case "transport":
        return <Plane className="w-4 h-4 text-primary" />;
      case "stay":
      case "hotel":
      case "accommodation":
        return <Hotel className="w-4 h-4 text-primary" />;
      case "dining":
      case "restaurant":
        return <Utensils className="w-4 h-4 text-primary" />;
      default:
        return <Camera className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-8 pb-24 text-white max-w-5xl mx-auto">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push("/dashboard/trips")}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Trips
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 font-mono text-xs text-white/70 hover:bg-white/5 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? "Link Copied!" : "Share Itinerary"}
          </button>

          <Link href={`/dashboard/monitor?trip_id=${tripId}`}>
            <Button variant="outline" className="h-9 px-4 rounded-full border-white/10 text-xs text-white/80 hover:bg-white/5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" /> Live Monitor
            </Button>
          </Link>

          <Link href={`/dashboard/bookings?trip_id=${tripId}`}>
            <Button className="h-9 px-5 rounded-full bg-[#d4b88a] text-black font-semibold hover:bg-[#c4a87a] text-xs flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Bookings & Tickets
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-[#111111] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="relative h-64 md:h-72">
          <img
            src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop"
            alt="Itinerary Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/60 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-xs font-mono text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{itinerary?.plan_tier || "Active Plan"}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-serif text-white font-normal">
                {trip?.title || itinerary?.title || "Voyage Itinerary"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-white/70">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" /> {trip?.primary_destination || "Worldwide"}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {trip?.start_date ? new Date(trip.start_date).toLocaleDateString() : "Upcoming"} — {trip?.end_date ? new Date(trip.end_date).toLocaleDateString() : ""}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shrink-0 text-right">
              <span className="text-[10px] uppercase font-mono text-white/50 block">Total Estimated Cost</span>
              <span className="text-2xl font-serif text-[#d4b88a] font-bold">
                {itinerary?.currency || "$"} {Number(itinerary?.total_cost || 2200).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Day-by-Day Timeline */}
        <div className="p-6 md:p-10 space-y-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-2xl font-serif text-white">Daily Schedule & Highlights</h2>
            <span className="text-xs text-white/50 font-mono">
              {Object.keys(itemsByDay).length || 2} Days Planned
            </span>
          </div>

          <div className="space-y-12">
            {Object.keys(itemsByDay).length > 0 ? (
              Object.entries(itemsByDay).map(([dayNum, items]) => (
                <div key={dayNum} className="space-y-6">
                  {/* Day Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-serif text-primary font-bold text-base">
                      {dayNum}
                    </div>
                    <div>
                      <h3 className="text-xl font-serif text-white">Day {dayNum}</h3>
                      <p className="text-xs text-white/50">Curated Experiences & Transit</p>
                    </div>
                  </div>

                  {/* Day Items */}
                  <div className="ml-5 border-l-2 border-white/10 pl-6 space-y-4">
                    {items.map((item: any, idx: number) => (
                      <div
                        key={item.id || idx}
                        className="p-5 rounded-2xl bg-[#161616] border border-white/5 hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                            {getItemIcon(item.item_type)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-primary font-semibold">
                                {item.time_slot || item.start_time || "Morning"}
                              </span>
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
                                {item.item_type || "Activity"}
                              </span>
                            </div>
                            <h4 className="text-base font-serif text-white group-hover:text-primary transition-colors">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-xs text-white/60 font-sans max-w-xl leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-[11px] text-white/40 pt-1 font-mono">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-white/30" /> {item.location_name}
                              </span>
                              {item.transport_mode && (
                                <span className="flex items-center gap-1">
                                  <Navigation className="w-3 h-3 text-white/30" /> {item.transport_mode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                          {item.cost ? (
                            <span className="font-serif text-base text-[#d4b88a] font-semibold">
                              ${item.cost}
                            </span>
                          ) : (
                            <span className="text-xs text-white/40 font-mono">Included</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-white/50 text-xs">
                No items in this itinerary. Generate a plan from the Trip Planner.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
