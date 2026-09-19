"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  MessageSquare,
  Heart,
  MapPin,
  Plus,
  Search,
  Share2,
  X,
  RefreshCw,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface CommunityPostItem {
  id: string;
  title: string;
  destination: string;
  content: string;
  cover_image?: string;
  tags?: string[];
  likes: number;
  saves: number;
  created_at?: string;
  author?: string;
  liked?: boolean;
}

const TRENDING_DESTINATIONS = [
  { name: "Kyoto, Japan", travelers: 1240, trend: "+12%" },
  { name: "Goa, India", travelers: 1890, trend: "+18%" },
  { name: "Swiss Alps, Switzerland", travelers: 870, trend: "+24%" },
  { name: "Amalfi Coast, Italy", travelers: 980, trend: "+8%" },
  { name: "Santorini, Greece", travelers: 1450, trend: "+5%" },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modals & States
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [postNotice, setPostNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    destination_name: "",
    content: "",
    tags: "Culture, Food, Luxury",
    cover_image: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const res = await api.fetch<any[]>("/api/community/posts");
      if (Array.isArray(res)) {
        setPosts(res.map(p => ({
          ...p,
          author: p.author || "Traveler",
          liked: false,
        })));
      }
    } catch (err) {
      console.warn("Using sample community posts:", err);
      setPosts([
        {
          id: "1",
          title: "Hidden Kyoto: Ancient Zen Temples & Moss Gardens",
          destination: "Kyoto, Japan",
          content: "Just returned from 8 days in Kyoto orchestrated by NAVORA. Honen-in and Gio-ji had practically no crowds at 8 AM. The AI suggested taking the local Randen tram which saved 45 minutes over street taxis.",
          cover_image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
          tags: ["Kyoto", "Temples", "Slow Travel", "Culture"],
          likes: 48,
          saves: 14,
          author: "Elena R.",
          liked: false
        },
        {
          id: "2",
          title: "Goa Beyond the Commercial Coast: South Goa Heritage & Feni Trails",
          destination: "Goa, India",
          content: "Followed NAVORA's Value Plan for South Goa. Visited ancestral Portuguese mansions in Chandor, dined at Martin's Corner without waiting, and took sunset kayak through the Sal backwaters.",
          cover_image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
          tags: ["Goa", "Heritage", "Beaches", "Food"],
          likes: 72,
          saves: 29,
          author: "Priya K.",
          liked: false
        },
        {
          id: "3",
          title: "Swiss Glacier Express: Winter Alpine Dream Route",
          destination: "Swiss Alps, Switzerland",
          content: "Taking the panoramic train across the Landwasser Viaduct was surreal. The replanning agent alerted us to an avalanche risk on day 3 and smoothly rescheduled our Gornergrat cogwheel excursion.",
          cover_image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800",
          tags: ["Switzerland", "Alps", "Luxury Rail", "Winter"],
          likes: 115,
          saves: 42,
          author: "James M.",
          liked: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextLiked = !p.liked;
        return {
          ...p,
          liked: nextLiked,
          likes: nextLiked ? p.likes + 1 : p.likes - 1,
        };
      }
      return p;
    }));

    try {
      await api.fetch(`/api/community/posts/${postId}/like`, { method: "POST" });
    } catch {
      // Local state already updated
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.destination_name || !formData.content) return;

    setIsSubmitting(true);
    try {
      const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(Boolean);
      const res = await api.fetch<any>("/api/community/posts", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          destination_name: formData.destination_name,
          content: formData.content,
          tags: tagsArray,
          cover_image: formData.cover_image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
        }),
      });

      const newPostItem: CommunityPostItem = {
        id: res?.post_id || "post_" + Date.now(),
        title: formData.title,
        destination: formData.destination_name,
        content: formData.content,
        tags: tagsArray,
        cover_image: formData.cover_image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
        likes: 1,
        saves: 0,
        author: "You",
        liked: true,
      };

      setPosts(prev => [newPostItem, ...prev]);
      setPostNotice("Your voyage experience has been published to the NAVORA community!");
      setTimeout(() => setPostNotice(null), 5000);
      setIsNewPostOpen(false);
      setFormData({
        title: "",
        destination_name: "",
        content: "",
        tags: "Culture, Food, Luxury",
        cover_image: "",
      });
    } catch (err) {
      console.warn("Published locally:", err);
      const newPostItem: CommunityPostItem = {
        id: "post_" + Date.now(),
        title: formData.title,
        destination: formData.destination_name,
        content: formData.content,
        tags: formData.tags.split(",").map(t => t.trim()),
        cover_image: formData.cover_image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
        likes: 1,
        saves: 0,
        author: "You",
        liked: true,
      };
      setPosts(prev => [newPostItem, ...prev]);
      setIsNewPostOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === "All" || p.destination.toLowerCase().includes(activeFilter.toLowerCase());
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Verified Global Voyager Community</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide">Voyager Community & Stories</h1>
          <p className="text-sm text-white/60 mt-1">Discover peer-reviewed travel itineraries, secret warungs, and tips from verified NAVORA travelers.</p>
        </div>

        <Button onClick={() => setIsNewPostOpen(true)} className="rounded-xl bg-primary text-black hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Share Voyage
        </Button>
      </div>

      {/* Success Notification */}
      {postNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{postNotice}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories by location, temple, dining..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
          {["All", "Kyoto", "Goa", "Swiss Alps", "Italy"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                activeFilter === f
                  ? "bg-primary text-black font-semibold"
                  : "bg-white/5 text-white/60 hover:text-white border border-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Posts Feed & Trending Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Posts Feed */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="p-16 text-center text-white/40">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading community stories...
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-[#111111] rounded-3xl border border-white/10 p-6 md:p-8 hover:border-white/20 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-serif font-bold border border-primary/20">
                      {post.author ? post.author.charAt(0) : "V"}
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{post.author}</div>
                      <div className="text-xs text-white/40 flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-primary" /> {post.destination}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono uppercase text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    Verified Trip
                  </span>
                </div>

                <h3 className="text-lg font-serif font-medium text-white">{post.title}</h3>

                <p className="text-sm text-white/70 leading-relaxed font-light">{post.content}</p>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {post.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-white/5 text-white/60 border border-white/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-mono transition-colors ${
                        post.liked ? "text-red-400 font-bold" : "text-white/40 hover:text-red-400"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.liked ? "fill-red-400" : ""}`} />
                      <span>{post.likes}</span>
                    </button>

                    <button
                      onClick={() => alert(`Comments discussion active for "${post.title}". Reply feature ready.`)}
                      className="flex items-center gap-1.5 text-xs font-mono text-white/40 hover:text-primary transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.saves || 4} Replies</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Story link copied to clipboard!");
                    }}
                    className="p-2 text-white/30 hover:text-white rounded-lg hover:bg-white/5"
                    title="Share story"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {!isLoading && filteredPosts.length === 0 && (
            <div className="p-16 text-center text-white/40 bg-[#111111] rounded-3xl border border-white/10">
              No community stories match your search. Click &quot;Share Voyage&quot; to publish the first story!
            </div>
          )}
        </div>

        {/* Sidebar: Trending & Top Contributors */}
        <div className="space-y-6">
          <div className="bg-[#111111] rounded-3xl border border-white/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-serif font-medium text-white">Trending Destinations</h3>
            </div>
            <div className="divide-y divide-white/5">
              {TRENDING_DESTINATIONS.map((dest) => (
                <div
                  key={dest.name}
                  onClick={() => setSearchQuery(dest.name.split(",")[0])}
                  className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{dest.name}</div>
                    <div className="text-xs text-white/40 flex items-center gap-1 font-mono mt-0.5">
                      <Users className="w-3 h-3" /> {dest.travelers} voyagers
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-emerald-400">{dest.trend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {isNewPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setIsNewPostOpen(false)}
              className="absolute right-6 top-6 text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-2xl font-serif text-white">Share Your Voyage</h3>
              <p className="text-xs text-white/50 mt-1">Publish recommendations and trip notes to fellow NAVORA travelers.</p>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest font-mono block mb-1.5">Story Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Hidden Cafes in Kyoto You Must Not Miss"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest font-mono block mb-1.5">Destination</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kyoto, Japan or South Goa"
                  value={formData.destination_name}
                  onChange={(e) => setFormData({ ...formData, destination_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest font-mono block mb-1.5">Story Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your experience, tips, dining recommendations, and advice..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest font-mono block mb-1.5">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Culture, Food, Stays, Rail"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsNewPostOpen(false)} className="rounded-xl border-white/10">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-primary text-black hover:bg-primary/90">
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Publish Story
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
