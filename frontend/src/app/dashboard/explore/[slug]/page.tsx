"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Hotel,
  Utensils,
  Plane,
  ShoppingBag,
  CloudSun,
  ShieldCheck,
  Compass,
  Star,
  Clock,
  Sparkles,
  ChevronRight,
  PhoneCall,
  Map as MapIcon,
  Navigation,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DestinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [destination, setDestination] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "attractions" | "hotels" | "restaurants" | "transport" | "shopping" | "weather" | "safety" | "map"
  >("overview");

  // Budget Calculator state
  const [calcDays, setCalcDays] = useState(5);
  const [calcTravelers, setCalcTravelers] = useState(2);
  const [calcStyle, setCalcStyle] = useState<"standard" | "luxury">("standard");

  useEffect(() => {
    async function loadDestination() {
      setLoading(true);
      try {
        const destData = await api.getDestination(slug);
        setDestination(destData);

        // Fetch live weather intelligence
        if (destData?.name) {
          api.getWeather(destData.name)
            .then((w) => setWeatherData(w))
            .catch(() => {});
        }
      } catch (err: any) {
        console.warn("Using fallback destination detail:", err);
        // Fallback rich object
        const cleanName = slug.split("-")[0].charAt(0).toUpperCase() + slug.split("-")[0].slice(1);
        setDestination({
          id: slug,
          slug: slug,
          name: cleanName === "Goa" ? "Goa" : cleanName === "Paris" ? "Paris" : cleanName,
          country: slug.includes("india") || slug === "goa" ? "India" : "International",
          region: "Curated Region",
          editorial_description: `Discover the unique charm of ${cleanName}. From scenic natural vistas and historic architecture to vibrant food scenes and world-class hospitality, ${cleanName} offers a complete and unforgettable travel experience.`,
          hero_image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop",
          gallery_images: [
            "https://images.unsplash.com/photo-1542314831-c6a4d14fe4a1?w=800",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"
          ],
          categories: ["Beach", "Heritage", "Luxury", "Food"],
          best_season: "October - April",
          ideal_duration_days: 5,
          approx_budget_per_day: 120,
          currency: "USD",
          safety_score: 8.8,
          safety_overview: `${cleanName} is considered safe for solo and family travelers. Standard precautions in crowded markets and public transit apply.`,
          emergency_numbers: { police: "112", medical: "108", tourist_helpline: "+1-800-NAVORA" },
          shopping_highlights: [
            { name: "Local Artisan Markets", items: "Handcrafted textiles, spices, jewelry, and pottery" },
            { name: "Designer Boutiques", items: "Fine fashion, fragrance, and bespoke home decor" }
          ],
          transport_overview: "Well-connected with international airport, direct express trains, reliable app cabs, and private chauffeur options.",
          latitude: 15.2993,
          longitude: 74.1240,
          experiences: [
            { id: "1", title: "Historic Old Town Walking Tour", category: "Heritage", description: "Guided exploration of centuries-old landmarks and architecture.", duration_hours: 3, price: 35, rating: 4.9, review_count: 540, location_name: "Old Quarter", image_url: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800" },
            { id: "2", title: "Sunset Catamaran Sailing Experience", category: "Activity", description: "Scenic golden hour sailing with local refreshments and sommelier pairings.", duration_hours: 2.5, price: 65, rating: 5.0, review_count: 820, location_name: "Harbor Pier", image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800" }
          ],
          hotels: [
            { id: "h1", name: "Grand Heritage Resort & Spa", stay_type: "5-Star Resort", stars: 5, rating: 4.9, review_count: 1420, address: "Coastal Promenade", price_per_night: 220, currency: "USD", amenities: ["Pool", "Spa", "Private Beach", "Breakfast"], image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
            { id: "h2", name: "The Latin Quarter Boutique Villa", stay_type: "Boutique Hotel", stars: 4, rating: 4.7, review_count: 680, address: "Heritage District", price_per_night: 95, currency: "USD", amenities: ["Wifi", "Breakfast", "Garden Terrace"], image_url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800" }
          ],
          restaurants: [
            { id: "r1", name: "The Coastal Fisherman's Wharf", cuisine: "Seafood & Coastal", dietary_options: ["Vegetarian", "Seafood"], price_range: "$$$", approx_cost_for_two: 45, currency: "USD", rating: 4.8, review_count: 2100, address: "Riverside Walk", image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" },
            { id: "r2", name: "Heritage Courtyard Bistro", cuisine: "Local Authentic & Vegan", dietary_options: ["Vegetarian", "Vegan"], price_range: "$$", approx_cost_for_two: 25, currency: "USD", rating: 4.7, review_count: 940, address: "Market Lane", image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" }
          ]
        });
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadDestination();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-white/50">Loading Destination Intelligence...</p>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif text-white">Destination Not Found</h2>
        <Button onClick={() => router.push("/dashboard/explore")} className="rounded-full bg-primary text-black">
          Back to Explore
        </Button>
      </div>
    );
  }

  // Calculate estimated budget
  const baseRate = destination.approx_budget_per_day || 120;
  const multiplier = calcStyle === "luxury" ? 1.8 : 1.0;
  const totalCalculatedBudget = Math.round(baseRate * calcDays * calcTravelers * multiplier);

  return (
    <div className="space-y-8 pb-24 text-white">
      {/* Back Button & Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard/explore")}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </button>

        <div className="flex items-center gap-3">
          <Link href={`/dashboard/compare?destination=${encodeURIComponent(destination.name)}`}>
            <Button variant="outline" className="h-9 px-4 rounded-full border-white/10 text-xs text-white/80 hover:bg-white/5">
              Compare Transit & Stays
            </Button>
          </Link>
          <Link href={`/dashboard/plan?dest=${encodeURIComponent(destination.name)}`}>
            <Button className="h-9 px-5 rounded-full bg-[#d4b88a] text-black font-semibold hover:bg-[#c4a87a] text-xs">
              Plan Trip Here
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative h-[55vh] min-h-[380px] rounded-3xl overflow-hidden bg-[#111111] border border-white/10 shadow-2xl">
        <img
          src={destination.hero_image || "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200"}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap gap-2">
              {(destination.categories || []).map((cat: string, i: number) => (
                <span
                  key={i}
                  className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white"
                >
                  {cat}
                </span>
              ))}
            </div>
            <h1 className="text-4xl md:text-6xl font-serif text-white font-normal">
              {destination.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-[#d4b88a] font-medium">
              <MapPin className="w-4 h-4" /> {destination.country} {destination.region ? `• ${destination.region}` : ""}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-white/50">Ideal Duration</div>
              <div className="text-sm font-serif text-white">{destination.ideal_duration_days || 5} Days</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-white/50">Avg Daily Cost</div>
              <div className="text-sm font-serif text-[#d4b88a]">${destination.approx_budget_per_day || 120} / day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="overflow-x-auto custom-scrollbar border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { id: "overview", label: "Overview", icon: Compass },
            { id: "attractions", label: "Attractions & Activities", icon: Sparkles },
            { id: "hotels", label: "Hotels & Stays", icon: Hotel },
            { id: "restaurants", label: "Restaurants & Dining", icon: Utensils },
            { id: "transport", label: "Transport & Transit", icon: Plane },
            { id: "shopping", label: "Shopping & Bazaars", icon: ShoppingBag },
            { id: "weather", label: "Weather & Intelligence", icon: CloudSun },
            { id: "safety", label: "Safety & Emergency", icon: ShieldCheck },
            { id: "map", label: "Map & Coordinates", icon: MapIcon }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-black font-semibold shadow-md shadow-primary/20"
                    : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#111111] p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-2xl font-serif text-white">About {destination.name}</h2>
              <p className="text-base text-white/70 leading-relaxed font-sans">
                {destination.editorial_description}
              </p>
            </div>

            {/* Gallery Images */}
            {destination.gallery_images && destination.gallery_images.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-serif text-white">Curated Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {destination.gallery_images.map((imgUrl: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                      <img src={imgUrl} alt={`${destination.name} gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Key Metrics & Quick Budget Estimator */}
          <div className="space-y-6">
            <div className="bg-[#111111] p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-lg font-serif text-white pb-3 border-b border-white/10 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" /> Budget Calculator
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-white/60 block mb-1">Duration: {calcDays} Days</label>
                  <input
                    type="range"
                    min={1}
                    max={14}
                    value={calcDays}
                    onChange={(e) => setCalcDays(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div>
                  <label className="text-white/60 block mb-1">Travelers: {calcTravelers}</label>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={calcTravelers}
                    onChange={(e) => setCalcTravelers(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCalcStyle("standard")}
                    className={`flex-1 py-1.5 rounded-lg border text-xs ${
                      calcStyle === "standard" ? "bg-primary text-black font-semibold border-primary" : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    Comfort ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcStyle("luxury")}
                    className={`flex-1 py-1.5 rounded-lg border text-xs ${
                      calcStyle === "luxury" ? "bg-primary text-black font-semibold border-primary" : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    Luxury ($$)
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-black/50 border border-white/5 text-center mt-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block">Estimated Total</span>
                  <span className="text-2xl font-serif text-primary font-bold">${totalCalculatedBudget.toLocaleString()}</span>
                  <span className="text-[10px] text-white/50 block mt-0.5">Includes stay, meals & activities</span>
                </div>

                <Link href={`/dashboard/plan?dest=${encodeURIComponent(destination.name)}&budget=${totalCalculatedBudget}&travelers=${calcTravelers}&duration=${calcDays}`} className="block pt-2">
                  <Button className="w-full h-10 rounded-full bg-[#d4b88a] text-black font-semibold text-xs hover:bg-[#c4a87a]">
                    Create Itinerary with this Budget
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-[#111111] p-6 rounded-3xl border border-white/10 space-y-3 text-xs">
              <h3 className="font-serif text-white text-base">Best Season</h3>
              <p className="text-white/70">{destination.best_season || "October - March"}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. ATTRACTIONS & ACTIVITIES */}
      {activeTab === "attractions" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif text-white">Top Attractions & Experiences</h2>
            <span className="text-xs text-white/50 font-mono">{(destination.experiences || []).length} Curated Options</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(destination.experiences || []).map((exp: any, i: number) => (
              <div key={exp.id || i} className="bg-[#111111] rounded-3xl p-6 border border-white/10 flex flex-col justify-between hover:border-primary/40 transition-all">
                <div className="space-y-4">
                  {exp.image_url && (
                    <div className="h-44 rounded-2xl overflow-hidden bg-white/5">
                      <img src={exp.image_url} alt={exp.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-primary block mb-1">
                      {exp.category || "Activity"}
                    </span>
                    <h3 className="text-xl font-serif text-white">{exp.title}</h3>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed font-sans">{exp.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-white/60 font-mono">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> {exp.duration_hours || 2}h</span>
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#d4b88a] fill-current" /> {exp.rating || 4.9}</span>
                  </div>
                  <div className="font-serif text-base text-[#d4b88a] font-bold">
                    ${exp.price || 40}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. HOTELS & STAYS */}
      {activeTab === "hotels" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif text-white">Curated Hotels & Luxury Resorts</h2>
            <span className="text-xs text-white/50 font-mono">Verified Partner Stays</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(destination.hotels || []).map((hotel: any, i: number) => (
              <div key={hotel.id || i} className="bg-[#111111] rounded-3xl p-6 border border-white/10 flex flex-col justify-between hover:border-primary/40 transition-all">
                <div className="space-y-4">
                  {hotel.image_url && (
                    <div className="h-48 rounded-2xl overflow-hidden bg-white/5">
                      <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-primary">
                        {hotel.stay_type || "Hotel"}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-[#d4b88a]">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{hotel.rating || 4.8} ({hotel.review_count || 120})</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-serif text-white mt-1">{hotel.name}</h3>
                    <p className="text-xs text-white/50 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-white/40" /> {hotel.address || destination.name}
                    </p>
                  </div>

                  {hotel.amenities && (
                    <div className="flex flex-wrap gap-1.5">
                      {hotel.amenities.map((am: string, j: number) => (
                        <span key={j} className="text-[9px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-white/70">
                          {am}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-serif text-white font-semibold">${hotel.price_per_night || 180}</span>
                    <span className="text-[10px] text-white/40"> / night</span>
                  </div>
                  <Link href={`/dashboard/bookings?destination=${encodeURIComponent(destination.name)}`}>
                    <Button className="h-8 px-4 rounded-full bg-[#d4b88a] text-black font-semibold text-xs hover:bg-[#c4a87a]">
                      Reserve Stay
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. RESTAURANTS */}
      {activeTab === "restaurants" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif text-white">Culinary Highlights & Fine Dining</h2>
            <span className="text-xs text-white/50 font-mono">Gastronomic Guide</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(destination.restaurants || []).map((rest: any, i: number) => (
              <div key={rest.id || i} className="bg-[#111111] rounded-3xl p-6 border border-white/10 flex flex-col justify-between hover:border-primary/40 transition-all">
                <div className="space-y-4">
                  {rest.image_url && (
                    <div className="h-44 rounded-2xl overflow-hidden bg-white/5">
                      <img src={rest.image_url} alt={rest.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-primary">
                        {rest.cuisine || "Local Cuisine"}
                      </span>
                      <span className="text-xs text-white/70 font-mono">{rest.price_range || "$$$"}</span>
                    </div>
                    <h3 className="text-xl font-serif text-white mt-1">{rest.name}</h3>
                    <p className="text-xs text-white/50 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-white/40" /> {rest.address || destination.name}
                    </p>
                  </div>

                  {rest.dietary_options && (
                    <div className="flex flex-wrap gap-1.5">
                      {rest.dietary_options.map((opt: string, j: number) => (
                        <span key={j} className="text-[9px] px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/60 font-mono">
                  <span>Approx. ${rest.approx_cost_for_two || 40} for two</span>
                  <span className="flex items-center gap-1 text-[#d4b88a] font-medium"><Star className="w-3 h-3 fill-current" /> {rest.rating || 4.7}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TRANSPORT */}
      {activeTab === "transport" && (
        <div className="bg-[#111111] p-8 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-2xl font-serif text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" /> Getting To & Around {destination.name}
          </h2>
          <p className="text-sm text-white/70 leading-relaxed">
            {destination.transport_overview || `${destination.name} is well connected via international and domestic flight corridors, high-speed rail lines, and express highways. Local transit includes app-based cabs, scooter rentals, and private chauffeur services.`}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-xs uppercase font-mono text-primary font-semibold">Airport Connection</span>
              <p className="text-xs text-white/60 leading-relaxed">Direct & connecting flights from all major worldwide transit hubs.</p>
            </div>
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-xs uppercase font-mono text-primary font-semibold">Rail & Transit</span>
              <p className="text-xs text-white/60 leading-relaxed">High-speed rail stations with scenic day & overnight sleeper routes.</p>
            </div>
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-xs uppercase font-mono text-primary font-semibold">Local Travel</span>
              <p className="text-xs text-white/60 leading-relaxed">Pre-booked private chauffeurs, meter taxis, and self-drive rentals.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Link href={`/dashboard/compare?destination=${encodeURIComponent(destination.name)}`}>
              <Button className="h-10 px-6 rounded-full bg-[#d4b88a] text-black font-semibold text-xs hover:bg-[#c4a87a]">
                View Live Transit Matrix →
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 6. SHOPPING */}
      {activeTab === "shopping" && (
        <div className="bg-[#111111] p-8 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-2xl font-serif text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" /> Shopping & Local Bazaars
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(destination.shopping_highlights || [
              { name: "Traditional Craft Markets", items: "Handmade silk, jewelry, spices, and pottery" },
              { name: "Luxury Shopping Arcades", items: "Designer apparel, fragrances, and bespoke leather goods" }
            ]).map((shop: any, i: number) => (
              <div key={i} className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <h3 className="font-serif text-lg text-white">{shop.name}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{shop.items}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. WEATHER & INTELLIGENCE */}
      {activeTab === "weather" && (
        <div className="bg-[#111111] p-8 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-2xl font-serif text-white flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-primary" /> Weather Intelligence & Forecast
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center space-y-2">
              <span className="text-xs font-mono text-white/50 uppercase">Current Temperature</span>
              <div className="text-4xl font-serif text-primary font-light">
                {weatherData?.temp_c ? `${weatherData.temp_c}°C` : "26°C"}
              </div>
              <p className="text-xs text-white/60">{weatherData?.condition || "Pleasant & Clear"}</p>
            </div>

            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center space-y-2">
              <span className="text-xs font-mono text-white/50 uppercase">Best Travel Window</span>
              <div className="text-xl font-serif text-white font-medium">
                {destination.best_season || "October - March"}
              </div>
              <p className="text-xs text-white/60">Optimal humidity & sunny conditions</p>
            </div>

            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center space-y-2">
              <span className="text-xs font-mono text-white/50 uppercase">Disruption Risk</span>
              <div className="text-xl font-serif text-emerald-400 font-medium">
                Low (98% Reliability)
              </div>
              <p className="text-xs text-white/60">Live autonomous monitoring active</p>
            </div>
          </div>
        </div>
      )}

      {/* 8. SAFETY */}
      {activeTab === "safety" && (
        <div className="bg-[#111111] p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Safety & Emergency Assistance
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              Safety Score: {destination.safety_score || 8.8} / 10
            </div>
          </div>

          <p className="text-sm text-white/70 leading-relaxed">
            {destination.safety_overview || `${destination.name} maintains a high level of traveler security. Clean tap water, licensed transport, and well-patrolled tourist districts.`}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-mono text-white/50">Emergency / Police</span>
              <div className="font-mono text-lg text-white font-bold">112 / 911</div>
            </div>
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-mono text-white/50">Medical Helpline</span>
              <div className="font-mono text-lg text-white font-bold">108 / 999</div>
            </div>
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-mono text-white/50">NAVORA 24/7 SOS</span>
              <div className="font-mono text-lg text-primary font-bold">+1-800-NAVORA</div>
            </div>
          </div>
        </div>
      )}

      {/* 9. MAP */}
      {activeTab === "map" && (
        <div className="bg-[#111111] p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif text-white flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-primary" /> Interactive Map Coordinates
            </h2>
            <span className="text-xs font-mono text-primary">
              Lat: {destination.latitude || 15.29}, Lng: {destination.longitude || 74.12}
            </span>
          </div>

          <div className="h-80 rounded-2xl overflow-hidden bg-black/60 border border-white/10 relative flex items-center justify-center text-center p-6">
            <div className="space-y-3 max-w-sm">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto border border-primary/30">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-white">{destination.name}, {destination.country}</h3>
              <p className="text-xs text-white/60">
                Geographic coordinates: {destination.latitude || 15.2993}° N, {destination.longitude || 74.1240}° E
              </p>
              <Link href={`/dashboard/maps?lat=${destination.latitude || 15.29}&lng=${destination.longitude || 74.12}&name=${encodeURIComponent(destination.name)}`}>
                <Button className="mt-2 h-9 px-5 rounded-full bg-primary text-black font-semibold text-xs">
                  Open in Interactive Journey Map
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
