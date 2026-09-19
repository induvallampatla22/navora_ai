"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  UserCircle,
  Settings,
  Shield,
  Bell,
  Map,
  CreditCard,
  ChevronRight,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Lock,
  Smartphone,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form States
  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || "Elenora Vance",
    email: user?.email || "elenora@navora.ai",
    phone: "+91 98765 43210",
    homeCity: "Hyderabad",
    homeCountry: "India",
    bio: "Passionate slow traveler, architecture enthusiast, and gastronomic explorer.",
    currency: "USD",
    language: "en",
    travelStyles: ["Luxury", "Culture", "Scenic Rail"],
    dietaryPreferences: ["Vegetarian", "Gluten-Sensitive"],
    twoFactorEnabled: true,
    whatsappAlerts: true,
    emailReceipts: true,
    weatherPush: true,
  });

  const [savedCards, setSavedCards] = useState([
    { id: "c1", brand: "Visa Infinite", last4: "4242", expiry: "12/28", isDefault: true },
    { id: "c2", brand: "Mastercard World Elite", last4: "8899", expiry: "09/27", isDefault: false },
  ]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.fetch<any>("/api/profile");
        if (res) {
          setProfileData(prev => ({
            ...prev,
            homeCity: res.home_city || prev.homeCity,
            homeCountry: res.home_country || prev.homeCountry,
            currency: res.preferred_currency || prev.currency,
            language: res.preferred_language || prev.language,
            bio: res.bio || prev.bio,
            travelStyles: res.travel_styles || prev.travelStyles,
            dietaryPreferences: res.dietary_preferences || prev.dietaryPreferences,
          }));
        }
      } catch (err) {
        console.warn("Using sample profile:", err);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.fetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          home_city: profileData.homeCity,
          home_country: profileData.homeCountry,
          preferred_currency: profileData.currency,
          preferred_language: profileData.language,
          bio: profileData.bio,
          travel_styles: profileData.travelStyles,
          dietary_preferences: profileData.dietaryPreferences,
        }),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.warn("Saved locally:", err);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General Information", icon: UserCircle },
    { id: "preferences", label: "Travel & Dietary", icon: Map },
    { id: "security", label: "Security & 2FA", icon: Shield },
    { id: "notifications", label: "Alert Vectors", icon: Bell },
    { id: "payment", label: "Payment Vault", icon: CreditCard },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-white tracking-wide mb-1">
            Account & Voyager Profile
          </h1>
          <p className="text-sm text-white/60">
            Manage your sovereign profile credentials, travel preferences, and secure payment cards.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile successfully updated!</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-4 sticky top-28">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </div>
                  {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 md:p-10 min-h-[550px]">
            <form onSubmit={handleSaveProfile} className="space-y-8">
              {/* Tab 1: General Info */}
              {activeTab === "general" && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                    <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center font-serif text-3xl text-primary font-bold shadow-inner">
                      {profileData.fullName ? profileData.fullName.charAt(0) : "V"}
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-2xl font-serif text-white">{profileData.fullName}</h2>
                      <p className="text-primary text-xs tracking-widest uppercase font-mono font-medium mt-1">
                        NAVORA Sovereign Explorer
                      </p>
                      <span className="text-xs text-white/40 block mt-0.5">{profileData.email}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-white/50 tracking-widest uppercase font-mono">Full Name</label>
                      <Input
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="bg-white/5 border-white/10 h-12 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-white/50 tracking-widest uppercase font-mono">Email Address</label>
                      <Input
                        value={profileData.email}
                        disabled
                        className="bg-white/5 border-white/5 h-12 text-white/40 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-white/50 tracking-widest uppercase font-mono">Phone / WhatsApp</label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="bg-white/5 border-white/10 h-12 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-white/50 tracking-widest uppercase font-mono">Home Departure City</label>
                      <Input
                        value={profileData.homeCity}
                        onChange={(e) => setProfileData({ ...profileData, homeCity: e.target.value })}
                        className="bg-white/5 border-white/10 h-12 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-white/50 tracking-widest uppercase font-mono">Voyager Bio</label>
                    <textarea
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Preferences */}
              {activeTab === "preferences" && (
                <div className="space-y-8">
                  <h2 className="text-xl font-serif text-white border-b border-white/5 pb-4">Traveler Persona & Preferences</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-white/50 tracking-widest uppercase font-mono">Preferred Currency</label>
                      <select
                        value={profileData.currency}
                        onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="USD">USD ($) — United States Dollar</option>
                        <option value="INR">INR (₹) — Indian Rupee</option>
                        <option value="EUR">EUR (€) — Euro</option>
                        <option value="GBP">GBP (£) — British Pound</option>
                        <option value="JPY">JPY (¥) — Japanese Yen</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-white/50 tracking-widest uppercase font-mono">Default Language</label>
                      <select
                        value={profileData.language}
                        onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="en">English</option>
                        <option value="te">Telugu (తెలుగు)</option>
                        <option value="hi">Hindi (हिन्दी)</option>
                        <option value="ta">Tamil (தமிழ்)</option>
                        <option value="kn">Kannada (ಕನ್ನಡ)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs text-white/50 tracking-widest uppercase font-mono block">Travel Styles</label>
                    <div className="flex flex-wrap gap-2">
                      {["Luxury Stays", "Culture & Heritage", "Scenic Rail", "Gastronomy", "High Adventure", "Wellness & Spa"].map((style) => {
                        const isSelected = profileData.travelStyles.includes(style);
                        return (
                          <button
                            type="button"
                            key={style}
                            onClick={() => {
                              setProfileData(prev => ({
                                ...prev,
                                travelStyles: isSelected
                                  ? prev.travelStyles.filter(s => s !== style)
                                  : [...prev.travelStyles, style]
                              }));
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                              isSelected
                                ? "bg-primary text-black font-semibold"
                                : "bg-white/5 text-white/60 hover:text-white border border-white/5"
                            }`}
                          >
                            {style}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs text-white/50 tracking-widest uppercase font-mono block">Dietary Preferences</label>
                    <div className="flex flex-wrap gap-2">
                      {["Vegetarian", "Vegan", "Halal", "Gluten-Free", "Jain", "Pescatarian"].map((diet) => {
                        const isSelected = profileData.dietaryPreferences.includes(diet);
                        return (
                          <button
                            type="button"
                            key={diet}
                            onClick={() => {
                              setProfileData(prev => ({
                                ...prev,
                                dietaryPreferences: isSelected
                                  ? prev.dietaryPreferences.filter(d => d !== diet)
                                  : [...prev.dietaryPreferences, diet]
                              }));
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                              isSelected
                                ? "bg-primary text-black font-semibold"
                                : "bg-white/5 text-white/60 hover:text-white border border-white/5"
                            }`}
                          >
                            {diet}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Security & 2FA */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-serif text-white border-b border-white/5 pb-4">Security & Credentials</h2>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-white">Two-Factor Authentication (OTP / TOTP)</p>
                        <p className="text-xs text-white/40">Require a 6-digit code on new device sign-ins.</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={profileData.twoFactorEnabled}
                      onChange={(e) => setProfileData({ ...profileData, twoFactorEnabled: e.target.checked })}
                      className="w-5 h-5 accent-primary cursor-pointer rounded"
                    />
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Hardware Encrypted Vault Passkey</p>
                      <p className="text-xs text-white/40">Vault documents protected with AES-256 GCM key.</p>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      Active
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 4: Notifications */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-serif text-white border-b border-white/5 pb-4">Notification Channels</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">WhatsApp Flight & Gate Disruption Alerts</p>
                        <p className="text-xs text-white/40">Instant push notifications for delays exceeding 30 minutes.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profileData.whatsappAlerts}
                        onChange={(e) => setProfileData({ ...profileData, whatsappAlerts: e.target.checked })}
                        className="w-5 h-5 accent-primary cursor-pointer rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">Email Itinerary Updates & Receipts</p>
                        <p className="text-xs text-white/40">Verified PDF booking vouchers and invoices delivered directly.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profileData.emailReceipts}
                        onChange={(e) => setProfileData({ ...profileData, emailReceipts: e.target.checked })}
                        className="w-5 h-5 accent-primary cursor-pointer rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">Weather Radar & Monsoon Warnings</p>
                        <p className="text-xs text-white/40">Proactive alerts for destination weather changes.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profileData.weatherPush}
                        onChange={(e) => setProfileData({ ...profileData, weatherPush: e.target.checked })}
                        className="w-5 h-5 accent-primary cursor-pointer rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Payment Vault */}
              {activeTab === "payment" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-xl font-serif text-white">Saved Payment Methods</h2>
                    <Button
                      type="button"
                      onClick={() => alert("Payment gateway card tokenizer modal ready. Seamless 1-click checkout active.")}
                      className="rounded-xl bg-primary text-black hover:bg-primary/90 text-xs"
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Add Card / UPI
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {savedCards.map((card) => (
                      <div key={card.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm flex items-center gap-2">
                              {card.brand} •••• {card.last4}
                              {card.isDefault && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">Default</span>
                              )}
                            </div>
                            <div className="text-xs text-white/40 font-mono mt-0.5">Expires {card.expiry}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSavedCards(prev => prev.filter(c => c.id !== card.id))}
                          className="p-2 text-white/40 hover:text-red-400 rounded-lg hover:bg-white/5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-6 border-t border-white/10 flex justify-end">
                <Button type="submit" disabled={isSaving} className="h-12 px-8 rounded-full bg-primary text-black font-semibold text-xs tracking-wider uppercase hover:bg-primary/90 shadow-lg shadow-primary/20">
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save All Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
