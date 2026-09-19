"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  { id: "all", label: "ICONIC DESTINATIONS" },
  { id: "spiritual", label: "DEVOTIONAL & SPIRITUAL" },
  { id: "beaches", label: "BEACHES" },
  { id: "hills", label: "HILL STATIONS" },
  { id: "mountains", label: "MOUNTAINS & VALLEYS" },
  { id: "wildlife", label: "ADVENTURE & WILDLIFE" },
];

const SECTIONS = [
  {
    id: "iconic",
    categoryKey: "all",
    title: "Iconic Destinations",
    subtitle: "India's most celebrated travel gems",
    items: [
      {
        id: "goa",
        name: "Goa",
        slug: "goa-india",
        description: "Sun-kissed beaches, vibrant nightlife, and Portuguese heritage charm.",
        image: "/images/explore/goa.jpg",
      },
      {
        id: "jaipur",
        name: "Jaipur",
        slug: "jaipur-india",
        description: "The Pink City — majestic forts, palaces, and royal Rajasthani culture.",
        image: "/images/explore/jaipur.jpg",
      },
      {
        id: "kerala",
        name: "Kerala",
        slug: "kerala-india",
        description: "God's Own Country — tranquil backwaters, lush hills, and Ayurvedic bliss.",
        image: "/images/explore/kerala.jpg",
      },
      {
        id: "agra",
        name: "Agra",
        slug: "agra-india",
        description: "Home of the Taj Mahal — a timeless monument to eternal love.",
        image: "/images/explore/agra.jpg",
      },
    ],
  },
  {
    id: "spiritual",
    categoryKey: "spiritual",
    title: "Devotional & Spiritual",
    subtitle: "Sacred temples and spiritual sanctuaries of India",
    items: [
      {
        id: "varanasi",
        name: "Varanasi",
        slug: "varanasi",
        description: "The spiritual capital of India — ancient ghats and timeless traditions.",
        image: "/images/explore/varanasi.jpg",
      },
      {
        id: "amritsar",
        name: "Amritsar",
        slug: "amritsar",
        description: "Home of the Golden Temple — a beacon of devotion and community.",
        image: "/images/explore/amritsar.jpg",
      },
      {
        id: "tirupati",
        name: "Tirupati",
        slug: "tirupati",
        description: "The richest and most-visited temple — Lord Venkateswara's sacred abode.",
        image: "/images/explore/tirupati.jpg",
      },
      {
        id: "rishikesh",
        name: "Rishikesh",
        slug: "rishikesh",
        description: "Yoga capital of the world — where spirituality meets adventure.",
        image: "/images/explore/rishikesh.jpg",
      },
    ],
  },
  {
    id: "beaches",
    categoryKey: "beaches",
    title: "Beaches",
    subtitle: "India's most stunning coastal escapes",
    items: [
      {
        id: "goa-beaches",
        name: "Goa Beaches",
        slug: "goa-india",
        description: "India's beach capital — from party shores to hidden coves.",
        image: "/images/explore/goa-beaches.jpg",
      },
      {
        id: "andaman",
        name: "Andaman Islands",
        slug: "andaman-islands",
        description: "Crystal-clear waters, coral reefs, and untouched tropical paradise.",
        image: "/images/explore/andaman.jpg",
      },
      {
        id: "varkala",
        name: "Varkala",
        slug: "varkala",
        description: "Dramatic cliff beaches overlooking the Arabian Sea in Kerala.",
        image: "/images/explore/varkala.jpg",
      },
      {
        id: "gokarna",
        name: "Gokarna",
        slug: "gokarna",
        description: "A spiritual town with pristine hidden beaches — Goa's quieter alternative.",
        image: "/images/explore/gokarna.jpg",
      },
    ],
  },
  {
    id: "hills",
    categoryKey: "hills",
    title: "Hill Stations",
    subtitle: "Cool retreats amidst misty peaks and tea gardens",
    items: [
      {
        id: "shimla",
        name: "Shimla",
        slug: "shimla",
        description: "The Queen of Hills — colonial charm and snowy Himalayan views.",
        image: "/images/explore/shimla.jpg",
      },
      {
        id: "munnar",
        name: "Munnar",
        slug: "munnar",
        description: "Endless rolling tea plantations amidst misty Kerala highlands.",
        image: "/images/explore/munnar.jpg",
      },
      {
        id: "darjeeling",
        name: "Darjeeling",
        slug: "darjeeling",
        description: "The Tea Capital — Kanchenjunga views and the iconic toy train.",
        image: "/images/explore/darjeeling.jpg",
      },
      {
        id: "ooty",
        name: "Ooty",
        slug: "ooty",
        description: "The Queen of Nilgiris — botanical gardens and misty eucalyptus forests.",
        image: "/images/explore/ooty.jpg",
      },
    ],
  },
  {
    id: "mountains",
    categoryKey: "mountains",
    title: "Mountains & Valleys",
    subtitle: "Majestic Himalayan peaks and dramatic landscapes",
    items: [
      {
        id: "ladakh",
        name: "Ladakh",
        slug: "ladakh",
        description: "The Land of High Passes — surreal moonscapes and Buddhist monasteries.",
        image: "/images/explore/ladakh.jpg",
      },
      {
        id: "manali",
        name: "Manali",
        slug: "manali",
        description: "Snow-capped peaks, pine forests, and the gateway to high Himalayas.",
        image: "/images/explore/manali.jpg",
      },
      {
        id: "spiti",
        name: "Spiti Valley",
        slug: "spiti-valley",
        description: "India's cold desert — remote monasteries and raw Himalayan beauty.",
        image: "/images/explore/spiti.jpg",
      },
    ],
  },
  {
    id: "wildlife",
    categoryKey: "wildlife",
    title: "Adventure & Wildlife",
    subtitle: "Thrilling experiences for the bold traveler",
    items: [
      {
        id: "meghalaya",
        name: "Meghalaya",
        slug: "meghalaya",
        description: "Living root bridges, crystal rivers, and the wettest place on earth.",
        image: "/images/explore/meghalaya.jpg",
      },
      {
        id: "jimcorbett",
        name: "Jim Corbett",
        slug: "jim-corbett",
        description: "India's oldest national park — the best place to spot Bengal tigers.",
        image: "/images/explore/jimcorbett.jpg",
      },
      {
        id: "rishikesh-adv",
        name: "Rishikesh Adventure",
        slug: "rishikesh",
        description: "Indian adventure capital — bungee jumping, rafting, and cliff jumping.",
        image: "/images/explore/rishikesh-adv.jpg",
      },
    ],
  },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const handleTabClick = (categoryKey: string, sectionId: string) => {
    setActiveTab(categoryKey);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-[#080808] text-white min-h-screen pb-24 -mt-2 -mx-4 sm:-mx-8">
      {/* Category Navigation Pills Bar */}
      <div className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-md border-b border-[#d4b88a]/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
          {CATEGORIES.map((cat, idx) => {
            const sectionMap: Record<string, string> = {
              all: "iconic",
              spiritual: "spiritual",
              beaches: "beaches",
              hills: "hills",
              mountains: "mountains",
              wildlife: "wildlife",
            };
            const targetSection = sectionMap[cat.id] || "iconic";
            const isActive = activeTab === cat.id;

            return (
              <button
                key={idx}
                onClick={() => handleTabClick(cat.id, targetSection)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-[11px] font-serif font-medium tracking-widest uppercase transition-all duration-300 border ${
                  isActive
                    ? "bg-[#d4b88a] text-black border-[#d4b88a] font-semibold shadow-[0_0_15px_rgba(212,184,138,0.3)]"
                    : "bg-black/60 text-[#d4b88a] border-[#d4b88a]/40 hover:border-[#d4b88a] hover:bg-[#d4b88a]/10"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Banner Header */}
      <div className="relative w-full h-[360px] sm:h-[440px] overflow-hidden flex items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/explore/agra.jpg"
            alt="A Land of Timeless Majesty"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/50 to-black/60" />
        </div>
        <div className="relative z-10 px-4 max-w-4xl space-y-3">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-[#d4b88a] tracking-wide drop-shadow-md">
            A Land of Timeless Majesty
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-white/70 tracking-wider">
            Explore celebrated heritage, sacred sanctuaries, beaches, and majestic Himalayan landscapes.
          </p>
        </div>
      </div>

      {/* Sections Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-8">
        {SECTIONS.map((section) => (
          <div id={section.id} key={section.id} className="scroll-mt-20 space-y-8">
            {/* Section Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#d4b88a] tracking-wide">
                {section.title}
              </h2>
              <p className="text-xs sm:text-sm font-serif italic text-white/60">
                {section.subtitle}
              </p>
              <div className="w-16 h-0.5 bg-[#d4b88a]/60 mx-auto rounded-full mt-3" />
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="group bg-[#0e0e0e] border border-[#d4b88a]/25 hover:border-[#d4b88a]/70 rounded-2xl overflow-hidden flex flex-col justify-between text-center transition-all duration-300 shadow-xl hover:shadow-[0_0_25px_rgba(212,184,138,0.15)]"
                >
                  {/* Card Image */}
                  <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-black">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between items-center space-y-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif text-[#d4b88a] font-medium tracking-wide mb-2 group-hover:text-amber-200 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-white/70 font-light leading-relaxed max-w-xs mx-auto">
                        {item.description}
                      </p>
                    </div>

                    {/* More Info Button */}
                    <Link
                      href={`/dashboard/explore/${item.slug}`}
                      className="inline-block mt-2 px-6 py-2 rounded-md border border-[#d4b88a] text-[#d4b88a] hover:bg-[#d4b88a] hover:text-black font-serif text-[11px] font-semibold tracking-widest uppercase transition-all duration-300 shadow-sm"
                    >
                      MORE INFO
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


