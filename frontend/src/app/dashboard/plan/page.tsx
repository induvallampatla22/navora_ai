"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Utensils,
  Hotel,
  Plane,
  Train,
  Car,
  Compass,
  Check,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface DestinationSuggestion {
  name: string;
  country: string;
  reason: string;
  budgetEst: string;
  vibe: string;
}

function PlanWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form State
  const [origin, setOrigin] = useState("New York, USA");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 20);
    return d.toISOString().split("T")[0];
  });
  const [travelers, setTravelers] = useState(2);
  const [tripType, setTripType] = useState("Leisure");
  const [budget, setBudget] = useState(2500);
  const [currency, setCurrency] = useState("USD");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Culture & Heritage",
    "Food & Wine",
    "Scenic Nature"
  ]);
  const [foodPreference, setFoodPreference] = useState("Vegetarian & Local Cuisine");
  const [hotelPreference, setHotelPreference] = useState("Boutique Heritage Stays");
  const [transportPreference, setTransportPreference] = useState("Train & Private Transfer");

  // Step / Generation State
  const [currentStep, setCurrentStep] = useState<"form" | "plans" | "saving">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);
  const [generatedPlans, setGeneratedPlans] = useState<any[]>([]);
  const [selectedPlanTier, setSelectedPlanTier] = useState<string>("Plan B");

  // Destination Suggestions Modal / Panel
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsList, setSuggestionsList] = useState<DestinationSuggestion[]>([]);

  // Pre-fill destination from query param if available
  useEffect(() => {
    const destParam = searchParams.get("dest") || searchParams.get("destination");
    if (destParam) {
      setDestination(destParam.charAt(0).toUpperCase() + destParam.slice(1).replace(/-/g, " "));
    }
  }, [searchParams]);

  // Calculate duration
  const durationDays = Math.max(
    1,
    Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSuggestDestinations = async () => {
    setShowSuggestions(true);
    setSuggestionsLoading(true);
    try {
      // Fetch available destinations from catalog
      const catalog = await api.getDestinations(undefined, undefined, 20);
      if (catalog && catalog.length > 0) {
        const mapped = catalog.slice(0, 6).map((c) => ({
          name: `${c.name}`,
          country: c.country,
          reason: `Ideal for ${selectedInterests.slice(0, 2).join(" & ") || "travel"} with great seasonal weather.`,
          budgetEst: `$${c.approx_budget_per_day * durationDays} approx.`,
          vibe: (c.categories || []).slice(0, 3).join(" • "),
        }));
        setSuggestionsList(mapped);
      } else {
        setSuggestionsList([
          { name: "Goa", country: "India", reason: "Sun, sea, Portuguese heritage villas, and slow living.", budgetEst: "$600 - $1,200", vibe: "Beach • Luxury • Food" },
          { name: "Kyoto", country: "Japan", reason: "Historic shrines, bamboo groves, and world-class culinary art.", budgetEst: "$1,800 - $3,200", vibe: "Heritage • Spiritual • Culture" },
          { name: "Swiss Alps (Zermatt)", country: "Switzerland", reason: "Soaring alpine peaks, scenic mountain trains, and luxury chalets.", budgetEst: "$2,500 - $4,500", vibe: "Mountains • Nature • Luxury" },
          { name: "Paris", country: "France", reason: "World-class museums, Seine river walks, and Michelin gastronomy.", budgetEst: "$2,000 - $3,800", vibe: "Culture • Romantic • Food" },
        ]);
      }
    } catch {
      setSuggestionsList([
        { name: "Goa", country: "India", reason: "Sun, sea, Portuguese heritage villas, and slow living.", budgetEst: "$600 - $1,200", vibe: "Beach • Luxury • Food" },
        { name: "Kyoto", country: "Japan", reason: "Historic shrines, bamboo groves, and world-class culinary art.", budgetEst: "$1,800 - $3,200", vibe: "Heritage • Spiritual • Culture" },
        { name: "Swiss Alps", country: "Switzerland", reason: "Soaring alpine peaks, scenic mountain trains, and luxury chalets.", budgetEst: "$2,500 - $4,500", vibe: "Mountains • Nature • Luxury" },
      ]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleGeneratePlans = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError("Please specify a destination or pick from suggestions.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 1. Create Trip in backend DB
      const tripPayload = {
        title: `${tripType} Journey to ${destination}`,
        primary_destination: destination.trim(),
        destinations: [destination.trim()],
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        travelers_count: Number(travelers),
        trip_type: tripType,
        total_budget: Number(budget),
        currency: currency,
        preferences: {
          starting_location: origin.trim(),
          interests: selectedInterests,
          dietary_preferences: [foodPreference],
          accommodation_preferences: [hotelPreference],
          transport_preferences: [transportPreference],
          weather_preference: "Mild and Sunny",
          accessibility_requirements: [],
          things_to_avoid: [],
        },
      };

      const trip = await api.createTrip(tripPayload);
      setCreatedTripId(trip.id);

      // 2. Generate Plans A/B/C
      const planRes = await api.generatePlans(trip.id);
      if (planRes && planRes.plans && planRes.plans.length > 0) {
        setGeneratedPlans(planRes.plans);
        setSelectedPlanTier(planRes.plans[1]?.plan_tier || planRes.plans[0]?.plan_tier || "Plan B");
      } else {
        // Fallback robust tier data
        setGeneratedPlans([
          {
            plan_tier: "Plan A",
            title: "Value & Smart Explorer",
            total_cost: Math.round(budget * 0.75),
            remaining_budget: Math.round(budget * 0.25),
            currency: currency,
            fit_rationale: "Maximizes local experiences while preserving 25% of budget for spontaneous activities.",
            trade_offs: "Comfort stays & high-speed rail with self-guided highlights.",
            hotel: { name: `Heritage Boutique Stay in ${destination}`, cost_per_night: Math.round(budget * 0.75 / (durationDays * 2)) },
            transport: { mode: "High-Speed Rail / Direct Transit", provider: "National Express", cost: Math.round(budget * 0.2) },
            estimated_daily_expenses: Math.round(budget * 0.75 / durationDays),
          },
          {
            plan_tier: "Plan B",
            title: "Balanced & Curated Comfort",
            total_cost: Math.round(budget * 0.92),
            remaining_budget: Math.round(budget * 0.08),
            currency: currency,
            fit_rationale: "Perfect balance of top-tier boutique hotels, private transfers, and curated excursions.",
            trade_offs: "Premium stays with private guided cultural passes.",
            hotel: { name: `4-Star Luxury Resort in ${destination}`, cost_per_night: Math.round(budget * 0.92 / (durationDays * 1.8)) },
            transport: { mode: "Direct Transit + Private Chauffeur", provider: "NAVORA Chauffeur Suite", cost: Math.round(budget * 0.28) },
            estimated_daily_expenses: Math.round(budget * 0.92 / durationDays),
          },
          {
            plan_tier: "Plan C",
            title: "Premium Bespoke Experience",
            total_cost: Math.round(budget * 1.05),
            remaining_budget: 0,
            currency: currency,
            fit_rationale: "All-inclusive 5-star luxury with private helicopter/catamaran charters and sommelier pairings.",
            trade_offs: "Higher cost but zero compromise on privacy and exclusivity.",
            hotel: { name: `5-Star Palace & Spa Suite in ${destination}`, cost_per_night: Math.round(budget * 1.05 / (durationDays * 1.5)) },
            transport: { mode: "First Class / Private Executive Transfer", provider: "Elite Voyager Fleet", cost: Math.round(budget * 0.38) },
            estimated_daily_expenses: Math.round(budget * 1.05 / durationDays),
          },
        ]);
      }

      setCurrentStep("plans");
    } catch (err: any) {
      setError(err.message || "Failed to generate AI trip plan. Please verify inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndSaveItinerary = async () => {
    if (!createdTripId) return;

    setLoading(true);
    setError("");

    try {
      await api.selectPlan(createdTripId, selectedPlanTier);
      router.push(`/dashboard/itineraries/${createdTripId}`);
    } catch (err: any) {
      // If error or already selected, still navigate to trip itinerary
      router.push(`/dashboard/itineraries/${createdTripId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6 pb-20 text-white">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Trip Planner</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-normal text-white">
            {currentStep === "form" ? "Plan Your Next Journey" : "Compare & Select Your Plan"}
          </h1>
          <p className="text-sm text-white/60 mt-1">
            {currentStep === "form"
              ? "Tell us your travel preferences and our AI will build three customized itineraries."
              : `Review the customized plans generated for your ${durationDays}-day trip to ${destination}.`}
          </p>
        </div>

        {currentStep === "plans" && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep("form")}
            className="border-white/10 text-white/70 hover:bg-white/5 text-xs rounded-full"
          >
            ← Modify Preferences
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs text-center">
          {error}
        </div>
      )}

      {/* STEP 1: PREFERENCES FORM */}
      {currentStep === "form" && (
        <form onSubmit={handleGeneratePlans} className="space-y-8">
          {/* Main Route & Dates Card */}
          <div className="bg-[#111111] p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-xl font-serif text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Route & Schedule
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Origin */}
              <div className="space-y-2">
                <label className="text-xs text-white/70 font-medium">Starting Location (Origin)</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. New York, London, Mumbai..."
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="h-12 bg-black/50 border-white/10 text-white rounded-xl text-sm"
                />
              </div>

              {/* Destination with Suggestion Trigger */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-white/70 font-medium">Destination</label>
                  <button
                    type="button"
                    onClick={handleSuggestDestinations}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-mono"
                  >
                    <Compass className="w-3 h-3" /> Don&apos;t know? Suggest for me
                  </button>
                </div>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Goa, Kyoto, Swiss Alps, Paris..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="h-12 bg-black/50 border-white/10 text-white rounded-xl text-sm focus:border-primary/50"
                />
              </div>
            </div>

            {/* Destination Suggestions Modal / Panel */}
            {showSuggestions && (
              <div className="bg-black/60 p-6 rounded-2xl border border-primary/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono tracking-wider text-primary">
                    Recommended Destinations For You
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="text-xs text-white/40 hover:text-white"
                  >
                    ✕ Close
                  </button>
                </div>

                {suggestionsLoading ? (
                  <div className="flex justify-center py-6">
                    <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {suggestionsList.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setDestination(s.name);
                          setShowSuggestions(false);
                        }}
                        className="p-4 rounded-xl bg-[#181818] border border-white/5 hover:border-primary/50 text-left transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-serif text-sm text-white group-hover:text-primary">{s.name}</span>
                          <span className="text-[10px] text-white/40 font-mono">{s.country}</span>
                        </div>
                        <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed mb-2">{s.reason}</p>
                        <div className="text-[10px] font-mono text-primary/80">{s.vibe}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dates & Travelers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs text-white/70 font-medium">Start Date</label>
                <Input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-12 bg-black/50 border-white/10 text-white rounded-xl text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/70 font-medium">End Date</label>
                <Input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-12 bg-black/50 border-white/10 text-white rounded-xl text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/70 font-medium">
                  Travelers ({durationDays} days total)
                </label>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full h-12 bg-black/50 border border-white/10 text-white rounded-xl text-sm px-4 focus:outline-none focus:border-primary"
                >
                  <option value={1}>1 Traveler (Solo)</option>
                  <option value={2}>2 Travelers (Couple)</option>
                  <option value={3}>3 Travelers (Small Group)</option>
                  <option value={4}>4 Travelers (Family / Friends)</option>
                  <option value={6}>6+ Travelers (Large Party)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Budget & Trip Type Card */}
          <div className="bg-[#111111] p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-xl font-serif text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Budget & Trip Style
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Trip Type */}
              <div className="space-y-2">
                <label className="text-xs text-white/70 font-medium">Trip Type</label>
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-full h-12 bg-black/50 border border-white/10 text-white rounded-xl text-sm px-4 focus:outline-none focus:border-primary"
                >
                  <option value="Leisure">Leisure & Relaxation</option>
                  <option value="Romantic">Romantic Getaway</option>
                  <option value="Adventure">Adventure & Exploration</option>
                  <option value="Family">Family Holiday</option>
                  <option value="Cultural">Cultural & Spiritual</option>
                  <option value="Wellness">Wellness & Spa Retreat</option>
                </select>
              </div>

              {/* Total Budget */}
              <div className="space-y-2">
                <label className="text-xs text-white/70 font-medium">Total Budget</label>
                <Input
                  type="number"
                  required
                  min={100}
                  step={50}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="h-12 bg-black/50 border-white/10 text-white rounded-xl text-sm"
                />
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <label className="text-xs text-white/70 font-medium">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-12 bg-black/50 border border-white/10 text-white rounded-xl text-sm px-4 focus:outline-none focus:border-primary"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interests & Preferences Card */}
          <div className="bg-[#111111] p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-xl font-serif text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Interests & Logistics Preferences
            </h2>

            {/* Interest Pills */}
            <div className="space-y-2">
              <label className="text-xs text-white/70 font-medium block">
                Interests (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Culture & Heritage",
                  "Food & Wine",
                  "Scenic Nature",
                  "Beaches & Watersports",
                  "Luxury Stays",
                  "Spiritual & Sacred Sites",
                  "Adventure & Trekking",
                  "Shopping & Bazaars",
                  "Nightlife & Lounges",
                  "Wildlife & Safaris",
                ].map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-black font-semibold shadow-sm"
                          : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/5"
                      }`}
                    >
                      {isSelected ? `✓ ${interest}` : interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
              {/* Food Preference */}
              <div className="space-y-2">
                <label className="text-xs text-white/70 font-medium flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-primary" /> Food Preference
                </label>
                <select
                  value={foodPreference}
                  onChange={(e) => setFoodPreference(e.target.value)}
                  className="w-full h-11 bg-black/50 border border-white/10 text-white rounded-xl text-xs px-3 focus:outline-none"
                >
                  <option value="Vegetarian & Local Cuisine">Vegetarian & Local Cuisine</option>
                  <option value="Vegan Only">Vegan Only</option>
                  <option value="Jain Food Friendly">Jain Food Friendly</option>
                  <option value="Halal Certified">Halal Certified</option>
                  <option value="Seafood & Fine Dining">Seafood & Fine Dining</option>
                  <option value="All-Inclusive Multi-Cuisine">All-Inclusive Multi-Cuisine</option>
                </select>
              </div>

              {/* Hotel Preference */}
              <div className="space-y-2">
                <label className="text-xs text-white/70 font-medium flex items-center gap-1.5">
                  <Hotel className="w-3.5 h-3.5 text-primary" /> Stay Style
                </label>
                <select
                  value={hotelPreference}
                  onChange={(e) => setHotelPreference(e.target.value)}
                  className="w-full h-11 bg-black/50 border border-white/10 text-white rounded-xl text-xs px-3 focus:outline-none"
                >
                  <option value="Boutique Heritage Stays">Boutique Heritage Stays</option>
                  <option value="5-Star Luxury Resorts">5-Star Luxury Resorts</option>
                  <option value="Scenic Private Villas">Scenic Private Villas</option>
                  <option value="Modern Central City Hotels">Modern Central City Hotels</option>
                  <option value="Cozy B&B / Homestays">Cozy B&B / Homestays</option>
                </select>
              </div>

              {/* Transport Preference */}
              <div className="space-y-2">
                <label className="text-xs text-white/70 font-medium flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-primary" /> Transit Preference
                </label>
                <select
                  value={transportPreference}
                  onChange={(e) => setTransportPreference(e.target.value)}
                  className="w-full h-11 bg-black/50 border border-white/10 text-white rounded-xl text-xs px-3 focus:outline-none"
                >
                  <option value="Train & Private Transfer">Train & Private Transfer (Eco & Scenic)</option>
                  <option value="Direct Flights + Rental Car">Direct Flights + Rental Car</option>
                  <option value="Private Chauffeur Throughout">Private Chauffeur Throughout</option>
                  <option value="Public Transit & Metro">Public Transit & Metro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={loading || !destination.trim()}
              className="h-14 px-10 rounded-full bg-[#d4b88a] text-black font-bold text-sm hover:bg-[#c4a87a] shadow-[0_0_30px_rgba(212,184,138,0.25)] flex items-center gap-3"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Itinerary Options...
                </>
              ) : (
                <>
                  Generate & Compare AI Plans
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: GENERATED PLAN TIERS (A / B / C) */}
      {currentStep === "plans" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {generatedPlans.map((plan, index) => {
              const isSelected = selectedPlanTier === plan.plan_tier;
              return (
                <div
                  key={plan.plan_tier || index}
                  onClick={() => setSelectedPlanTier(plan.plan_tier)}
                  className={`cursor-pointer rounded-3xl p-7 border transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#181818] border-primary shadow-2xl shadow-primary/10 ring-2 ring-primary/40"
                      : "bg-[#111111] border-white/10 hover:border-white/20"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-primary text-black">
                      <Check className="w-3.5 h-3.5" /> Selected Plan
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-widest text-primary block mb-1">
                        {plan.plan_tier}
                      </span>
                      <h3 className="text-2xl font-serif text-white">{plan.title}</h3>
                    </div>

                    <div className="py-3 border-y border-white/5">
                      <div className="text-3xl font-serif text-white font-light">
                        {plan.currency} {Number(plan.total_cost).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-white/50 font-mono mt-1">
                        ~{plan.currency} {plan.estimated_daily_expenses || Math.round(plan.total_cost / durationDays)} / day
                      </div>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed font-sans">
                      {plan.fit_rationale}
                    </p>

                    {/* Breakdown Highlights */}
                    <div className="space-y-2 pt-2 text-xs text-white/60">
                      <div className="flex items-start gap-2">
                        <Hotel className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{plan.hotel?.name || "Boutique Stays"}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Plane className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{plan.transport?.mode || "Curated Transit"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-white/5">
                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                        isSelected
                          ? "bg-primary text-black"
                          : "bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {isSelected ? "Active Selection" : "Choose This Plan"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm & Save Itinerary Action Bar */}
          <div className="bg-[#111111] p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="text-sm font-serif text-white">
                Selected: <span className="text-primary font-bold">{selectedPlanTier}</span> for {destination}
              </div>
              <div className="text-xs text-white/50">
                Saving will create your interactive day-by-day itinerary and enable trip monitor.
              </div>
            </div>

            <Button
              onClick={handleConfirmAndSaveItinerary}
              disabled={loading}
              className="h-12 px-8 rounded-full bg-[#d4b88a] text-black font-bold text-sm hover:bg-[#c4a87a] shadow-[0_0_20px_rgba(212,184,138,0.2)] flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving Itinerary...
                </>
              ) : (
                <>
                  Save Itinerary & View Day-by-Day
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070707] flex items-center justify-center text-white/40 font-serif">Initializing Trip Planner...</div>}>
      <PlanWizard />
    </Suspense>
  );
}
