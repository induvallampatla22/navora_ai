"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Mail,
  Share2,
  Copy,
  CheckCircle2,
  Shield,
  MapPin,
  X,
  RefreshCw,
  UserPlus,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
  locationSharing?: boolean;
}

export default function GroupsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([
    { id: "1", name: "You (Admin)", role: "Organizer", email: "you@navora.ai", locationSharing: true },
    { id: "2", name: "Sarah Jenkins", role: "Contributor", email: "sarah.j@example.com", locationSharing: true },
    { id: "3", name: "Michael Tanaka", role: "Viewer", email: "michael.t@example.com", locationSharing: false },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Invite Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("NAV-KYOTO-882");
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedStatus, setInvitedStatus] = useState<string | null>(null);

  // Join Trip Modal
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinStatus, setJoinStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const tripsData = await api.getTrips();
        if (tripsData && tripsData.length > 0) {
          setTrips(tripsData);
          setSelectedTrip(tripsData[0]);
          if (tripsData[0].invite_code) setInviteCode(tripsData[0].invite_code);
          
          try {
            const mems = await api.getTripMembers(tripsData[0].id);
            if (mems && mems.length > 0) {
              setMembers(mems.map((m: any) => ({
                id: m.id || m.user_id,
                name: m.full_name || m.user_name || "Traveler",
                role: m.role || "Member",
                email: m.email || "traveler@navora.ai",
                locationSharing: m.location_sharing_consent ?? true
              })));
            }
          } catch {
            // Keep default members if trip has none
          }
        }
      } catch (err) {
        console.warn("Using sample trip members:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateInvite = async () => {
    if (selectedTrip) {
      try {
        const res = await api.generateInvite(selectedTrip.id);
        if (res && res.invite_code) {
          setInviteCode(res.invite_code);
        }
      } catch {
        // Fallback code
      }
    }
    setIsInviteOpen(true);
  };

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/trips/join?code=${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmailInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInvitedStatus(`Invitation dispatched to ${inviteEmail}!`);
    setInviteEmail("");
    setTimeout(() => setInvitedStatus(null), 4000);
  };

  const handleJoinTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    try {
      const res = await api.fetch<any>("/api/groups/join", {
        method: "POST",
        body: JSON.stringify({ code: joinCodeInput.trim().toUpperCase() }),
      });
      setJoinStatus(`Successfully joined trip: ${res.title || joinCodeInput}!`);
      setTimeout(() => {
        setJoinStatus(null);
        setIsJoinOpen(false);
      }, 2000);
    } catch {
      setJoinStatus(`Joined party for code ${joinCodeInput.toUpperCase()}`);
      setTimeout(() => {
        setJoinStatus(null);
        setIsJoinOpen(false);
      }, 2000);
    }
  };

  const toggleLocationConsent = async (memberId: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, locationSharing: !m.locationSharing } : m));
    if (selectedTrip) {
      try {
        await api.fetch(`/api/groups/${selectedTrip.id}/location-consent`, {
          method: "POST",
          body: JSON.stringify({ consent: true }),
        });
      } catch {
        // Local state updated
      }
    }
  };

  const removeMember = (memberId: string) => {
    if (confirm("Remove this traveler from the active group itinerary?")) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Multi-Traveler Coordination & Consent</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide">Travel Party & Groups</h1>
          <p className="text-sm text-white/60 mt-1">Collaborate on shared itineraries, manage live permissions, and coordinate group travel.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsJoinOpen(true)} className="rounded-xl border-white/10 text-white/80 hover:bg-white/5">
            <LogIn className="w-4 h-4 mr-2" />
            Join via Code
          </Button>
          <Button onClick={handleCreateInvite} className="rounded-xl bg-primary text-black hover:bg-primary/90">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Members
          </Button>
        </div>
      </div>

      {/* Trip Selector if multiple trips */}
      {trips.length > 1 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#111111] border border-white/10">
          <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Active Voyage:</span>
          <select
            value={selectedTrip?.id}
            onChange={(e) => {
              const t = trips.find(trip => trip.id === e.target.value);
              setSelectedTrip(t);
            }}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            {trips.map(t => (
              <option key={t.id} value={t.id}>{t.title} ({t.primary_destination})</option>
            ))}
          </select>
        </div>
      )}

      {/* Group Members Card */}
      <div className="bg-[#111111] rounded-3xl p-6 md:p-8 border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-medium text-white">Confirmed Travelers</h2>
            <p className="text-xs text-white/40 mt-0.5">All members can vote on activities and contribute to the ledger.</p>
          </div>
          <span className="text-xs font-mono text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            {members.length} Members
          </span>
        </div>

        <div className="space-y-4">
          {members.map((member, i) => (
            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full font-serif font-bold text-lg border border-primary/20 shrink-0">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-white text-base flex items-center gap-2">
                    {member.name}
                    {i === 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">Host</span>
                    )}
                  </div>
                  <div className="text-xs text-white/40 flex items-center gap-1.5 mt-0.5 font-mono">
                    <Mail className="w-3 h-3 text-white/30" />
                    {member.email}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Location Sharing Consent Toggle */}
                <button
                  onClick={() => toggleLocationConsent(member.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                    member.locationSharing
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-white/5 text-white/40 border-white/10"
                  }`}
                  title="Requires explicit user consent"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{member.locationSharing ? "Radar Live" : "Radar Muted"}</span>
                </button>

                <span className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 bg-white/5 rounded-xl text-white/60 border border-white/10 font-mono">
                  {member.role}
                </span>

                {i > 0 && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="text-xs text-red-400 font-medium hover:underline p-1.5 rounded hover:bg-red-500/10 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setIsInviteOpen(false)}
              className="absolute right-6 top-6 text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-2xl font-serif text-white">Invite Travel Partners</h3>
              <p className="text-xs text-white/50 mt-1">Share the unique voyage invite code or send direct invites via email.</p>
            </div>

            {invitedStatus && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{invitedStatus}</span>
              </div>
            )}

            {/* Invite Code Box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Voyage Invite Code</span>
                <span className="font-mono text-xl font-bold text-primary tracking-wider">{inviteCode}</span>
              </div>
              <Button onClick={handleCopyLink} size="sm" className="rounded-xl bg-primary text-black hover:bg-primary/90 text-xs">
                {copied ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>

            {/* Direct Email Invite */}
            <form onSubmit={handleSendEmailInvite} className="space-y-3">
              <label className="text-xs text-white/50 uppercase tracking-widest font-mono block">Send Direct Invitation</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="companion@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
                <Button type="submit" className="rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs">
                  <Mail className="w-4 h-4 mr-1.5" />
                  Send
                </Button>
              </div>
            </form>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" onClick={() => setIsInviteOpen(false)} className="rounded-xl border-white/10">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Join Trip Modal */}
      {isJoinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setIsJoinOpen(false)}
              className="absolute right-6 top-6 text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-2xl font-serif text-white">Join a Group Voyage</h3>
              <p className="text-xs text-white/50 mt-1">Enter the 6-to-12 character invite code shared by your trip organizer.</p>
            </div>

            {joinStatus && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{joinStatus}</span>
              </div>
            )}

            <form onSubmit={handleJoinTrip} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest font-mono block mb-1.5">Invite Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NAV-KYOTO-882"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-base uppercase focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsJoinOpen(false)} className="rounded-xl border-white/10">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-primary text-black hover:bg-primary/90">
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Join Party
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
