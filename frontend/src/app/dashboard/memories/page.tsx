"use client";

import { Camera, MapPin, Calendar, Heart, Share2 } from "lucide-react";

const memories = [
  { trip: "Kyoto Autumn Journey", date: "Oct 12–17, 2026", coverEmoji: "🍂", location: "Kyoto, Japan", highlights: 24, photos: 156, favorite: true },
  { trip: "Amalfi Summer Escape", date: "Jul 5–12, 2026", coverEmoji: "🌊", location: "Amalfi Coast, Italy", highlights: 18, photos: 203, favorite: true },
  { trip: "Swiss Alps Adventure", date: "Mar 1–8, 2026", coverEmoji: "🏔️", location: "Zermatt, Switzerland", highlights: 12, photos: 89, favorite: false },
  { trip: "Marrakech Discovery", date: "Jan 15–20, 2026", coverEmoji: "🕌", location: "Marrakech, Morocco", highlights: 15, photos: 134, favorite: false },
];

export default function MemoriesPage() {
  return (
    <div className="space-y-10 pb-20">
      <div className="pt-4">
        <h1 className="text-4xl font-serif font-medium text-white tracking-wide mb-3">Trip Memories</h1>
        <p className="text-lg text-white/60">Relive your journeys. Every adventure, beautifully preserved.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {memories.map((memory, i) => (
          <div key={i} className="group bg-[#111111] rounded-3xl border border-white/10 overflow-hidden hover:border-primary/30 transition-all cursor-pointer">
            <div className="h-48 bg-gradient-to-br from-primary/10 to-white/5 flex items-center justify-center relative">
              <div className="text-7xl group-hover:scale-110 transition-transform duration-300">{memory.coverEmoji}</div>
              {memory.favorite && (
                <div className="absolute top-4 right-4"><Heart className="w-6 h-6 fill-red-500 text-red-500" /></div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-serif font-medium text-white mb-2">{memory.trip}</h3>
              <div className="flex items-center gap-4 text-sm text-white/40 mb-4">
                <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {memory.location}</div>
                <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {memory.date}</div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-4 text-sm text-white/40">
                  <span className="flex items-center gap-1"><Camera className="w-4 h-4" /> {memory.photos} photos</span>
                  <span>{memory.highlights} highlights</span>
                </div>
                <button className="p-2 text-white/30 hover:text-primary transition-colors rounded-lg hover:bg-white/5"><Share2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
