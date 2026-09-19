"use client";

import { useState } from "react";
import {
  Map,
  Navigation,
  Locate,
  Building2,
  Compass,
  Utensils,
  Plane,
  ExternalLink,
  Layers,
  Star,
  MapPin,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapPoi {
  id: string;
  name: string;
  category: "stay" | "activity" | "dining" | "transit";
  rating: number;
  timeSlot: string;
  address: string;
  x: number; // percentage left on map canvas
  y: number; // percentage top on map canvas
  description: string;
}

const DESTINATION_MAPS: Record<string, { name: string; center: string; pois: MapPoi[] }> = {
  kyoto: {
    name: "Kyoto, Japan",
    center: "35.0116° N, 135.7681° E",
    pois: [
      { id: "p1", name: "Aman Kyoto Luxury Pavilion", category: "stay", rating: 4.9, timeSlot: "Check-in 15:00", address: "Kita Ward, Kyoto", x: 28, y: 22, description: "Hidden botanical reserve with cedar forest hot springs." },
      { id: "p2", name: "Fushimi Inari-taisha Torii Path", category: "activity", rating: 4.8, timeSlot: "08:30 AM", address: "Fushimi Ward, Kyoto", x: 74, y: 78, description: "10,000 vermilion shrine torii gates ascending Mount Inari." },
      { id: "p3", name: "Kikunoi Kaiseki 3-Star Michelin", category: "dining", rating: 5.0, timeSlot: "19:00 Dinner", address: "Higashiyama Ward", x: 62, y: 46, description: "Century-old culinary sanctuary serving seasonal Kaiseki." },
      { id: "p4", name: "Arashiyama Bamboo Grove & River", category: "activity", rating: 4.7, timeSlot: "14:00 PM", address: "Ukyo Ward", x: 18, y: 52, description: "Towering green bamboo canopy and Tenryu-ji Zen temple." },
      { id: "p5", name: "JR Kyoto Bullet Train Terminal", category: "transit", rating: 4.9, timeSlot: "11:30 Arrival", address: "Shimogyo Ward", x: 48, y: 68, description: "Shinkansen Nozomi bullet connection terminal." },
    ],
  },
  goa: {
    name: "Goa, India",
    center: "15.2993° N, 74.1240° E",
    pois: [
      { id: "g1", name: "Taj Exotica Resort & Spa", category: "stay", rating: 4.8, timeSlot: "Check-in 14:00", address: "Benaulim, South Goa", x: 34, y: 68, description: "Mediterranean-style villa resort across 56 private beachfront acres." },
      { id: "g2", name: "Sal River Sunset Kayak Circuit", category: "activity", rating: 4.9, timeSlot: "16:30 PM", address: "Cavelossim", x: 42, y: 82, description: "Guided mangrove backwaters birdwatching and paddle tour." },
      { id: "g3", name: "Martin's Corner Seafood Sanctuary", category: "dining", rating: 4.7, timeSlot: "13:00 Lunch", address: "Betalbatim", x: 55, y: 48, description: "Legendary Goan crab recheado and traditional prawn balchão." },
      { id: "g4", name: "Fontainhas Latin Quarter Walk", category: "activity", rating: 4.8, timeSlot: "10:00 AM", address: "Panaji", x: 68, y: 25, description: "UNESCO-designated heritage quarter with vibrant 18th-century Portuguese villas." },
    ],
  },
  paris: {
    name: "Paris, France",
    center: "48.8566° N, 2.3522° E",
    pois: [
      { id: "pa1", name: "Hôtel Plaza Athénée", category: "stay", rating: 4.9, timeSlot: "Check-in 15:00", address: "Avenue Montaigne", x: 30, y: 38, description: "Palatial luxury on the haute couture avenue facing the Eiffel Tower." },
      { id: "pa2", name: "Musée d'Orsay VIP Private Tour", category: "activity", rating: 4.9, timeSlot: "09:30 AM", address: "1 Rue de la Légion d'Honneur", x: 52, y: 48, description: "Fast-track impressionist masterworks by Monet, Renoir, and Van Gogh." },
      { id: "pa3", name: "Le Gabriel 3-Star Michelin", category: "dining", rating: 4.9, timeSlot: "20:00 Dinner", address: "Champs-Élysées", x: 44, y: 32, description: "Haute French gastronomy crafted by chef Jérôme Banctel." },
    ],
  },
};

export default function MapsPage() {
  const [activeCity, setActiveCity] = useState("kyoto");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedPoi, setSelectedPoi] = useState<MapPoi | null>(DESTINATION_MAPS.kyoto.pois[0]);
  const [isLocating, setIsLocating] = useState(false);

  const currentMap = DESTINATION_MAPS[activeCity] || DESTINATION_MAPS.kyoto;
  const filteredPois = currentMap.pois.filter(
    (p) => filterCategory === "all" || p.category === filterCategory
  );

  const getPoiColor = (cat: string) => {
    switch (cat) {
      case "stay":
        return "bg-primary text-black border-primary";
      case "activity":
        return "bg-blue-500 text-white border-blue-400";
      case "dining":
        return "bg-amber-500 text-black border-amber-400";
      case "transit":
        return "bg-emerald-500 text-black border-emerald-400";
      default:
        return "bg-white text-black border-white";
    }
  };

  const getPoiIcon = (cat: string) => {
    switch (cat) {
      case "stay":
        return <Building2 className="w-3.5 h-3.5" />;
      case "activity":
        return <Compass className="w-3.5 h-3.5" />;
      case "dining":
        return <Utensils className="w-3.5 h-3.5" />;
      case "transit":
        return <Plane className="w-3.5 h-3.5" />;
      default:
        return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  const handleLocate = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      if (filteredPois[0]) setSelectedPoi(filteredPois[0]);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-white tracking-wide">
            Interactive Journey Map
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Visual spatial matrix of your itinerary, stays, curated dining, and activity waypoints.
          </p>
        </div>

        {/* City Switcher */}
        <div className="flex items-center gap-2">
          {Object.entries(DESTINATION_MAPS).map(([key, dest]) => (
            <button
              key={key}
              onClick={() => {
                setActiveCity(key);
                setSelectedPoi(DESTINATION_MAPS[key].pois[0] || null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                activeCity === key
                  ? "bg-primary text-black font-semibold shadow-lg shadow-primary/20"
                  : "bg-white/5 text-white/60 hover:text-white border border-white/5"
              }`}
            >
              {dest.name.split(",")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas with Controls & POI Pins */}
      <div className="h-[650px] bg-[#0c0c0c] rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl flex flex-col justify-between">
        {/* Map Background Grid & Stylized Canvas */}
        <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-primary/[0.03] pointer-events-none" />

        {/* Top Controls: Category Filter Bar & Recenter */}
        <div className="relative z-10 p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1.5 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10">
            {[
              { id: "all", label: "All Pins" },
              { id: "stay", label: "Stays", icon: Building2 },
              { id: "activity", label: "Activities", icon: Compass },
              { id: "dining", label: "Dining", icon: Utensils },
              { id: "transit", label: "Transit", icon: Plane },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                  filterCategory === cat.id
                    ? "bg-white/15 text-white font-medium shadow"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLocate}
              className="p-3 bg-black/80 backdrop-blur-md text-white rounded-xl border border-white/10 hover:bg-white/10 transition-colors shadow-lg"
              title="Recenter Map"
            >
              <Locate className={`w-4 h-4 ${isLocating ? "animate-spin text-primary" : ""}`} />
            </button>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(currentMap.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-primary text-black rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              title="Open Full Map"
            >
              <Navigation className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Dynamic Map Pins */}
        <div className="absolute inset-0 z-0">
          {filteredPois.map((poi) => {
            const isSelected = selectedPoi?.id === poi.id;
            return (
              <div
                key={poi.id}
                onClick={() => setSelectedPoi(poi)}
                style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin transition-transform"
              >
                <div
                  className={`p-2.5 rounded-2xl border flex items-center gap-1.5 shadow-2xl transition-all ${getPoiColor(
                    poi.category
                  )} ${isSelected ? "scale-125 ring-4 ring-white/20" : "hover:scale-110"}`}
                >
                  {getPoiIcon(poi.category)}
                  <span className="text-[11px] font-mono font-bold max-w-[120px] truncate hidden md:inline">
                    {poi.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Inspector Card for Selected POI */}
        <div className="relative z-10 p-6">
          {selectedPoi ? (
            <div className="max-w-md bg-black/90 backdrop-blur-xl p-6 rounded-3xl border border-white/15 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-primary border border-primary/20">
                  {selectedPoi.category} · {selectedPoi.timeSlot}
                </span>
                <div className="flex items-center gap-1 text-xs text-primary font-mono font-semibold">
                  <Star className="w-3.5 h-3.5 fill-primary" />
                  <span>{selectedPoi.rating}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-serif font-medium text-white">{selectedPoi.name}</h3>
                <p className="text-xs text-white/50 font-mono mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-primary" /> {selectedPoi.address}
                </p>
              </div>

              <p className="text-xs text-white/70 leading-relaxed font-light">{selectedPoi.description}</p>

              <div className="pt-2 flex items-center gap-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    selectedPoi.name + " " + selectedPoi.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black font-semibold text-xs font-mono uppercase tracking-wider text-center flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors"
                >
                  <span>Open Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="max-w-md bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs text-white/60">
              Click any pin on the map to inspect waypoint details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
