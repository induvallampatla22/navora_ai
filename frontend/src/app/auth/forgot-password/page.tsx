"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mail, KeyRound, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [demoHint, setDemoHint] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await api.forgotPassword(identifier.trim());
      if (res?.demo_otp_hint) {
        setDemoHint(res.demo_otp_hint);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070707] p-6 relative">
      <div className="absolute inset-0 z-0 opacity-20">
        <img
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2000&auto=format&fit=crop"
          alt="NAVORA Security"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/90 to-transparent" />
      </div>

      <Card className="max-w-md w-full relative z-10 bg-[#111111]/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl">
        <div className="mb-6">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center mx-auto mb-4 text-primary">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-serif text-white font-normal mb-2">Reset Password</h1>
          <p className="text-xs text-white/60 max-w-xs mx-auto">
            Enter your registered email address or phone number to receive a verification code.
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/25 text-xs text-primary/90">
              <span className="font-semibold block mb-1">Reset Code Dispatched</span>
              <p className="text-white/70">
                If an account matches <span className="text-white font-medium">{identifier}</span>, we have sent your reset code.
              </p>
              {demoHint && (
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <span className="text-[10px] uppercase font-mono tracking-wider block text-primary/80">Demo Mode Code:</span>
                  <span className="font-mono text-xl font-bold tracking-widest text-primary">{demoHint}</span>
                </div>
              )}
            </div>

            <Button
              onClick={() => router.push(`/auth/reset-password?identifier=${encodeURIComponent(identifier)}`)}
              className="w-full h-12 rounded-full bg-[#d4b88a] text-black font-semibold hover:bg-[#c4a87a]"
            >
              Enter Code & Reset Password
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-white/70 font-medium pl-1">Email address or Phone</label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  placeholder="name@domain.com or +1..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="bg-black/50 border-white/10 h-12 rounded-xl text-white placeholder-white/30 text-sm focus:border-primary/50"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !identifier.trim()}
              className="w-full h-12 rounded-full bg-[#d4b88a] text-black font-semibold hover:bg-[#c4a87a] transition-colors"
            >
              {loading ? "Sending Reset Code..." : "Send Verification Code"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
