"use client";

import Link from "next/link";
import { Calendar, MapPin, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ItinerariesPage() {
  const activeItineraries = [
    {
      id: "draft-123",
      title: "Romantic Getaway in Amalfi",
      destinations: ["Amalfi Coast, Italy"],
      dates: "Sep 15 - Sep 25, 2026",
      status: "Planning",
      image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: "draft-124",
      title: "Tokyo Tech & Culture",
      destinations: ["Tokyo, Japan", "Kyoto, Japan"],
      dates: "Nov 01 - Nov 14, 2026",
      status: "Booked",
      image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop"
    }
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-4xl font-serif font-medium text-white tracking-wide mb-3">
            My Journeys
          </h1>
          <p className="text-lg text-white/60">
            View and manage your orchestrated travel experiences.
          </p>
        </div>
        <Link href="/dashboard/plan">
          <Button className="rounded-full h-12 px-6">
            <Plus className="w-5 h-5 mr-2" />
            New Journey
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeItineraries.map((itinerary) => (
          <Link 
            key={itinerary.id} 
            href={`/dashboard/itineraries/${itinerary.id}`}
            className="group flex flex-col sm:flex-row bg-[#111111] border border-white/10 rounded-3xl overflow-hidden hover:border-primary/30 transition-all"
          >
            <div className="sm:w-2/5 h-48 sm:h-auto relative">
              <img 
                src={itinerary.image} 
                alt={itinerary.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full text-primary border border-primary/20">
                {itinerary.status}
              </div>
            </div>
            <div className="p-6 sm:w-3/5 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-serif font-medium text-white group-hover:text-primary transition-colors mb-4">
                  {itinerary.title}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-primary" />
                    {itinerary.destinations.join(" • ")}
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                    <Calendar className="w-4 h-4 text-primary" />
                    {itinerary.dates}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center text-primary font-medium text-sm">
                View Details
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
