"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Check, Sparkles, MapPin, Calendar, Users, DollarSign, RefreshCw } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const steps = [
  { id: 1, title: "Destination & Dates" },
  { id: 2, title: "Travelers & Budget" },
  { id: 3, title: "Style & Pacing" },
  { id: 4, title: "Review & Generate" }
];

export default function PlanWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [destination, setDestination] = useState("Goa, India");
  const [origin, setOrigin] = useState("Mumbai, India");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split("T")[0];
  });
  const [travelParty, setTravelParty] = useState("Couple");
  const [travelersCount, setTravelersCount] = useState(2);
  const [budgetTier, setBudgetTier] = useState("Premium");
  const [budgetAmount, setBudgetAmount] = useState(2500);
  const [currency, setCurrency] = useState("USD");
  const [pacing, setPacing] = useState("Balanced");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Culture & History",
    "Food & Wine",
    "Nature"
  ]);

  const toggleInterest = (i: string) => {
    setSelectedInterests(prev =>
      prev.includes(i) ? prev.filter(item => item !== i) : [...prev, i]
    );
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Step 4: Execute real trip creation & plan generation
      setLoading(true);
      setError("");
      try {
        const trip = await api.createTrip({
          title: `${travelParty} Journey to ${destination}`,
          primary_destination: destination,
          destinations: [destination],
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          travelers_count: travelersCount,
          trip_type: "Leisure",
          total_budget: budgetAmount,
          currency: currency,
          preferences: {
            starting_location: origin,
            interests: selectedInterests,
            dietary_preferences: ["Local & Vegetarian"],
            accommodation_preferences: [budgetTier === "Luxury" ? "5-Star Resort" : "Boutique Hotel"],
            transport_preferences: ["Train", "Private Transfer"],
            weather_preference: "Mild and Sunny",
          },
        });

        // Generate plans and activate Plan B by default
        await api.generatePlans(trip.id);
        await api.selectPlan(trip.id, "Plan B");
        router.push(`/dashboard/itineraries/${trip.id}`);
      } catch (err: any) {
        setError(err.message || "Failed to create trip. Please check your inputs.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10 pb-20 text-white">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/plan" className="text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-serif text-white">Trip Planning Wizard</h1>
          <p className="text-xs text-white/50">Follow the 4-step guided orchestrator to craft your voyage.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs text-center">
          {error}
        </div>
      )}

      {/* Stepper Bar */}
      <div className="flex items-center justify-between relative before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:h-0.5 before:bg-white/10 before:z-0">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isPast = step.id < currentStep;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-[#070707] px-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-medium transition-colors ${
                isActive ? "bg-primary text-black font-bold ring-4 ring-primary/20" :
                isPast ? "bg-primary text-black" : "bg-[#111111] border border-white/20 text-white/40"
              }`}>
                {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${isActive ? "text-primary font-semibold" : "text-white/40"}`}>{step.title}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-[#111111] rounded-3xl p-8 md:p-10 border border-white/10 min-h-[380px]">
        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif text-white">Where and when are you traveling?</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Destination</label>
                  <Input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Paris, Kyoto, Goa..."
                    className="h-11 bg-black/50 border-white/10 text-white rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Origin / Departure City</label>
                  <Input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. New York, London, Mumbai..."
                    className="h-11 bg-black/50 border-white/10 text-white rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Start Date</label>
                  <Input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11 bg-black/50 border-white/10 text-white rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">End Date</label>
                  <Input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11 bg-black/50 border-white/10 text-white rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif text-white">Who is traveling and what is the budget?</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-3">Travel Party</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Solo", count: 1 },
                    { label: "Couple", count: 2 },
                    { label: "Family", count: 4 },
                    { label: "Friends Group", count: 5 }
                  ].map(t => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => {
                        setTravelParty(t.label);
                        setTravelersCount(t.count);
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                        travelParty === t.label
                          ? "bg-primary text-black font-semibold border-primary"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {t.label} ({t.count})
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Estimated Total Budget</label>
                  <Input
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(Number(e.target.value))}
                    className="h-11 bg-black/50 border-white/10 text-white rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full h-11 bg-black/50 border border-white/10 text-white rounded-xl text-xs px-3 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif text-white">What is your travel style?</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-3">Pacing</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Relaxed", "Balanced", "Fast-Paced"].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPacing(p)}
                      className={`py-3 rounded-xl text-xs font-medium border transition-all ${
                        pacing === p
                          ? "bg-primary text-black font-semibold border-primary"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-3">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {["Culture & History", "Food & Wine", "Nature", "Wellness", "Nightlife", "Shopping", "Adventure", "Beaches"].map(i => {
                    const isSelected = selectedInterests.includes(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleInterest(i)}
                        className={`px-4 py-2 rounded-full text-xs transition-all ${
                          isSelected
                            ? "bg-primary text-black font-semibold"
                            : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {isSelected ? `✓ ${i}` : i}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 4 && (
          <div className="space-y-6 text-center py-4">
            {!loading ? (
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-serif text-white">Ready to Generate Itinerary</h2>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-left text-xs space-y-2 text-white/80">
                  <div><strong>Destination:</strong> {destination} (from {origin})</div>
                  <div><strong>Dates:</strong> {startDate} to {endDate}</div>
                  <div><strong>Party & Budget:</strong> {travelParty} ({travelersCount} travelers) • {currency} {budgetAmount}</div>
                  <div><strong>Pacing & Interests:</strong> {pacing} • {selectedInterests.join(", ")}</div>
                </div>
                <p className="text-xs text-white/50">
                  Click below to generate and save your interactive day-by-day travel plan.
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="w-16 h-16 border-4 border-white/10 border-t-primary rounded-full animate-spin mx-auto" />
                <h3 className="text-lg font-serif text-white">Generating AI Itinerary...</h3>
                <p className="text-xs text-white/50">Analyzing transit, hotel availability, and local activities.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {!loading && (
        <div className="flex justify-between items-center pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            className={`text-xs text-white/50 hover:text-white ${currentStep === 1 ? 'invisible' : ''}`}
          >
            ← Back
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            className="h-11 px-8 bg-[#d4b88a] text-black font-semibold rounded-full hover:bg-[#c4a87a] text-xs flex items-center gap-2"
          >
            {currentStep === 4 ? "Generate & Open Itinerary" : "Continue"}
            {currentStep < 4 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
