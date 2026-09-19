"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, CheckCircle2, Plus, X, Download, ShieldCheck, RefreshCw, Trash2, Loader2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface Booking {
  id: string;
  reference_code: string;
  trip_id?: string;
  booking_type: string;
  provider_name: string;
  title: string;
  status: string;
  start_time?: string;
  end_time?: string;
  total_amount: number;
  currency: string;
  is_demo_data?: boolean;
}

function BookingsContent() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const [syncing, setSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [itemName, setItemName] = useState("");
  const [bkgType, setBkgType] = useState("Hotel");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState(250);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const titleParam = searchParams.get("title");
    const amountParam = searchParams.get("amount");
    const providerParam = searchParams.get("provider");
    const typeParam = searchParams.get("type");
    if (titleParam || amountParam || providerParam) {
      setItemName(titleParam || "");
      setAmount(amountParam ? Number(amountParam) : 250);
      setProvider(providerParam || "NAVORA Partner");
      if (typeParam) setBkgType(typeParam === "transit" ? "Transport" : "Activity");
      setShowModal(true);
    }
  }, [searchParams]);

  useEffect(() => { loadBookings(); }, []);

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await api.getBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch { setBookings([]); } finally { setLoading(false); }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  }

  const handleSync = async () => {
    setSyncing(true);
    try {
      const data = await api.getBookings();
      setBookings(Array.isArray(data) ? data : []);
      showToast("All reservations synchronized.");
    } catch { showToast("Sync failed."); } finally { setSyncing(false); }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;
    try {
      const newBkg = await api.createBooking({
        booking_type: bkgType,
        provider_name: provider || "NAVORA Partner",
        item_name: itemName,
        title: itemName,
        start_date: date,
        start_time: new Date(date).toISOString(),
        total_amount: Number(amount),
        currency: "USD",
      });
      if (newBkg?.id) setBookings((prev) => [newBkg, ...prev]);
      setShowModal(false);
      setItemName(""); setProvider("");
      showToast("Booking confirmed!");
    } catch (err: any) { alert(err.message || "Failed to create booking."); }
  };

  const handleCancelBooking = async (bkgId: string) => {
    if (!confirm("Cancel this booking?")) return;
    try { await api.cancelBooking(bkgId); } catch {}
    setBookings((prev) => prev.map((b) => b.id === bkgId ? { ...b, status: "Cancelled" } : b));
    showToast("Booking cancelled.");
  };

  const totalValue = bookings.reduce((sum, b) => b.status !== "Cancelled" ? sum + (Number(b.total_amount) || 0) : sum, 0);
  const confirmedCount = bookings.filter((b) => b.status === "Confirmed").length;

  return (
    <div className="space-y-8 pb-24 text-white max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif text-white font-normal">Bookings &amp; Reservations</h1>
          <p className="text-sm text-white/60 mt-1">Manage your hotel stays, flight tickets, and tour reservations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSync} disabled={syncing} className="rounded-full border-white/10 hover:bg-white/5 h-10 px-4 text-xs font-mono flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-primary" : ""}`} />Sync
          </Button>
          <Button onClick={() => setShowModal(true)} className="rounded-full bg-[#d4b88a] text-black font-semibold hover:bg-[#c4a87a] h-10 px-5 text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />Add Booking
          </Button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/25 text-primary text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />{toastMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111111] p-6 rounded-3xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20"><CheckCircle2 className="w-6 h-6" /></div>
          <div><div className="text-2xl font-serif text-white">{confirmedCount}</div><div className="text-xs text-white/50 font-mono">Confirmed Bookings</div></div>
        </div>
        <div className="bg-[#111111] p-6 rounded-3xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20"><CreditCard className="w-6 h-6" /></div>
          <div><div className="text-2xl font-serif text-[#d4b88a]"></div><div className="text-xs text-white/50 font-mono">Total Portfolio Value</div></div>
        </div>
        <div className="bg-[#111111] p-6 rounded-3xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20"><ShieldCheck className="w-6 h-6" /></div>
          <div><div className="text-2xl font-serif text-white">100%</div><div className="text-xs text-white/50 font-mono">Guaranteed Protection</div></div>
        </div>
      </div>

      <div className="bg-[#111111] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-white/40 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-[#d4b88a]" />Loading reservations...
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"><Inbox className="w-8 h-8 text-white/20" /></div>
            <div>
              <p className="text-white/60 font-serif text-lg">No bookings yet</p>
              <p className="text-white/30 text-xs mt-1">Create your first reservation using the button above.</p>
            </div>
            <Button onClick={() => setShowModal(true)} className="rounded-full bg-[#d4b88a] text-black font-semibold hover:bg-[#c4a87a] h-10 px-6 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Add Your First Booking
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-mono text-white/40 uppercase tracking-wider">
                  <th className="p-4 pl-6">Ref</th><th className="p-4">Item</th><th className="p-4">Date</th>
                  <th className="p-4">Provider</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6 font-mono text-primary font-semibold">{booking.reference_code || booking.id.slice(0,8).toUpperCase()}</td>
                    <td className="p-4">
                      <div className="font-serif text-sm text-white font-medium">{booking.title}</div>
                      <div className="text-[11px] text-white/40 mt-0.5 capitalize">{booking.booking_type}</div>
                    </td>
                    <td className="p-4 text-white/70 font-mono">{booking.start_time ? new Date(booking.start_time).toLocaleDateString() : "Flexible"}</td>
                    <td className="p-4 text-white/60">{booking.provider_name}</td>
                    <td className="p-4 font-serif text-sm text-[#d4b88a] font-semibold">{booking.currency} {Number(booking.total_amount||0).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${booking.status==="Confirmed"?"bg-emerald-500/10 text-emerald-400 border border-emerald-500/30":booking.status==="Cancelled"?"bg-red-500/10 text-red-400 border border-red-500/30":"bg-amber-500/10 text-amber-400 border border-amber-500/30"}`}>{booking.status}</span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button title="Download" onClick={()=>alert(`E-ticket: ${booking.title} (${booking.reference_code})`)} className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"><Download className="w-3.5 h-3.5"/></button>
                        {booking.status!=="Cancelled"&&(<button title="Cancel" onClick={()=>handleCancelBooking(booking.id)} className="p-1.5 rounded-lg bg-white/5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative text-white">
            <button onClick={()=>setShowModal(false)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
            <div><h2 className="text-2xl font-serif text-white">Add Booking Reservation</h2><p className="text-xs text-white/50 mt-1">Reserve a stay, flight, train, or activity pass.</p></div>
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/70 font-medium">Item / Service Name</label>
                <Input type="text" required placeholder="e.g. 5-Star Hotel Stay" value={itemName} onChange={(e)=>setItemName(e.target.value)} className="bg-black/50 border-white/10 text-white h-11 rounded-xl text-xs"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 font-medium">Booking Type</label>
                  <select value={bkgType} onChange={(e)=>setBkgType(e.target.value)} className="w-full h-11 bg-black/50 border border-white/10 text-white rounded-xl text-xs px-3 focus:outline-none">
                    <option value="Hotel">Hotel / Stay</option>
                    <option value="Transport">Transport (Flight / Rail)</option>
                    <option value="Activity">Activity / Tour</option>
                    <option value="Dining">Dining Reservation</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 font-medium">Provider / Vendor</label>
                  <Input type="text" placeholder="e.g. Marriott" value={provider} onChange={(e)=>setProvider(e.target.value)} className="bg-black/50 border-white/10 text-white h-11 rounded-xl text-xs"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 font-medium">Amount ($ USD)</label>
                  <Input type="number" value={amount} onChange={(e)=>setAmount(Number(e.target.value))} className="bg-black/50 border-white/10 text-white h-11 rounded-xl text-xs"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 font-medium">Date</label>
                  <Input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="bg-black/50 border-white/10 text-white h-11 rounded-xl text-xs"/>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={()=>setShowModal(false)} className="text-xs text-white/60">Cancel</Button>
                <Button type="button" onClick={()=>setIsPaying(true)} className="h-11 px-6 bg-[#d4b88a] text-black font-semibold rounded-full text-xs">Proceed to Payment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPaying && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative text-white">
            <div className="p-6 bg-[#111] border-b border-white/5 flex justify-between items-center">
              <div className="font-serif text-lg flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary"/>Secure Checkout</div>
              <button onClick={()=>{setIsPaying(false);setPaymentStatus("idle");}} disabled={paymentStatus==="processing"} className="text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                <div><div className="text-sm text-white/80">{itemName||"Booking"}</div><div className="text-xs text-white/40">{provider}</div></div>
                <div className="text-lg font-mono text-emerald-400"></div>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-mono text-white/50 uppercase tracking-wider">Card Information</div>
                <div className="bg-[#111] border border-white/10 rounded-xl p-3 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-white/40"/>
                  <input type="text" defaultValue="4242 4242 4242 4242" className="bg-transparent text-sm w-full focus:outline-none"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#111] border border-white/10 rounded-xl p-3"><input type="text" defaultValue="12/28" className="bg-transparent text-sm w-full focus:outline-none"/></div>
                  <div className="bg-[#111] border border-white/10 rounded-xl p-3"><input type="text" defaultValue="123" className="bg-transparent text-sm w-full focus:outline-none"/></div>
                </div>
              </div>
              <Button
                disabled={paymentStatus==="processing"||paymentStatus==="success"}
                onClick={(e)=>{
                  setPaymentStatus("processing");
                  setTimeout(()=>{
                    setPaymentStatus("success");
                    setTimeout(()=>{setIsPaying(false);setPaymentStatus("idle");handleCreateBooking(e);},1000);
                  },1500);
                }}
                className="w-full h-12 bg-emerald-500 text-black hover:bg-emerald-400 font-semibold rounded-xl text-sm transition-all"
              >
                {paymentStatus==="processing"?<RefreshCw className="w-5 h-5 animate-spin"/>:paymentStatus==="success"?<CheckCircle2 className="w-5 h-5"/>:`Pay $${amount.toLocaleString()}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070707] flex items-center justify-center text-white/60 text-xs"><Loader2 className="w-5 h-5 animate-spin mr-2 text-[#d4b88a]"/>Loading reservations...</div>}>
      <BookingsContent />
    </Suspense>
  );
}
