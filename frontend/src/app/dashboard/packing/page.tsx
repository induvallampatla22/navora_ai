"use client";

import { useState, useEffect } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Shirt,
  Umbrella,
  Pill,
  Camera,
  Laptop,
  FileText,
  Sparkles,
  Download,
  RefreshCw,
  X,
  CheckCircle2,
  MapPin,
  Waves,
  Mountain,
  Flame,
  TreePine,
  Leaf,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface PackingItemType {
  id: string;
  text: string;
  category: string;
  packed: boolean;
  essential?: boolean;
  isCustom?: boolean;  // User-manually-added items — never wiped on destination change
}

interface CategoryGroup {
  name: string;
  items: PackingItemType[];
}

const CATEGORY_ICONS: Record<string, any> = {
  Clothing:            Shirt,
  "Weather Gear":      Umbrella,
  "Health & Toiletries": Pill,
  Electronics:         Laptop,
  Photography:         Camera,
  Documents:           FileText,
  General:             Sparkles,
  "Beach Essentials":  Waves,
  "Mountain Gear":     Mountain,
  "Spiritual Items":   Flame,
  "Hill Station Gear": TreePine,
  "Wildlife Safari":   Leaf,
};

// ─── Destination-type detector ─────────────────────────────────────────────
// Infers the destination type from categories, name, or tags
type DestType = "beach" | "mountain" | "spiritual" | "hill_station" | "wildlife" | "city" | "general";

function inferDestType(trip: any): DestType {
  const dest = (trip?.primary_destination || "").toLowerCase();
  const cats = ((trip?.categories || trip?.destination_categories || []) as string[])
    .map((c: string) => c.toLowerCase());

  if (cats.includes("beaches") || /goa|maldives|bora|phuket|santorini|beach|coastal/.test(dest)) return "beach";
  if (cats.includes("mountains") || /kashmir|swiss alps|banff|patagonia|queenstown|everest|himalayas|mountain/.test(dest)) return "mountain";
  if (cats.includes("spiritual") || /varanasi|rishikesh|kyoto|tibet|amritsar|spiritual|temple|pilgrimage/.test(dest)) return "spiritual";
  if (cats.includes("hill stations") || /ooty|munnar|shimla|darjeeling|coorg|hill/.test(dest)) return "hill_station";
  if (cats.includes("wildlife") || /masai|ranthambore|serengeti|safari|corbett|wildlife/.test(dest)) return "wildlife";
  if (/paris|london|new york|dubai|tokyo|singapore|barcelona|rome|city|urban/.test(dest)) return "city";
  return "general";
}

// ─── Packing templates per destination type ────────────────────────────────
// AI-generated items change based on destination. User custom items are preserved.
function buildDestPackingCategories(destType: DestType, destName: string): CategoryGroup[] {
  const base: CategoryGroup[] = [
    {
      name: "Documents",
      items: [
        { id: "d1", text: "Passport & valid visa copies", category: "Documents", packed: false, essential: true },
        { id: "d2", text: "Travel insurance physical card", category: "Documents", packed: false, essential: true },
        { id: "d3", text: "Emergency contacts printout", category: "Documents", packed: false, essential: false },
      ],
    },
    {
      name: "Electronics",
      items: [
        { id: "e1", text: "Universal power adapter", category: "Electronics", packed: false, essential: true },
        { id: "e2", text: "Portable power bank 20000mAh", category: "Electronics", packed: false, essential: true },
        { id: "e3", text: "Noise-cancelling headphones for flights", category: "Electronics", packed: false, essential: false },
      ],
    },
  ];

  if (destType === "beach") {
    return [
      {
        name: "Beach Essentials",
        items: [
          { id: "b1", text: `Swimwear & beach cover-ups for ${destName}`, category: "Beach Essentials", packed: false, essential: true },
          { id: "b2", text: "Waterproof sunscreen SPF 50+", category: "Beach Essentials", packed: false, essential: true },
          { id: "b3", text: "Snorkeling mask & fins (if applicable)", category: "Beach Essentials", packed: false, essential: false },
          { id: "b4", text: "Beach towel & waterproof bag", category: "Beach Essentials", packed: false, essential: false },
          { id: "b5", text: "Flip flops & comfortable sandals", category: "Beach Essentials", packed: false, essential: true },
          { id: "b6", text: "Polarized UV-protection sunglasses", category: "Beach Essentials", packed: false, essential: true },
        ],
      },
      {
        name: "Clothing",
        items: [
          { id: "c1", text: "Lightweight breathable cotton (5 sets)", category: "Clothing", packed: false, essential: true },
          { id: "c2", text: "Smart casual evening outfit", category: "Clothing", packed: false, essential: false },
          { id: "c3", text: "Light cardigan for AC indoors", category: "Clothing", packed: false, essential: false },
        ],
      },
      {
        name: "Health & Toiletries",
        items: [
          { id: "h1", text: "After-sun aloe vera lotion", category: "Health & Toiletries", packed: false, essential: true },
          { id: "h2", text: "Insect repellent (DEET-based)", category: "Health & Toiletries", packed: false, essential: true },
          { id: "h3", text: "Motion sickness tablets (if boat trips)", category: "Health & Toiletries", packed: false, essential: false },
        ],
      },
      ...base,
    ];
  }

  if (destType === "mountain") {
    return [
      {
        name: "Mountain Gear",
        items: [
          { id: "m1", text: `Layered thermal inners for ${destName} altitude`, category: "Mountain Gear", packed: false, essential: true },
          { id: "m2", text: "Waterproof trekking jacket (windproof)", category: "Mountain Gear", packed: false, essential: true },
          { id: "m3", text: "High-ankle waterproof trekking boots", category: "Mountain Gear", packed: false, essential: true },
          { id: "m4", text: "Trekking poles (lightweight carbon)", category: "Mountain Gear", packed: false, essential: false },
          { id: "m5", text: "UV glacier sunglasses (wraparound)", category: "Mountain Gear", packed: false, essential: true },
          { id: "m6", text: "Balaclava & fleece-lined gloves", category: "Mountain Gear", packed: false, essential: true },
        ],
      },
      {
        name: "Clothing",
        items: [
          { id: "c1", text: "Woollen/fleece mid-layers (3 sets)", category: "Clothing", packed: false, essential: true },
          { id: "c2", text: "Moisture-wicking base-layer tops (3)", category: "Clothing", packed: false, essential: true },
          { id: "c3", text: "Insulated down jacket (packable)", category: "Clothing", packed: false, essential: true },
        ],
      },
      {
        name: "Health & Toiletries",
        items: [
          { id: "h1", text: "Altitude sickness tablets (Diamox)", category: "Health & Toiletries", packed: false, essential: true },
          { id: "h2", text: "Blister plasters & KT tape", category: "Health & Toiletries", packed: false, essential: true },
          { id: "h3", text: "Lip balm SPF 30 & heavy moisturiser", category: "Health & Toiletries", packed: false, essential: false },
        ],
      },
      ...base,
    ];
  }

  if (destType === "spiritual") {
    return [
      {
        name: "Spiritual Items",
        items: [
          { id: "sp1", text: `Modest clothing (shoulders & knees covered) for ${destName} temples`, category: "Spiritual Items", packed: false, essential: true },
          { id: "sp2", text: "Removable footwear (easy slip-on sandals)", category: "Spiritual Items", packed: false, essential: true },
          { id: "sp3", text: "Lightweight cotton scarf / stole (head cover)", category: "Spiritual Items", packed: false, essential: true },
          { id: "sp4", text: "Journal & pen for reflection notes", category: "Spiritual Items", packed: false, essential: false },
          { id: "sp5", text: "Personal meditation items / prayer beads", category: "Spiritual Items", packed: false, essential: false },
        ],
      },
      {
        name: "Clothing",
        items: [
          { id: "c1", text: "Loose-fit, comfortable cotton kurtas (3)", category: "Clothing", packed: false, essential: true },
          { id: "c2", text: "Light shawl for cool temple evenings", category: "Clothing", packed: false, essential: false },
          { id: "c3", text: "Simple walking shoes (closed toe)", category: "Clothing", packed: false, essential: true },
        ],
      },
      {
        name: "Health & Toiletries",
        items: [
          { id: "h1", text: "Hand sanitiser & wet wipes (100ml)", category: "Health & Toiletries", packed: false, essential: true },
          { id: "h2", text: "Stomach-care tablets (travel diarrhea)", category: "Health & Toiletries", packed: false, essential: true },
          { id: "h3", text: "Personal water filter bottle", category: "Health & Toiletries", packed: false, essential: false },
        ],
      },
      ...base,
    ];
  }

  if (destType === "hill_station") {
    return [
      {
        name: "Hill Station Gear",
        items: [
          { id: "hs1", text: `Layered fleece jacket for ${destName} evenings`, category: "Hill Station Gear", packed: false, essential: true },
          { id: "hs2", text: "Comfortable walking shoes with grip", category: "Hill Station Gear", packed: false, essential: true },
          { id: "hs3", text: "Compact rain poncho (monsoon season)", category: "Hill Station Gear", packed: false, essential: true },
          { id: "hs4", text: "Woollen socks & light gloves", category: "Hill Station Gear", packed: false, essential: false },
        ],
      },
      {
        name: "Clothing",
        items: [
          { id: "c1", text: "Warm casual tops & jeans (4 sets)", category: "Clothing", packed: false, essential: true },
          { id: "c2", text: "Lightweight woollen sweater", category: "Clothing", packed: false, essential: true },
          { id: "c3", text: "Smart outfit for hotel dinners", category: "Clothing", packed: false, essential: false },
        ],
      },
      {
        name: "Health & Toiletries",
        items: [
          { id: "h1", text: "Sunscreen SPF 30 (higher altitude UV)", category: "Health & Toiletries", packed: false, essential: true },
          { id: "h2", text: "Headache/cold relief medicine", category: "Health & Toiletries", packed: false, essential: false },
        ],
      },
      ...base,
    ];
  }

  if (destType === "wildlife") {
    return [
      {
        name: "Wildlife Safari",
        items: [
          { id: "w1", text: `Neutral/khaki clothing for ${destName} safari (no bright colours)`, category: "Wildlife Safari", packed: false, essential: true },
          { id: "w2", text: "High-power binoculars (8x42 or higher)", category: "Wildlife Safari", packed: false, essential: true },
          { id: "w3", text: "Insect repellent spray (DEET 40%+)", category: "Wildlife Safari", packed: false, essential: true },
          { id: "w4", text: "Dust/wind-resistant hat with brim", category: "Wildlife Safari", packed: false, essential: true },
          { id: "w5", text: "Lightweight waterproof boots", category: "Wildlife Safari", packed: false, essential: false },
        ],
      },
      {
        name: "Photography",
        items: [
          { id: "ph1", text: "DSLR/Mirrorless with 100-400mm telephoto", category: "Photography", packed: false, essential: false },
          { id: "ph2", text: "Extra camera batteries & memory cards", category: "Photography", packed: false, essential: false },
          { id: "ph3", text: "Bean bag camera support for safari vehicle", category: "Photography", packed: false, essential: false },
        ],
      },
      {
        name: "Health & Toiletries",
        items: [
          { id: "h1", text: "Malaria prophylaxis (consult doctor)", category: "Health & Toiletries", packed: false, essential: true },
          { id: "h2", text: "Antihistamines & eye drops", category: "Health & Toiletries", packed: false, essential: true },
          { id: "h3", text: "Personal first-aid kit with bandages", category: "Health & Toiletries", packed: false, essential: true },
        ],
      },
      ...base,
    ];
  }

  // City / General
  return [
    {
      name: "Clothing",
      items: [
        { id: "c1", text: `Light jacket & breathable layers for ${destName}`, category: "Clothing", packed: false, essential: true },
        { id: "c2", text: "Comfortable walking shoes (15k+ daily steps)", category: "Clothing", packed: false, essential: true },
        { id: "c3", text: "Smart casual evening outfit", category: "Clothing", packed: false, essential: false },
        { id: "c4", text: "Breathable daywear (4 sets)", category: "Clothing", packed: false, essential: false },
      ],
    },
    {
      name: "Weather Gear",
      items: [
        { id: "w1", text: `Compact travel umbrella (for ${destName})`, category: "Weather Gear", packed: false, essential: true },
        { id: "w2", text: "Polarized sunglasses", category: "Weather Gear", packed: false, essential: false },
        { id: "w3", text: "Broad spectrum sunscreen SPF 50", category: "Weather Gear", packed: false, essential: false },
      ],
    },
    {
      name: "Health & Toiletries",
      items: [
        { id: "h1", text: "Basic first-aid & personal medications", category: "Health & Toiletries", packed: false, essential: true },
        { id: "h2", text: "Hand sanitiser (100ml)", category: "Health & Toiletries", packed: false, essential: false },
      ],
    },
    ...base,
  ];
}

export default function PackingPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [destType, setDestType] = useState<DestType>("general");
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [customItems, setCustomItems] = useState<PackingItemType[]>([]);  // Custom items preserved across dest changes
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Clothing");
  const [newItemEssential, setNewItemEssential] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDestChangeNotice, setShowDestChangeNotice] = useState(false);

  /** Merge AI categories with preserved custom items */
  function mergeWithCustomItems(aiCats: CategoryGroup[], customs: PackingItemType[]): CategoryGroup[] {
    if (customs.length === 0) return aiCats;
    const merged = [...aiCats];
    customs.forEach((item) => {
      const catIdx = merged.findIndex((c) => c.name === item.category);
      if (catIdx !== -1) {
        // Only add if not already present
        if (!merged[catIdx].items.find((i) => i.id === item.id)) {
          merged[catIdx].items.push(item);
        }
      } else {
        merged.push({ name: item.category, items: [item] });
      }
    });
    return merged;
  }

  /** Load packing list for a trip — AI generates based on destination */
  async function loadPackingForTrip(trip: any, existingCustoms: PackingItemType[]) {
    setIsLoading(true);
    try {
      // Try to get saved packing data from API first
      const packingData = await api.fetch<any>(`/api/packing/${trip.id}`);
      if (packingData && packingData.categories && packingData.categories.length > 0) {
        const fromApi = packingData.categories.map((c: any) => ({
          name: c.name,
          items: c.items.map((i: any) => ({
            id: i.id, text: i.text, category: c.name,
            packed: i.packed, essential: i.essential, isCustom: i.isCustom || false,
          })),
        }));
        // Preserve custom items even when loading from API
        const newCustoms = fromApi.flatMap((c: CategoryGroup) => c.items.filter((i: PackingItemType) => i.isCustom));
        setCustomItems(newCustoms);
        setCategories(mergeWithCustomItems(fromApi, existingCustoms.filter((ci) => !newCustoms.find((ni: PackingItemType) => ni.id === ci.id))));
        return;
      }
    } catch {
      // No saved data — use AI generation
    }

    // AI generates based on destination type
    const dt = inferDestType(trip);
    setDestType(dt);
    const aiCats = buildDestPackingCategories(dt, trip.primary_destination || "your destination");
    setCategories(mergeWithCustomItems(aiCats, existingCustoms));
    setIsLoading(false);
  }

  useEffect(() => {
    async function initPacking() {
      setIsLoading(true);
      try {
        const tripsData = await api.getTrips();
        if (tripsData && tripsData.length > 0) {
          setTrips(tripsData);
          const trip = tripsData[0];
          setSelectedTripId(trip.id);
          setSelectedTrip(trip);
          await loadPackingForTrip(trip, []);
        } else {
          // No trips — show general packing list
          setDestType("general");
          setCategories(buildDestPackingCategories("general", "your destination"));
        }
      } catch {
        setDestType("general");
        setCategories(buildDestPackingCategories("general", "your destination"));
      } finally {
        setIsLoading(false);
      }
    }
    initPacking();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTripChange = async (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    setSelectedTripId(tripId);
    setSelectedTrip(trip);
    setShowDestChangeNotice(true);
    setTimeout(() => setShowDestChangeNotice(false), 3000);
    // Preserve custom items, regenerate AI items
    await loadPackingForTrip(trip, customItems);
  };

  const handleAIGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const dt = inferDestType(selectedTrip);
      setDestType(dt);
      const aiCats = buildDestPackingCategories(dt, selectedTrip?.primary_destination || "your destination");
      setCategories(mergeWithCustomItems(aiCats, customItems));
      setIsGenerating(false);
    }, 1500);
  };

  const toggleItem = async (catName: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.name === catName
          ? { ...cat, items: cat.items.map((item) => item.id === itemId ? { ...item, packed: !item.packed } : item) }
          : cat
      )
    );
    if (selectedTripId) {
      try {
        await api.fetch(`/api/packing/${selectedTripId}/toggle`, {
          method: "POST",
          body: JSON.stringify({ item_id: itemId }),
        });
      } catch { /* Local state already updated */ }
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const itemObj: PackingItemType = {
      id: "custom_" + Date.now(),
      text: newItemName.trim(),
      category: newItemCategory,
      packed: false,
      essential: newItemEssential,
      isCustom: true,  // Mark as user-added — will survive destination changes
    };

    // Save to customItems so it persists across destination switches
    setCustomItems((prev) => [...prev, itemObj]);

    setCategories((prev) => {
      const exists = prev.find((c) => c.name === newItemCategory);
      if (exists) {
        return prev.map((c) =>
          c.name === newItemCategory ? { ...c, items: [...c.items, itemObj] } : c
        );
      } else {
        return [...prev, { name: newItemCategory, items: [itemObj] }];
      }
    });

    if (selectedTripId) {
      try {
        await api.fetch(`/api/packing/${selectedTripId}/add`, {
          method: "POST",
          body: JSON.stringify({ item_name: newItemName.trim(), category: newItemCategory, is_essential: newItemEssential }),
        });
      } catch { /* Saved in local state */ }
    }

    setNewItemName("");
    setIsAddOpen(false);
  };

  const handleExportList = () => {
    let content = "NAVORA SMART PACKING MANIFEST\n============================\n\n";
    categories.forEach((cat) => {
      content += `[${cat.name.toUpperCase()}]\n`;
      cat.items.forEach((it) => {
        content += `  [${it.packed ? "X" : " "}] ${it.text} ${it.essential ? "(Essential)" : ""}${it.isCustom ? " [Custom]" : ""}\n`;
      });
      content += "\n";
    });
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `navora_packing_${new Date().toISOString().slice(0, 10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allItems = categories.flatMap((c) => c.items);
  const totalItems = allItems.length;
  const packedItems = allItems.filter((i) => i.packed).length;
  const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  const DEST_TYPE_LABELS: Record<DestType, { label: string; icon: any; color: string }> = {
    beach:        { label: "Beach / Coastal", icon: Waves, color: "text-cyan-400" },
    mountain:     { label: "Mountain / Trek", icon: Mountain, color: "text-emerald-400" },
    spiritual:    { label: "Spiritual / Temple", icon: Flame, color: "text-orange-400" },
    hill_station: { label: "Hill Station", icon: TreePine, color: "text-lime-400" },
    wildlife:     { label: "Wildlife Safari", icon: Leaf, color: "text-yellow-400" },
    city:         { label: "City / Urban", icon: MapPin, color: "text-blue-400" },
    general:      { label: "General Trip", icon: Sparkles, color: "text-primary" },
  };

  const dtLabel = DEST_TYPE_LABELS[destType];
  const DtIcon = dtLabel.icon;

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Destination-Adaptive AI Packing Engine</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide">Smart Packing Vault</h1>
          <p className="text-sm text-white/60 mt-1">
            Packing preferences automatically adapt to your destination type, weather, and activities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleAIGenerate}
            disabled={isGenerating || !selectedTripId}
            className="rounded-xl border-primary/40 text-primary hover:bg-primary/10"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {isGenerating ? "Generating…" : "AI Regenerate"}
          </Button>
          <Button variant="outline" onClick={handleExportList} className="rounded-xl border-white/10 text-white/80 hover:bg-white/5 hidden md:flex">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="rounded-xl bg-primary text-black hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Destination Type Chip + Change Notice */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono ${dtLabel.color}`}>
          <DtIcon className="w-3.5 h-3.5" />
          <span>Packing Mode: {dtLabel.label}</span>
        </div>
        {customItems.length > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-mono text-primary">
            <CheckCircle2 className="w-3 h-3" />
            {customItems.length} custom item{customItems.length > 1 ? "s" : ""} preserved
          </div>
        )}
        {showDestChangeNotice && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-400 animate-pulse">
            <Info className="w-3 h-3" />
            Packing preferences updated for new destination
          </div>
        )}
      </div>

      {/* Trip Switcher & Progress Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 md:p-8 rounded-3xl bg-[#111111] border border-white/10 flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-white/40 block mb-1">Checklist Progress</span>
              <div className="text-3xl md:text-4xl font-serif text-white">
                {packedItems} of {totalItems} <span className="text-xl font-normal text-white/40">Items Packed</span>
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-serif font-bold text-primary">{progress}%</div>
          </div>

          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {trips.length > 1 && (
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs font-mono text-white/40">Target Trip:</span>
              <select
                value={selectedTripId}
                onChange={(e) => handleTripChange(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.primary_destination})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedTrip && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-white/30 pt-1">
              <MapPin className="w-3 h-3" />
              {selectedTrip.primary_destination || "Unknown destination"} •{" "}
              <span className={dtLabel.color}>{dtLabel.label} mode active</span>
            </div>
          )}
        </div>

        <div className="p-6 rounded-3xl bg-[#0c0c0c] border border-white/10 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary mb-2">
              <Umbrella className="w-4 h-4" />
              <span>Weather Intelligence</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Packing list synthesized from{" "}
              <span className={`font-semibold ${dtLabel.color}`}>{dtLabel.label.toLowerCase()}</span>{" "}
              destination profile for {selectedTrip?.primary_destination || "your destination"}.
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] font-mono text-white/40">
            Auto-synced with Weather Sentinel
          </div>
        </div>
      </div>

      {/* Category Accordion / List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-mono text-white/40">Adapting packing list to destination…</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const IconComp = CATEGORY_ICONS[cat.name] || Sparkles;
            const catPacked = cat.items.filter((i) => i.packed).length;
            const customCount = cat.items.filter((i) => i.isCustom).length;

            return (
              <div key={cat.name} className="bg-[#111111] rounded-3xl border border-white/10 overflow-hidden">
                <div className="px-6 md:px-8 py-5 bg-white/5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-medium text-lg text-white">{cat.name}</h3>
                      {customCount > 0 && (
                        <span className="text-[10px] font-mono text-primary/70">{customCount} custom</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white/40 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    {catPacked}/{cat.items.length} Ready
                  </span>
                </div>

                <div className="divide-y divide-white/5">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(cat.name, item.id)}
                      className="w-full flex items-center justify-between px-6 md:px-8 py-4 hover:bg-white/[0.03] transition-colors text-left group"
                    >
                      <div className="flex items-center gap-4">
                        {item.packed ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-white/20 group-hover:text-primary shrink-0 transition-colors" />
                        )}
                        <span className={`text-sm ${item.packed ? "line-through text-white/30" : "text-white"}`}>
                          {item.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.isCustom && (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            Custom
                          </span>
                        )}
                        {item.essential && (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Essential
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          <button
            onClick={() => setIsAddOpen(true)}
            className="w-full py-5 border-2 border-dashed border-white/10 hover:border-primary/40 rounded-3xl text-white/40 hover:text-primary transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="w-5 h-5" /> Add Custom Packing Item
          </button>
        </div>
      )}

      {/* Add Custom Item Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute right-6 top-6 text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-2xl font-serif text-white">Add Custom Item</h3>
              <p className="text-xs text-white/50 mt-1">
                Custom items are permanently saved and will not change when you switch destinations.
              </p>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest font-mono block mb-1.5">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scuba diving mask, Evening dress, Kindle…"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest font-mono block mb-1.5">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value="Clothing">Clothing</option>
                  <option value="Weather Gear">Weather Gear</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Health & Toiletries">Health & Toiletries</option>
                  <option value="Photography">Photography</option>
                  <option value="Documents">Documents</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ess"
                  checked={newItemEssential}
                  onChange={(e) => setNewItemEssential(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <label htmlFor="ess" className="text-xs text-white/70 cursor-pointer">
                  Mark as Critical / Essential Item
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl border-white/10">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-primary text-black hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add to Checklist
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
