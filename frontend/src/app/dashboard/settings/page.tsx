"use client";

import { useState } from "react";
import {
  User,
  Shield,
  Bell,
  Globe,
  Wallet,
  Plane,
  Save,
  CheckCircle2,
  Lock,
  Smartphone,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "travel" | "security" | "notifications">("profile");
  const [isSaved, setIsSaved] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.full_name || "Elenora Vance",
    email: user?.email || "elenora@navora.ai",
    phone: "+91 98765 43210",
    homeCity: "Hyderabad (HYD)",
    currency: "INR (₹)",
    language: "English (US)",
    travelStyle: "Luxury & Heritage",
    autoReplan: true,
    whatsappAlerts: true,
    emailReceipts: true,
    disruptionPush: true,
    twoFactorAuth: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide">Account & Travel Preferences</h1>
          <p className="text-sm text-white/60 mt-1">Configure your personal autonomous travel settings, security, and notification vectors.</p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Preferences saved successfully.</span>
          </div>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {[
          { id: "profile", label: "Profile & Identity", icon: User },
          { id: "travel", label: "Travel & Auto-Pilot", icon: Plane },
          { id: "security", label: "Security & 2FA", icon: Shield },
          { id: "notifications", label: "Alert Vectors", icon: Bell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {activeTab === "profile" && (
          <div className="p-6 md:p-8 rounded-3xl bg-[#0c0c0c] border border-white/10 space-y-6">
            <h2 className="text-xl font-serif text-white">Identity Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white/40 text-sm cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Mobile / WhatsApp Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Primary AI Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#111111] border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option>English (US)</option>
                  <option>Telugu (తెలుగు)</option>
                  <option>Hindi (हिन्दी)</option>
                  <option>Tamil (தமிழ்)</option>
                  <option>Kannada (ಕನ್ನಡ)</option>
                  <option>Malayalam (മലയാളം)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "travel" && (
          <div className="p-6 md:p-8 rounded-3xl bg-[#0c0c0c] border border-white/10 space-y-6">
            <h2 className="text-xl font-serif text-white">Travel & Orchestration Preferences</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Home Departure Hub</label>
                <select
                  value={formData.homeCity}
                  onChange={(e) => setFormData({ ...formData, homeCity: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#111111] border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option>Hyderabad (HYD)</option>
                  <option>Bengaluru (BLR)</option>
                  <option>Mumbai (BOM)</option>
                  <option>Delhi (DEL)</option>
                  <option>Chennai (MAA)</option>
                  <option>Dubai (DXB)</option>
                  <option>London Heathrow (LHR)</option>
                  <option>New York (JFK)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Preferred Settlement Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#111111] border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>AED (د.إ)</option>
                  <option>JPY (¥)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Travel Style Persona</label>
                <select
                  value={formData.travelStyle}
                  onChange={(e) => setFormData({ ...formData, travelStyle: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#111111] border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option>Luxury & Heritage</option>
                  <option>Curated Boutique & Experiential</option>
                  <option>Fast-Paced Explorer</option>
                  <option>Slow Travel & Gastronomy</option>
                  <option>High Adventure & Trekking</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Autonomous Replanning Consent</p>
                  <p className="text-xs text-white/50">Allow NAVORA AI agents to rebook connecting transit if delay exceeds 120 minutes.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoReplan}
                  onChange={(e) => setFormData({ ...formData, autoReplan: e.target.checked })}
                  className="w-5 h-5 accent-primary cursor-pointer rounded"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="p-6 md:p-8 rounded-3xl bg-[#0c0c0c] border border-white/10 space-y-6">
            <h2 className="text-xl font-serif text-white">Security & Encryption</h2>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-white">Two-Factor Authentication (OTP / TOTP)</p>
                  <p className="text-xs text-white/50">Require a 6-digit cryptographic verification code on login.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.twoFactorAuth}
                onChange={(e) => setFormData({ ...formData, twoFactorAuth: e.target.checked })}
                className="w-5 h-5 accent-primary cursor-pointer rounded"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Active Cryptographic Sessions</p>
                <p className="text-xs text-white/50">Current device: Chrome on Windows • JWT valid for 7 days</p>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition-colors"
              >
                Revoke All Others
              </button>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="p-6 md:p-8 rounded-3xl bg-[#0c0c0c] border border-white/10 space-y-4">
            <h2 className="text-xl font-serif text-white">Notification Vectors</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">WhatsApp Flight & Gate Disruption Alerts</p>
                  <p className="text-xs text-white/50">Instant message 3 hours before departure with gate updates.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.whatsappAlerts}
                  onChange={(e) => setFormData({ ...formData, whatsappAlerts: e.target.checked })}
                  className="w-5 h-5 accent-primary cursor-pointer rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Email Itinerary & Tax Invoices</p>
                  <p className="text-xs text-white/50">High-resolution PDF vouchers and GST compliant receipts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailReceipts}
                  onChange={(e) => setFormData({ ...formData, emailReceipts: e.target.checked })}
                  className="w-5 h-5 accent-primary cursor-pointer rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Weather & Extreme Condition Warning</p>
                  <p className="text-xs text-white/50">Radar surveillance notifications for destination monsoons or snow storms.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.disruptionPush}
                  onChange={(e) => setFormData({ ...formData, disruptionPush: e.target.checked })}
                  className="w-5 h-5 accent-primary cursor-pointer rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-semibold text-xs tracking-wider uppercase hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
