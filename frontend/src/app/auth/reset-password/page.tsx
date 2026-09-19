"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const idParam = searchParams.get("identifier");
    if (idParam) setIdentifier(idParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !code || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.resetPassword({
        identifier: identifier.trim(),
        code: code.trim(),
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please check your verification code.");
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
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-serif text-white font-normal mb-2">Set New Password</h1>
          <p className="text-xs text-white/60 max-w-xs mx-auto">
            Enter the 6-digit code sent to your email or phone and your new secure password.
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white mb-1">Password Updated</h2>
              <p className="text-xs text-white/60">Your password has been changed successfully. You can now access your account.</p>
            </div>
            <Link
              href="/auth/login"
              className="inline-block w-full py-3.5 bg-[#d4b88a] text-black font-semibold rounded-full hover:bg-[#c4a87a] transition-colors text-sm"
            >
              Sign In with New Password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-white/70 font-medium pl-1">Email / Phone</label>
              <Input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="bg-black/50 border-white/10 h-11 rounded-xl text-white text-sm focus:border-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/70 font-medium pl-1">6-Digit Verification Code</label>
              <Input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="bg-black/50 border-white/10 h-11 rounded-xl text-center font-mono tracking-widest text-lg text-white focus:border-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/70 font-medium pl-1">New Password</label>
              <Input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-black/50 border-white/10 h-11 rounded-xl text-white text-sm focus:border-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/70 font-medium pl-1">Confirm New Password</label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-black/50 border-white/10 h-11 rounded-xl text-white text-sm focus:border-primary/50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !identifier || !code || !newPassword}
              className="w-full h-12 rounded-full bg-[#d4b88a] text-black font-semibold hover:bg-[#c4a87a] transition-colors mt-2"
            >
              {loading ? "Updating Password..." : "Reset & Save Password"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070707] flex items-center justify-center text-white/40 font-serif">Loading Password Reset...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
