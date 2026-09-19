"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Map,
  Search,
  GitCompare,
  Calendar,
  BarChart3,
  Activity,
  Sparkles,
  Network,
  CreditCard,
  Wallet,
  Users,
  DollarSign,
  Backpack,
  FileText,
  ShieldCheck,
  Coins,
  Star,
  MessageSquare,
  Bell,
  Camera,
  Settings,
  UserCircle,
  LogOut,
  RefreshCw,
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import FloatingAIAssistant from "@/components/FloatingAIAssistant";

interface NavLink {
  href: string;
  icon: any;
  text: string;
  badge?: string;
}

const NAV_SECTIONS: { label: string; links: NavLink[] }[] = [
  {
    label: "Explore & Plan",
    links: [
      { href: "/dashboard", icon: Sparkles, text: "Dashboard", badge: "Live" },
      { href: "/dashboard/explore", icon: Compass, text: "Explore" },
      { href: "/dashboard/plan", icon: Sparkles, text: "Plan Trip" },
      { href: "/dashboard/compare", icon: GitCompare, text: "Compare" },
      { href: "/dashboard/trips", icon: Calendar, text: "My Trips" },
      { href: "/dashboard/bookings", icon: CreditCard, text: "Bookings" },
      { href: "/dashboard/groups", icon: Users, text: "Group Trips" },
      { href: "/dashboard/maps", icon: Map, text: "Map" },
    ],
  },
  {
    label: "AI & Intelligence",
    links: [
      { href: "/dashboard/assistant", icon: MessageSquare, text: "AI Assistant" },
      { href: "/dashboard/intelligence", icon: BarChart3, text: "Travel Intelligence" },
      { href: "/dashboard/monitor", icon: Activity, text: "Trip Monitor" },
      { href: "/dashboard/replan", icon: RefreshCw, text: "AI Replan", badge: "Live" },
    ],
  },
  {
    label: "Utilities & Logistics",
    links: [
      { href: "/dashboard/expenses", icon: DollarSign, text: "Expenses" },
      { href: "/dashboard/coins", icon: Coins, text: "Coins", badge: "Rewards" },
      { href: "/dashboard/packing", icon: Backpack, text: "Smart Packing" },
      { href: "/dashboard/documents", icon: FileText, text: "Documents" },
      { href: "/dashboard/safety", icon: ShieldCheck, text: "Safety" },
    ],
  },
  {
    label: "Community & Account",
    links: [
      { href: "/dashboard/community", icon: Star, text: "Community" },
      { href: "/dashboard/notifications", icon: Bell, text: "Notifications" },
      { href: "/dashboard/profile", icon: UserCircle, text: "Profile" },
      { href: "/dashboard/settings", icon: Settings, text: "Settings" },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Authentication guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=" + encodeURIComponent(pathname || "/dashboard"));
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-mono">Authenticating NAVORA Voyage Suite...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const userDisplayName = user?.full_name || "Traveler";
  const userInitials = userDisplayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen bg-[#070707] text-[#f2f2f2] overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r border-white/5 bg-[#0b0b0b] flex flex-col hidden md:flex shrink-0">
        <div className="h-20 px-6 flex items-center justify-between border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="text-xl font-serif font-bold tracking-[0.25em] text-white group-hover:text-primary transition-colors">
              NAVORA
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono">
              OS
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 px-3 mb-2">
                {section.label}
              </div>
              {section.links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/25 shadow-sm shadow-primary/10"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-white/40"}`} />
                      <span>{link.text}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Card Bottom */}
        <div className="p-3 border-t border-white/5 bg-black/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <Link href="/dashboard/settings" className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xs font-semibold shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{userDisplayName}</p>
                <p className="text-[10px] text-primary truncate font-mono">1,250 Coins</p>
              </div>
            </Link>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-white/40 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-md flex">
          <div className="w-4/5 max-w-xs bg-[#0b0b0b] h-full p-6 flex flex-col border-r border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xl font-serif font-bold tracking-widest text-white">NAVORA</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white/60">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
              {NAV_SECTIONS.flatMap((s) => s.links).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    pathname === link.href ? "bg-primary/20 text-primary" : "text-white/70"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.text}</span>
                </Link>
              ))}
            </nav>
            <button
              onClick={() => logout()}
              className="mt-4 flex items-center gap-2 text-sm text-red-400 py-2 border-t border-white/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070707]">
        {/* Topbar */}
        <header className="h-20 border-b border-white/5 bg-[#0b0b0b]/80 backdrop-blur-md px-6 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-white/70 hover:text-white p-1"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <span className="text-xs text-white/40 tracking-[0.2em] uppercase font-mono block">NAVORA Intelligence OS</span>
              <span className="text-sm font-medium text-white/90">Autonomous Travel Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/coins"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs text-primary hover:bg-primary/20 transition-all font-mono"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>1,250 Coins</span>
            </Link>

            <Link
              href="/dashboard/replan"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 hover:text-primary hover:border-primary/30 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-primary" />
              <span>Auto-Replan: Active</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-3 py-1 rounded-full hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xs font-semibold">
                  {userInitials}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-white/50" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="font-medium text-white">{userDisplayName}</p>
                    <p className="text-[11px] text-white/40 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Account Settings</span>
                  </Link>
                  <Link
                    href="/dashboard/trips"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>My Trips</span>
                  </Link>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Multilingual AI Concierge widget (accessible everywhere in dashboard) */}
      <FloatingAIAssistant />
    </div>
  );
}
