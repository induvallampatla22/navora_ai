"use client";

import { useState } from "react";
import { GripVertical, Plus, Settings } from "lucide-react";

// For this prototype we'll create a simplified UI builder without complex dnd libraries

export default function ItineraryBuilderPage() {
  const [days, setDays] = useState([
    {
      id: "day-1",
      title: "Day 1: Arrival & Check-in",
      items: [
        { id: "item-1", content: "Transfer from Airport", type: "Transport" },
        { id: "item-2", content: "Check-in at Hotel", type: "Stay" },
        { id: "item-3", content: "Dinner Reservations", type: "Dining" }
      ]
    },
    {
      id: "day-2",
      title: "Day 2: City Exploration",
      items: [
        { id: "item-4", content: "Morning Guided Tour", type: "Activity" },
        { id: "item-5", content: "Lunch at Local Market", type: "Dining" },
        { id: "item-6", content: "Museum Visit", type: "Activity" }
      ]
    }
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-medium text-foreground tracking-tight">
            Itinerary Builder
          </h1>
          <p className="mt-2 text-lg text-secondary/70">
            Drag and drop to reorder activities and perfect your schedule.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-full font-medium hover:bg-secondary/90 transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>

      <div className="space-y-6">
        {days.map((day) => (
          <div key={day.id} className="bg-white rounded-2xl border border-secondary/10 shadow-sm overflow-hidden">
            <div className="bg-secondary/5 px-6 py-4 flex items-center justify-between border-b border-secondary/10">
              <h3 className="text-lg font-serif font-medium text-foreground">{day.title}</h3>
              <button className="text-primary hover:text-primary/80 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {day.items.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-4 bg-background p-4 rounded-xl border border-secondary/10 group cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5 text-secondary/30 group-hover:text-secondary/50 transition-colors shrink-0" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="font-medium text-foreground">{item.content}</span>
                    <span className="text-xs px-3 py-1 bg-secondary/10 text-secondary/70 rounded-full font-medium">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button className="w-full py-4 border-2 border-dashed border-secondary/20 rounded-2xl text-secondary/50 font-medium hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          Add Another Day
        </button>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-secondary/10">
        <button className="px-8 py-4 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
          Save Itinerary
        </button>
      </div>
    </div>
  );
}
