"use client";

import { Star, ThumbsUp, MessageSquare, Filter } from "lucide-react";

const reviews = [
  { place: "Fushimi Inari Shrine", location: "Kyoto, Japan", rating: 5, text: "Absolutely mesmerizing at sunrise. The thousand gates create an otherworldly corridor of vermillion. Arrive before 7am to beat the crowds.", author: "You", date: "Oct 14, 2026", likes: 12, replies: 3 },
  { place: "Kikunoi Kaiseki", location: "Higashiyama, Kyoto", rating: 5, text: "A masterpiece of Japanese culinary art. The 12-course meal was a journey through seasons. The uni course alone was worth the visit.", author: "You", date: "Oct 14, 2026", likes: 8, replies: 1 },
  { place: "Arashiyama Bamboo Grove", location: "Ukyo, Kyoto", rating: 4, text: "Magical towering bamboo. Gets very crowded midday — NAVORA's suggestion to visit at 7:30am was perfect. Slightly shorter than expected.", author: "You", date: "Oct 15, 2026", likes: 5, replies: 0 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-primary text-primary" : "text-white/15"}`} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-4xl font-serif font-medium text-white tracking-wide mb-3">My Reviews</h1>
          <p className="text-lg text-white/60">Share your experiences and earn NAVORA Coins.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#111111] border border-white/10 rounded-full text-sm font-medium text-white/60 hover:text-white hover:border-white/20 transition-colors">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="space-y-4">
        {reviews.map((review, i) => (
          <div key={i} className="bg-[#111111] rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-serif font-medium text-lg text-white">{review.place}</h3>
                <div className="text-sm text-white/40">{review.location}</div>
              </div>
              <StarRating rating={review.rating} />
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">{review.text}</p>
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="text-xs text-white/30">{review.date}</div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-xs text-white/40 hover:text-primary transition-colors"><ThumbsUp className="w-3.5 h-3.5" /> {review.likes}</button>
                <button className="flex items-center gap-1 text-xs text-white/40 hover:text-primary transition-colors"><MessageSquare className="w-3.5 h-3.5" /> {review.replies}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
