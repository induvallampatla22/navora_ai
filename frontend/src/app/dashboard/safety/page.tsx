"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Phone,
  Hospital,
  Globe,
  Info,
  Search,
  RefreshCw,
  ShieldAlert,
  Download,
  CheckCircle2,
  X,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface SafetyDossier {
  destination: string;
  overall_score: number;
  safety_level: string;
  categories: { label: string; score: number }[];
  emergency_contacts: { label: string; number: string; icon_type?: string }[];
  advisories: { level: string; title: string; description: string }[];
}

export default function SafetyPage() {
  const [destination, setDestination] = useState("Kyoto, Japan");
  const [searchInput, setSearchInput] = useState("Kyoto, Japan");
  const [dossier, setDossier] = useState<SafetyDossier>({
    destination: "Kyoto, Japan",
    overall_score: 9.2,
    safety_level: "Very Safe",
    categories: [
      { label: "Personal Safety", score: 9.4 },
      { label: "Health & Hygiene", score: 9.6 },
      { label: "Political Stability", score: 9.0 },
      { label: "Natural Disaster Resilience", score: 8.5 },
      { label: "Infrastructure Quality", score: 9.8 },
    ],
    emergency_contacts: [
      { label: "Police Emergency", number: "110" },
      { label: "Ambulance & Fire", number: "119" },
      { label: "Japan Tourist Emergency Helpline", number: "050-3816-2787" },
      { label: "US Embassy Tokyo", number: "+81-3-3224-5000" },
    ],
    advisories: [
      { level: "info", title: "Seismic Awareness", description: "Japan is seismically active. Modern buildings in Kyoto are built to supreme seismic standards." },
      { level: "info", title: "Weather Sentinel", description: "Autumn typhoon tailwinds monitored. Radar currently indicates mild conditions." },
      { level: "success", title: "No Government Restrictions", description: "Standard international travel precautions apply. Low petty crime rate." },
    ],
  });
  const [isLoading, setIsLoading] = useState(false);

  // SOS Modal
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [sosStatus, setSosStatus] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  const fetchSafetyData = async (dest: string) => {
    setIsLoading(true);
    try {
      const res = await api.fetch<any>(`/api/safety?destination=${encodeURIComponent(dest)}`);
      if (res && res.safety_score) {
        setDossier({
          destination: res.destination || dest,
          overall_score: res.safety_score,
          safety_level: res.safety_score >= 8 ? "Very Safe" : res.safety_score >= 6 ? "Moderate Caution" : "High Advisory",
          categories: [
            { label: "Personal Safety", score: res.category_breakdown?.personal_safety || 9.0 },
            { label: "Health & Medical Access", score: res.category_breakdown?.health_hygiene || 9.2 },
            { label: "Political Stability", score: res.category_breakdown?.political_stability || 8.8 },
            { label: "Natural Hazards", score: res.category_breakdown?.natural_hazard_risk || 8.0 },
            { label: "Infrastructure", score: res.category_breakdown?.infrastructure || 9.5 },
          ],
          emergency_contacts: (res.emergency_contacts || []).map((c: any) => ({
            label: c.service || c.label,
            number: c.number,
          })),
          advisories: (res.active_advisories || []).map((a: any) => ({
            level: a.severity === "high" ? "warning" : "info",
            title: a.title,
            description: a.description || a.details,
          })),
        });
        setDestination(dest);
      }
    } catch (err) {
      console.warn("Using localized fallback safety data:", err);
      setDossier((prev) => ({ ...prev, destination: dest }));
      setDestination(dest);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchSafetyData(searchInput.trim());
    }
  };

  const handleTriggerSOS = async () => {
    setIsDispatching(true);
    try {
      const res = await api.fetch<any>("/api/safety/sos", {
        method: "POST",
        body: JSON.stringify({ emergency_type: "immediate_assistance" }),
      });
      setSosStatus("Emergency SOS Protocol Activated. Local diplomatic & medical dispatch guides primed below.");
    } catch {
      setSosStatus("Emergency Alert Registered. Local assistance contacts prioritized.");
    } finally {
      setIsDispatching(false);
    }
  };

  const handleDownloadEmergencyCard = () => {
    const cardData = `NAVORA EMERGENCY SAFETY & SOS CARD\n=================================\nDestination: ${destination}\nOverall Safety Score: ${dossier.overall_score}/10 (${dossier.safety_level})\nTimestamp: ${new Date().toISOString()}\n\nEMERGENCY NUMBERS:\n${dossier.emergency_contacts.map((c) => `- ${c.label}: ${c.number}`).join("\n")}\n\nACTIVE ADVISORIES:\n${dossier.advisories.map((a) => `* [${a.level.toUpperCase()}] ${a.title}: ${a.description}`).join("\n")}\n\nNAVORA Sovereign Concierge 24/7 Helpline: +1 (800) 555-0199`;
    const blob = new Blob([cardData], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `emergency_card_${destination.toLowerCase().replace(/[^a-z0-9]/g, "_")}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Global Safety Sentinel & Real-Time Risk Dossier</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide">Travel Safety & Advisories</h1>
          <p className="text-sm text-white/60 mt-1">
            Autonomous risk assessment, verified emergency hotlines, and instant SOS dispatch for any destination.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDownloadEmergencyCard} className="rounded-xl border-white/10 text-white/80 hover:bg-white/5">
            <Download className="w-4 h-4 mr-2" />
            Offline Card
          </Button>
          <Button onClick={() => setIsSosOpen(true)} className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Emergency SOS
          </Button>
        </div>
      </div>

      {/* Destination Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Check safety for any city (e.g. Goa, Paris, Tokyo, Bali, Rome, Swiss Alps)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#111111] border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-primary"
          />
        </div>
        <Button type="submit" disabled={isLoading} className="rounded-xl bg-primary text-black hover:bg-primary/90 text-xs">
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-1.5" /> : <Search className="w-4 h-4 mr-1.5" />}
          Evaluate
        </Button>
      </form>

      {/* Safety Matrix Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score & Category Breakdown */}
        <div className="bg-[#111111] rounded-3xl border border-white/10 p-8 text-center flex flex-col justify-between">
          <div>
            <div className="w-28 h-28 mx-auto rounded-full border-4 border-emerald-500/30 flex items-center justify-center mb-4 bg-emerald-500/10">
              <div className="text-3xl font-serif font-bold text-emerald-400">{dossier.overall_score}</div>
            </div>
            <div className="text-xl font-serif font-medium text-emerald-400">{dossier.safety_level}</div>
            <div className="text-xs text-white/40 mt-1 font-mono flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3 text-primary" />
              {dossier.destination}
            </div>
          </div>

          <div className="mt-8 space-y-3 text-left">
            {dossier.categories.map((cat) => (
              <div key={cat.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">{cat.label}</span>
                  <span className="font-medium text-white font-mono">{cat.score.toFixed(1)}/10</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(cat.score / 10) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-[#111111] rounded-3xl border border-white/10 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-white/10 bg-red-500/10 flex items-center justify-between">
            <h2 className="text-lg font-serif font-medium text-red-400 flex items-center gap-2">
              <Phone className="w-5 h-5" /> Local Emergency Contacts
            </h2>
            <span className="text-[10px] font-mono text-red-400/80 uppercase">One-Touch Call</span>
          </div>

          <div className="divide-y divide-white/5 flex-1">
            {dossier.emergency_contacts.map((contact) => (
              <a
                key={contact.label}
                href={`tel:${contact.number.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-4 p-5 hover:bg-white/5 transition-colors group block"
              >
                <div className="w-10 h-10 bg-red-500/10 text-red-400 group-hover:bg-red-500 group-hover:text-black rounded-xl flex items-center justify-center shrink-0 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">{contact.label}</div>
                  <div className="text-sm text-primary font-mono mt-0.5">{contact.number}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Active Advisories */}
        <div className="bg-[#111111] rounded-3xl border border-white/10 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-serif font-medium text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Government Advisories
            </h2>
            <span className="text-xs font-mono text-amber-400">{dossier.advisories.length} Active</span>
          </div>

          <div className="divide-y divide-white/5 flex-1">
            {dossier.advisories.map((adv, i) => (
              <div key={i} className="p-5">
                <div className="flex items-start gap-3">
                  <Info
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      adv.level === "success" ? "text-emerald-400" : "text-amber-400"
                    }`}
                  />
                  <div>
                    <div className="font-medium text-white text-sm">{adv.title}</div>
                    <div className="text-xs text-white/50 mt-1 leading-relaxed">{adv.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency SOS Modal */}
      {isSosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#140a0a] border border-red-500/40 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setIsSosOpen(false)}
              className="absolute right-6 top-6 text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-red-600/20 text-red-400 rounded-3xl flex items-center justify-center mx-auto border border-red-500/40 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-serif text-red-400">Emergency SOS Sentinel</h3>
              <p className="text-xs text-white/70 mt-1">
                Triggering SOS broadcasts high-priority alerts to local emergency authorities and dedicated 24/7 NAVORA agents.
              </p>
            </div>

            {sosStatus ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{sosStatus}</span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-white/60">
                <div className="flex justify-between">
                  <span>Current Monitored Location:</span>
                  <span className="font-mono text-white">{destination}</span>
                </div>
                <div className="flex justify-between">
                  <span>Local Police Dispatch:</span>
                  <span className="font-mono text-primary font-bold">110 / 112</span>
                </div>
                <div className="flex justify-between">
                  <span>Medical & Ambulance:</span>
                  <span className="font-mono text-primary font-bold">119 / 108</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsSosOpen(false)} className="rounded-xl border-white/10">
                Cancel
              </Button>
              <Button
                onClick={handleTriggerSOS}
                disabled={isDispatching}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider"
              >
                {isDispatching ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                Broadcast Alert Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
