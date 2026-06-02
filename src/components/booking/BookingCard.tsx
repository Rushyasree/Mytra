"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Calendar, Clock, ChevronDown, Check, Plus, Info, Zap, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface BookingCardProps {
  guide: any;
}

export function BookingCard({ guide }: BookingCardProps) {
  const router = useRouter();
  const [duration, setDuration] = useState(4); // Default 4 hours
  const [date, setDate] = useState("");
  const [addons, setAddons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const hourlyRate = guide.pricePerHour;
  const platformFee = Math.round(hourlyRate * duration * 0.15); // 15%
  const addonCosts = {
    translator: 500,
    pickup: 1000
  };

  const totalAddonCost = addons.reduce((sum, key) => sum + (addonCosts[key as keyof typeof addonCosts] || 0), 0);
  const totalBasePrice = hourlyRate * duration;
  const totalPrice = totalBasePrice + platformFee + totalAddonCost;

  const toggleAddon = (key: string) => {
    setAddons(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleBooking = async () => {
    if (!date) {
      alert("Please select a date");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          guideId: guide.user.id,
          date: new Date(date),
          duration,
          totalPrice,
          addons
        })
      });
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-gray-800 sticky top-24 w-full">
      {/* Price Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-3xl font-black text-secondary dark:text-white tracking-tighter">₹{hourlyRate}</span>
          <span className="text-sm font-bold text-gray-400 ml-1">/ hour</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-black text-green-500 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
          <Zap className="w-3 h-3 fill-current" /> Instant Book
        </div>
      </div>

      {/* Date & Duration Selection */}
      <div className="space-y-6 mb-8">
        <div className="p-4 bg-gray-50 dark:bg-black rounded-3xl border border-gray-100 dark:border-gray-800">
           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 px-2">Select Date</label>
           <input 
             type="date" 
             className="bg-transparent border-none w-full text-sm font-bold outline-none cursor-pointer"
             value={date}
             onChange={(e) => setDate(e.target.value)}
           />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block px-2">Duration</label>
          <div className="grid grid-cols-3 gap-2">
             {[
               { l: "Half-Day", v: 4 },
               { l: "Full-Day", v: 8 },
               { l: "Custom", v: duration }
             ].map((opt, i) => (
               <button
                 key={i}
                 onClick={() => setDuration(opt.v)}
                 className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                   (i < 2 && duration === opt.v) || (i === 2 && duration !== 4 && duration !== 8)
                     ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20"
                     : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-primary/30"
                 }`}
               >
                 {opt.l}
               </button>
             ))}
          </div>
          {(duration !== 4 && duration !== 8) && (
            <div className="flex items-center gap-4 px-4 py-3 bg-primary/5 rounded-2xl border border-primary/10">
               <span className="text-xs font-bold text-primary">Hours:</span>
               <input 
                 type="range" min="2" max="12" step="1" 
                 value={duration} 
                 onChange={(e) => setDuration(parseInt(e.target.value))}
                 className="flex-1 accent-primary h-1 bg-primary/20 rounded-lg appearance-none cursor-pointer" 
               />
               <span className="text-xs font-black text-primary">{duration}h</span>
            </div>
          )}
        </div>
      </div>

      {/* Add-ons */}
      <div className="space-y-4 mb-8">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block px-2">Experience Add-ons</label>
        <div className="space-y-2">
           {[
             { id: "translator", label: "Professional Translator", price: 500, icon: "🗣️" },
             { id: "pickup", label: "Airport / Hotel Pickup", price: 1000, icon: "🚗" }
           ].map(item => (
             <button
               key={item.id}
               onClick={() => toggleAddon(item.id)}
               className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                 addons.includes(item.id)
                   ? "bg-primary/5 border-primary shadow-sm"
                   : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-primary/30"
               }`}
             >
                <div className="flex items-center gap-3">
                   <span className="text-lg">{item.icon}</span>
                   <div className="text-left">
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] text-gray-400 font-medium">+₹{item.price}</p>
                   </div>
                </div>
                {addons.includes(item.id) ? (
                  <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center">
                     <Check className="w-3 h-3" />
                  </div>
                ) : (
                  <Plus className="w-4 h-4 text-gray-300" />
                )}
             </button>
           ))}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-3 mb-8 p-6 bg-gray-50 dark:bg-black rounded-[2rem] border border-gray-100 dark:border-gray-800">
         <div className="flex justify-between text-xs font-bold text-gray-500">
            <span>₹{hourlyRate} x {duration} hours</span>
            <span className="text-secondary dark:text-white">₹{totalBasePrice}</span>
         </div>
         {totalAddonCost > 0 && (
           <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>Add-ons</span>
              <span className="text-secondary dark:text-white">₹{totalAddonCost}</span>
           </div>
         )}
         <div className="flex justify-between text-xs font-bold text-gray-500">
            <span className="flex items-center gap-1 underline decoration-dotted">Mytra Platform Fee <Info className="w-3 h-3" /></span>
            <span className="text-secondary dark:text-white">₹{platformFee}</span>
         </div>
         <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <span className="text-sm font-black uppercase tracking-widest text-secondary dark:text-white">Total</span>
            <span className="text-2xl font-black text-primary tracking-tighter">₹{totalPrice}</span>
         </div>
      </div>

      {/* Booking Button */}
      <Button 
        onClick={handleBooking}
        loading={loading}
        className="w-full h-16 rounded-[1.5rem] text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20"
      >
        Reserve Trip
      </Button>
      
      <p className="text-center text-[10px] font-bold text-gray-400 mt-4 px-4 uppercase tracking-tight">
        You won't be charged yet
      </p>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl" />
           <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] p-12 text-center shadow-2xl border-2 border-primary/10 max-w-sm w-full">
              <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                 <ShieldCheck className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Trip Reserved!</h2>
              <p className="text-gray-500 text-sm font-medium">Your experience with {guide.user.name} is confirmed. Redirecting to your dashboard...</p>
           </div>
        </div>
      )}
    </div>
  );
}
