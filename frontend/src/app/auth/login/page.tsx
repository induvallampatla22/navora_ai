"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight, Lock, Mail } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.login({ identifier: identifier.trim(), password });
      
      if (response.requires_2fa) {
        router.push("/auth/verify?identifier=" + encodeURIComponent(identifier.trim()));
        return;
      }
      
      login(response);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your email/phone and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#070707] text-white">
      {/* Left Image Section */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-end p-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#070707] z-10" />
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" 
            alt="NAVORA Luxury Travel" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200";
            }}
          />
        </div>
        <div className="relative z-20 max-w-lg">
          <div className="w-10 h-10 rounded-full bg-[#d4b88a] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(212,184,138,0.3)]">
            <div className="w-4 h-4 bg-[#070707] rounded-sm transform rotate-45"></div>
          </div>
          <h1 className="text-5xl font-serif text-white mb-4 leading-tight">NAVORA</h1>
          <h2 className="text-3xl font-serif text-[#d4b88a] mb-2 font-light">One account.</h2>
          <h2 className="text-3xl font-serif text-white/90">A world of journeys.</h2>
          <p className="text-xs text-white/60 font-mono tracking-widest uppercase mt-4">
            Plan • Compare • Book • Live Trip Intelligence
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md bg-[#111111]/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xl font-serif tracking-[0.2em] font-semibold text-white">NAVORA</span>
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#d4b88a]">Sign In</span>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs text-center leading-relaxed">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/70 font-medium pl-1">Email address or Phone</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. traveler@navora.ai"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="bg-black/50 border-white/10 h-12 rounded-xl text-white placeholder-white/30 text-sm focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-xs text-white/70 font-medium">Password</label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-[#d4b88a] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/50 border-white/10 h-12 rounded-xl text-white placeholder-white/30 text-sm focus:border-primary/50"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !identifier || !password}
              className="w-full h-12 text-sm font-semibold rounded-full bg-[#d4b88a] text-black hover:bg-[#c4a87a] shadow-[0_0_20px_rgba(212,184,138,0.2)] transition-all"
            >
              {loading ? "Authenticating..." : "Access Account"}
            </Button>
            
            <div className="relative flex items-center justify-center my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative bg-[#111111] px-3">
                <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Or Continue With</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setError("Google Login: Redirecting to OAuth... (Please use Demo credentials or standard email/password while OAuth keys are initializing)");
                }}
                className="h-11 rounded-xl border-white/10 bg-black/50 hover:bg-white/10 text-xs text-white/90 flex items-center justify-center gap-2 transition-colors"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setError("GitHub Login: Redirecting to OAuth... (Please use Demo credentials or standard email/password while OAuth keys are initializing)");
                }}
                className="h-11 rounded-xl border-white/10 bg-black/50 hover:bg-white/10 text-xs text-white/90 flex items-center justify-center gap-2 transition-colors"
              >
                <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="w-4 h-4 invert opacity-80" />
                GitHub
              </Button>
            </div>

            <div className="flex items-center justify-center pt-3">
              <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Quick Demo Access</span>
            </div>

            {/* Quick Demo Access Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIdentifier("traveler@navora.ai");
                setPassword("NavoraDemo2026!");
              }}
              className="w-full h-10 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white/80"
            >
              Fill Demo Credentials (traveler@navora.ai)
            </Button>
          </form>
          
          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-xs text-white/50">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-[#d4b88a] font-medium hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070707] flex items-center justify-center text-white/40 font-serif">Loading NAVORA Secure Access...</div>}>
      <LoginForm />
    </Suspense>
  );
}
