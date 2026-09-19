"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  AlertCircle,
  Info,
  Gift,
  Plane,
  Clock,
  RefreshCw,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface NotificationItem {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.fetch<NotificationItem[]>("/api/notifications");
      if (Array.isArray(res)) {
        setNotifications(res);
      }
    } catch (err) {
      console.warn("Using sample notifications:", err);
      setNotifications([
        { id: "1", type: "alert", severity: "ATTENTION", title: "Rain Radar Alert for Kyoto", message: "Moderate rain expected tomorrow afternoon. Indoor museum alternatives staged.", action_url: "/dashboard/monitor", is_read: false },
        { id: "2", type: "booking", severity: "INFO", title: "Flight Confirmation Ticket Stored", message: "JAL JL005 ticket is encrypted and available in your Document Vault.", action_url: "/dashboard/documents", is_read: false },
        { id: "3", type: "coin", severity: "INFO", title: "+100 NAVORA Coins Credited", message: "Welcome rewards deposited into your Sovereign Wallet.", action_url: "/dashboard/coins", is_read: true },
        { id: "4", type: "price", severity: "INFO", title: "Price Drop on Watchlisted Route", message: "Flights from Hyderabad to Tokyo have dropped by 14%.", action_url: "/dashboard/compare", is_read: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await api.fetch("/api/notifications/read-all", { method: "POST" });
    } catch {
      // Local state already updated
    }
  };

  const handleMarkRead = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      try {
        await api.fetch(`/api/notifications/${notif.id}/read`, { method: "POST" });
      } catch {
        // Local state updated
      }
    }
  };

  const getIcon = (type: string, severity: string) => {
    if (type === "alert" || severity === "URGENT" || severity === "ATTENTION") {
      return <AlertCircle className="w-5 h-5 text-amber-400" />;
    }
    if (type === "booking" || type === "flight") {
      return <Plane className="w-5 h-5 text-blue-400" />;
    }
    if (type === "coin" || type === "reward") {
      return <Gift className="w-5 h-5 text-primary" />;
    }
    return <Info className="w-5 h-5 text-white/50" />;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.is_read;
    if (activeTab === "alerts") return n.type === "alert" || n.severity === "ATTENTION";
    if (activeTab === "bookings") return n.type === "booking" || n.type === "flight";
    return true;
  });

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            <span>Notification Center</span>
          </h1>
          <p className="text-sm text-white/60 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}.` : "All notifications read and up to date."}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead} className="rounded-xl border-white/10 text-primary hover:bg-white/5 text-xs">
            <Check className="w-4 h-4 mr-1.5" /> Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: "all", label: "All" },
          { id: "unread", label: `Unread (${unreadCount})` },
          { id: "alerts", label: "Disruptions & Weather" },
          { id: "bookings", label: "Bookings & Vault" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? "bg-primary text-black font-semibold"
                : "bg-white/5 text-white/60 hover:text-white border border-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="bg-[#111111] rounded-3xl border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-white/40">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading notification feed...
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif)}
                className={`flex items-start gap-4 p-6 hover:bg-white/5 transition-colors cursor-pointer ${
                  !notif.is_read ? "bg-primary/[0.03] border-l-2 border-l-primary" : ""
                }`}
              >
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 shrink-0 mt-0.5">
                  {getIcon(notif.type, notif.severity)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm">{notif.title}</span>
                    {!notif.is_read && <div className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                  </div>
                  <div className="text-xs text-white/60 mt-1 leading-relaxed">{notif.message}</div>

                  {notif.action_url && (
                    <Link
                      href={notif.action_url}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline mt-2.5"
                    >
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                <div className="text-[10px] font-mono text-white/30 whitespace-nowrap shrink-0">
                  {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : "Today"}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="p-16 text-center text-white/40">
                No notifications in this category.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
