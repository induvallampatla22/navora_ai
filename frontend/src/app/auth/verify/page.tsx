"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const idParam = searchParams.get("identifier") || searchParams.get("email") || searchParams.get("phone");
    if (idParam) setIdentifier(idParam);
    const codeParam = searchParams.get("code") || searchParams.get("hint");
    if (codeParam) setCode(codeParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) return;

    setError("");
    setLoading(true);

    try {
      // 1. Verify OTP with backend
      await api.verifyOtp(identifier || "current_user", code.trim(), "registration");
      
      // 2. Redirect to login with prefill or dashboard
      router.push(`/auth/login?verified=true&identifier=${encodeURIComponent(identifier)}`);
    } catch (err: any) {
      setError(err.message || "Failed to verify code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!identifier) {
      setError("Please enter your email or phone number to resend.");
      return;
    }
    setResending(true);
    setError("");
    setResendMessage("");
    try {
      const res = await api.resendOtp(identifier.trim(), "registration");
      setResendMessage(`New code sent! ${res?.demo_otp_hint ? `(Demo Code: ${res.demo_otp_hint})` : ""}`);
    } catch (err: any) {
      setError(err.message || "Could not resend verification code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070707] p-6 relative text-white">
      <div className="absolute inset-0 z-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" 
          alt="Background" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200";
          }}
        />
        <div className="absolute inset-0 bg-[#070707]/90 backdrop-blur-xl" />
      </div>

      <Card className="max-w-md w-full relative z-10 bg-[#111111]/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl">
        <div className="mb-6">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/30 text-primary">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-serif text-white mb-2 text-center">
            Verification
          </h1>
          <p className="text-xs text-white/60 text-center max-w-xs">
            Enter the 6-digit verification code sent to your email or phone number.
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs text-center leading-relaxed">
              {error}
            </div>
          )}

          {resendMessage && (
            <div className="bg-primary/10 border border-primary/30 text-primary p-3.5 rounded-xl text-xs text-center leading-relaxed font-mono">
              {resendMessage}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/70 font-medium pl-1">Email or Phone</label>
              <Input
                type="text"
                required
                placeholder="name@domain.com or +1..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="bg-black/50 border-white/10 h-11 rounded-xl text-white text-sm focus:border-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/70 font-medium pl-1">Verification Code</label>
              <Input
                id="code"
                name="code"
                type="text"
                required
                maxLength={6}
                className="text-center tracking-[0.5em] text-2xl font-mono h-14 bg-black/50 border-white/10 placeholder-white/20 text-white focus:border-primary/50 rounded-xl"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || code.length < 4}
            className="w-full h-12 text-sm font-semibold rounded-full bg-[#d4b88a] text-black hover:bg-[#c4a87a] shadow-[0_0_20px_rgba(212,184,138,0.2)]"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              disabled={resending}
              onClick={handleResend}
              className="text-xs text-[#d4b88a] hover:underline font-medium"
            >
              {resending ? "Sending new code..." : "Resend Verification Code"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070707] flex items-center justify-center text-white/40 font-serif">Loading Verification...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
