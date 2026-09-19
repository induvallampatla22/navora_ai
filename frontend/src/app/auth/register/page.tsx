"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [otpHint, setOtpHint] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: any = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password
      };
      if (formData.phone && formData.phone.trim()) {
        payload.phone = formData.phone.trim();
      }

      const res = await api.register(payload);
      if (res?.demo_otp_hint) {
        setOtpHint(res.demo_otp_hint);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full bg-[#111111] p-10 rounded-3xl border border-white/10 text-center space-y-6">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto border border-primary/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-serif text-white mb-2">Welcome to NAVORA</h2>
            <p className="text-sm text-white/60">Your account has been created successfully.</p>
          </div>
          {otpHint && (
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 text-xs text-primary/90">
              <span className="font-semibold uppercase tracking-wider block mb-1">Sandbox Demo Verification Code</span>
              <span className="font-mono text-xl tracking-[0.25em] font-bold text-primary">{otpHint}</span>
            </div>
          )}
          <div className="pt-2">
            <Link
              href="/auth/login"
              className="inline-block w-full py-4 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              Continue to Sign In
            </Link>
          </div>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Image Section */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-end p-12">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
           <img 
             src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" 
             alt="Luxury Hotel" 
             className="w-full h-full object-cover"
             onError={(e) => {
               e.currentTarget.src = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200";
             }}
           />
        </div>
        <div className="relative z-20 max-w-md">
           <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mb-6">
              <div className="w-4 h-4 bg-background rounded-sm transform rotate-45"></div>
           </div>
           <h1 className="text-5xl font-serif text-white mb-4 leading-tight">NAVORA</h1>
           <h2 className="text-3xl font-serif text-primary mb-2">One account.</h2>
           <h2 className="text-3xl font-serif text-white/90">A world of journeys.</h2>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-secondary/20 p-8 rounded-3xl border-white/10">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-xl font-serif text-foreground">Navora Account</h2>
             <span className="text-xs text-foreground/50">Sign Up</span>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-foreground/70 pl-1">Full Name</label>
                <Input
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="bg-[#111111] border-white/10 h-14"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-foreground/70 pl-1">Email address</label>
                <Input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-[#111111] border-white/10 h-14"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-foreground/70 pl-1">Phone Number (Optional)</label>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-[#111111] border-white/10 h-14"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-foreground/70 pl-1">Password</label>
                <Input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-[#111111] border-white/10 h-14"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-base rounded-full"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            
            <div className="flex items-center justify-center pt-2">
               <span className="text-xs text-foreground/40 font-mono tracking-widest">OR</span>
            </div>
            
            <div className="flex gap-4">
               <Button type="button" variant="outline" className="flex-1 h-12 rounded-full border-white/10 bg-black/40 hover:bg-white/5">
                 <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
               </Button>
               <Button type="button" variant="outline" className="flex-1 h-12 rounded-full border-white/10 bg-black/40 hover:bg-white/5">
                 <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="Github" className="w-5 h-5 invert opacity-70" />
               </Button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-foreground/50">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
