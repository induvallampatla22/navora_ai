"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plane,
  Train,
  Hotel,
  MapPin,
  Star,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Mail,
  Phone,
  Globe2,
  CheckCircle2,
  Calendar,
  CreditCard,
  Headphones,
  Coins
} from "lucide-react";

export default function Home() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactLoading(true);
    setTimeout(() => {
      setContactLoading(false);
      setContactSubmitted(true);
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070707] text-[#f4f2ee] selection:bg-[#d4b88a]/30">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-[#070707]/85 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#d4b88a] flex items-center justify-center shadow-[0_0_20px_rgba(212,184,138,0.25)]">
              <div className="w-3.5 h-3.5 bg-[#070707] rounded-sm transform rotate-45"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif tracking-[0.25em] font-semibold text-white">NAVORA</span>
              <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#d4b88a]">More Than Travel</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-medium text-white/70">
            <Link href="#about" className="hover:text-[#d4b88a] transition-colors">About</Link>
            <Link href="#destinations" className="hover:text-[#d4b88a] transition-colors">Destinations</Link>
            <Link href="#experiences" className="hover:text-[#d4b88a] transition-colors">Experiences</Link>
            <Link href="#how-it-works" className="hover:text-[#d4b88a] transition-colors">How It Works</Link>
            <Link href="#reviews" className="hover:text-[#d4b88a] transition-colors">Reviews</Link>
            <Link href="#contact" className="hover:text-[#d4b88a] transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-xs uppercase tracking-wider font-semibold text-white/80 hover:text-white hover:bg-white/5 px-4 h-10 rounded-full">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-[#d4b88a] text-black text-xs uppercase tracking-wider font-bold hover:bg-[#c4a87a] px-5 h-10 rounded-full shadow-[0_0_20px_rgba(212,184,138,0.2)]">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[92vh] flex items-center pt-24 overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/90 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-[#070707]/50 z-10" />
            <img
              src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop"
              alt="Luxury Travel Experience"
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="relative z-20 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 py-16">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4b88a]/10 border border-[#d4b88a]/30 w-fit mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#d4b88a]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4b88a]">Your Complete Travel Companion</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-white font-normal leading-[1.1] mb-6">
                Your Journey.<br />
                <span className="italic font-light text-[#d4b88a]">Perfected</span> from<br />
                Start to Finish.
              </h1>

              <p className="text-base sm:text-lg text-white/80 font-sans mb-8 max-w-xl leading-relaxed">
                Plan your trip, compare options, book your stay, and get help while you travel — all in one place.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 items-center mb-10">
                <Link href="/auth/register">
                  <Button className="h-13 px-8 rounded-full bg-[#d4b88a] text-black font-bold text-sm hover:bg-[#c4a87a] flex items-center gap-2 shadow-[0_0_25px_rgba(212,184,138,0.25)]">
                    Start Planning Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="h-13 px-8 rounded-full border-white/20 text-white hover:bg-white/5 font-medium text-sm">
                    Member Sign In
                  </Button>
                </Link>
              </div>

              {/* Highlight Badges */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-white/60">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Plane className="w-4 h-4 text-[#d4b88a]" /> Worldwide Flights
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Train className="w-4 h-4 text-[#d4b88a]" /> Trains & Rail
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Hotel className="w-4 h-4 text-[#d4b88a]" /> Handpicked Stays
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <MapPin className="w-4 h-4 text-[#d4b88a]" /> Guided Tours
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 hidden lg:flex flex-col justify-end items-end pb-8">
              <div className="bg-[#111111]/85 backdrop-blur-md p-8 rounded-3xl border border-white/10 max-w-sm shadow-2xl space-y-4">
                <div className="flex items-center gap-1 text-[#d4b88a]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-lg font-serif italic text-white/90 leading-snug">
                  "NAVORA made planning our 2-week journey effortless. Everything was organized perfectly in one place."
                </p>
                <div className="pt-2 border-t border-white/5 text-xs text-white/50 font-mono">
                  Verified Traveler • London, UK
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 bg-[#0a0a0a] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#d4b88a] block mb-3">About NAVORA</span>
                <h2 className="text-3xl sm:text-5xl font-serif text-white font-normal leading-tight mb-6">
                  Simple, Stress-Free Travel Planning
                </h2>
                <p className="text-base sm:text-lg text-white/70 leading-relaxed font-sans mb-6">
                  NAVORA brings together everything you need for travel into a single, beautifully organized experience. Instead of juggling dozens of tabs, booking emails, and spreadsheets, you get one unified platform.
                </p>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed font-sans mb-8">
                  From comparing flights and trains side-by-side to finding the best boutique stays, tracking group expenses, and getting live updates if plans change — NAVORA takes care of the details so you can enjoy the journey.
                </p>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                  <div>
                    <div className="text-3xl font-serif text-[#d4b88a] font-light">Worldwide</div>
                    <div className="text-xs uppercase tracking-wider text-white/50 mt-1">Destinations Covered</div>
                  </div>
                  <div>
                    <div className="text-3xl font-serif text-[#d4b88a] font-light">100%</div>
                    <div className="text-xs uppercase tracking-wider text-white/50 mt-1">Clear & Transparent Pricing</div>
                  </div>
                </div>
              </div>

              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
                  alt="NAVORA Travel Suite"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#d4b88a] mb-1">Modern Travel</div>
                  <div className="text-lg font-serif">Designed for travelers who value time and comfort.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Destinations Section */}
        <section id="destinations" className="py-24 bg-[#070707] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#d4b88a] block mb-3">Popular Places</span>
                <h2 className="text-3xl sm:text-5xl font-serif text-white font-normal">Featured Destinations</h2>
              </div>
              <p className="text-white/60 max-w-md text-sm">
                Explore handpicked destinations with detailed guides, weather insights, stays, and activities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Goa", country: "India", tags: "Beach • Stays", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop", desc: "Golden beaches, historic heritage villas, and relaxing coastal living." },
                { name: "Paris", country: "France", tags: "Culture • Romantic", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop", desc: "Iconic architecture, world-famous food, and scenic promenades along the Seine." },
                { name: "Kyoto", country: "Japan", tags: "Heritage • Spiritual", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop", desc: "Tranquil bamboo forests, historic temples, and traditional tea houses." },
                { name: "Swiss Alps", country: "Switzerland", tags: "Mountains • Nature", img: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop", desc: "Snow-covered peaks, scenic train rides, and crystal-clear mountain lakes." }
              ].map((dest, i) => (
                <div key={i} className="group relative h-[400px] rounded-3xl overflow-hidden border border-white/10 bg-[#111111] transition-all hover:border-[#d4b88a]/40 shadow-lg">
                  <img src={dest.img} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                  <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end">
                    <span className="text-xs uppercase tracking-wider text-[#d4b88a] mb-1">{dest.country} · {dest.tags}</span>
                    <h3 className="text-2xl font-serif text-white mb-2">{dest.name}</h3>
                    <p className="text-xs text-white/70 leading-relaxed mb-4">{dest.desc}</p>
                    <Link href="/auth/register" className="text-xs font-semibold uppercase tracking-wider text-[#d4b88a] hover:underline inline-flex items-center gap-1">
                      Explore In App <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experiences Section */}
        <section id="experiences" className="py-24 bg-[#0a0a0a] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#d4b88a] block mb-3">Memorable Activities</span>
              <h2 className="text-3xl sm:text-5xl font-serif text-white font-normal mb-4">Handcrafted Experiences</h2>
              <p className="text-white/60 text-sm">
                Discover unforgettable activities vetted for quality and comfort in every city.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Sunset Catamaran Sailing", loc: "Goa & Coastal Waters", icon: "⛵", desc: "Relaxing evening boat cruise along the coast with refreshing drinks and scenic views." },
                { title: "Scenic Alpine Cableway Tour", loc: "Swiss Alps & Zermatt", icon: "🚠", desc: "Ride panoramic mountain cable cars with breathtaking views of glacial peaks." },
                { title: "Guided Morning Market & Food Walk", loc: "Kyoto & Tokyo", icon: "🍱", desc: "Discover local street food, authentic tea spots, and hidden neighborhood gems." }
              ].map((exp, idx) => (
                <div key={idx} className="bg-[#111111] border border-white/10 rounded-3xl p-8 hover:border-[#d4b88a]/30 transition-all">
                  <div className="text-4xl mb-5">{exp.icon}</div>
                  <span className="text-xs uppercase tracking-wider text-[#d4b88a] block mb-2">{exp.loc}</span>
                  <h3 className="text-xl font-serif text-white mb-3">{exp.title}</h3>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans">{exp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-[#070707] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#d4b88a] block mb-3">Simple Steps</span>
              <h2 className="text-3xl sm:text-5xl font-serif text-white font-normal leading-tight">
                How NAVORA Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { step: "01", icon: Calendar, title: "Enter Your Preferences", desc: "Select your destination, travel dates, budget, group size, and interests." },
                { step: "02", icon: MapPin, title: "Compare Options", desc: "Compare flights, trains, hotels, and packages side-by-side with clear pricing." },
                { step: "03", icon: Sparkles, title: "Pick Your Plan", desc: "Choose from smart Value, Comfort, and Premium plan options tailored to your budget." },
                { step: "04", icon: CreditCard, title: "Easy Booking", desc: "Reserve stays, transport, and tours easily with clear confirmation and receipts." },
                { step: "05", icon: Headphones, title: "Live Travel Help", desc: "Get weather updates, transit notifications, and smart replanning if delays happen." },
                { step: "06", icon: Coins, title: "Earn Rewards", desc: "Collect NAVORA travel coins on completed trips to use toward future bookings." }
              ].map((item, i) => (
                <div key={i} className="bg-[#111111] border border-white/10 rounded-2xl p-7 flex flex-col justify-between hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-serif font-light text-[#d4b88a]">{item.step}</span>
                      <item.icon className="w-5 h-5 text-white/40" />
                    </div>
                    <h3 className="text-lg font-serif text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-white/60 leading-relaxed font-sans">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section id="reviews" className="py-24 bg-[#0a0a0a] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-16">
              <span className="text-xs tracking-[0.25em] font-semibold text-[#d4b88a] uppercase mb-3">Traveler Feedback</span>
              <h2 className="text-3xl sm:text-5xl font-serif text-white font-normal">What Our Travelers Say</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Elenora Vance", loc: "London, UK", text: "NAVORA replaced three different apps for us. Comparing trains and flights side by side saved us hours, and our itinerary was easy to follow." },
                { name: "Dr. Vikram Sethi", loc: "Bengaluru, India", text: "The budget and expense tracking features made our family trip completely hassle-free. Everything was clear from start to finish." },
                { name: "Sophia Chen", loc: "San Francisco, USA", text: "The recommendations for stays and restaurants in Kyoto were spot on. The app is clean, fast, and very easy to use." }
              ].map((rev, i) => (
                <div key={i} className="bg-[#111111] border border-white/10 rounded-3xl p-8 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center gap-1 text-[#d4b88a] mb-4">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans italic mb-6">
                      "{rev.text}"
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <div className="font-serif text-white text-sm font-medium">{rev.name}</div>
                    <div className="text-xs text-white/40">{rev.loc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-[#070707] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#d4b88a] block mb-3">Get in Touch</span>
                <h2 className="text-3xl sm:text-5xl font-serif text-white font-normal mb-6">
                  Contact NAVORA Support
                </h2>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed font-sans mb-8">
                  Have a question about planning, bookings, or partner inquiries? Our travel support team is here to help you.
                </p>

                <div className="space-y-4 text-xs sm:text-sm text-white/80">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#d4b88a]" />
                    <span>support@navora.ai</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe2 className="w-4 h-4 text-[#d4b88a]" />
                    <span>Worldwide Support Across All Destinations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#d4b88a]" />
                    <span>Secure & Encrypted Booking Platform</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 space-y-6">
                <h3 className="text-xl font-serif text-white">Send Us a Message</h3>

                {contactSubmitted ? (
                  <div className="p-6 rounded-2xl bg-primary/10 border border-primary/25 text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
                    <h4 className="text-base font-serif text-white">Thank You, {contactForm.name}!</h4>
                    <p className="text-xs text-white/70">
                      Your inquiry has been received. Our team will get back to you at <span className="text-white font-medium">{contactForm.email}</span> shortly.
                    </p>
                    <Button
                      onClick={() => {
                        setContactSubmitted(false);
                        setContactForm({ name: "", email: "", message: "" });
                      }}
                      className="mt-2 text-xs bg-white/10 text-white hover:bg-white/20 rounded-full h-9 px-4"
                    >
                      Send Another Note
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <Input
                      placeholder="Your Full Name"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="h-11 bg-black/40 border-white/10 text-white text-xs rounded-xl"
                    />
                    <Input
                      placeholder="Email Address"
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="h-11 bg-black/40 border-white/10 text-white text-xs rounded-xl"
                    />
                    <textarea
                      placeholder="How can we help with your trip?"
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none resize-none"
                    />
                    <Button
                      type="submit"
                      disabled={contactLoading || !contactForm.name || !contactForm.email || !contactForm.message}
                      className="w-full h-11 bg-[#d4b88a] text-black font-semibold hover:bg-[#c4a87a] rounded-full text-xs uppercase tracking-wider"
                    >
                      {contactLoading ? "Sending..." : "Submit Inquiry"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-[#0a0a0a] text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#d4b88a]">Ready to Travel?</span>
            <h2 className="text-4xl sm:text-5xl font-serif text-white font-normal leading-tight">
              Start Planning Your Next Trip Today
            </h2>
            <p className="text-sm sm:text-base text-white/60 max-w-lg mx-auto font-sans leading-relaxed">
              Create your account in seconds. Plan your trip, compare all transit options, and travel with peace of mind.
            </p>
            <div className="pt-4 flex justify-center gap-4 flex-wrap">
              <Link href="/auth/register">
                <Button className="h-13 px-8 rounded-full bg-[#d4b88a] text-black font-bold text-sm hover:bg-[#c4a87a] shadow-[0_0_25px_rgba(212,184,138,0.25)]">
                  Create NAVORA Account
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="h-13 px-8 rounded-full border-white/20 text-white hover:bg-white/5 text-sm font-medium">
                  Member Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#050505] pt-16 pb-10 border-t border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#d4b88a] flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-[#050505] rounded-sm transform rotate-45"></div>
              </div>
              <span className="text-xl font-serif tracking-[0.2em] font-semibold text-white">NAVORA</span>
            </div>
            <p className="text-white/50 max-w-sm text-xs leading-relaxed font-sans">
              Plan your trip, compare options, book your stay, and get help while you travel — all in one place.
            </p>
          </div>
          <div>
            <h4 className="font-serif text-white text-sm mb-3">Explore</h4>
            <ul className="space-y-2 text-white/50 font-sans">
              <li><Link href="#destinations" className="hover:text-[#d4b88a] transition-colors">Destinations</Link></li>
              <li><Link href="#experiences" className="hover:text-[#d4b88a] transition-colors">Experiences</Link></li>
              <li><Link href="#how-it-works" className="hover:text-[#d4b88a] transition-colors">How It Works</Link></li>
              <li><Link href="#about" className="hover:text-[#d4b88a] transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-white text-sm mb-3">Account</h4>
            <ul className="space-y-2 text-white/50 font-sans">
              <li><Link href="/auth/login" className="hover:text-[#d4b88a] transition-colors">Sign In</Link></li>
              <li><Link href="/auth/register" className="hover:text-[#d4b88a] transition-colors">Create Account</Link></li>
              <li><Link href="/auth/forgot-password" className="hover:text-[#d4b88a] transition-colors">Reset Password</Link></li>
              <li><Link href="#contact" className="hover:text-[#d4b88a] transition-colors">Support & Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-white/40">
          <div>&copy; {new Date().getFullYear()} NAVORA Travel Platform. All rights reserved.</div>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
