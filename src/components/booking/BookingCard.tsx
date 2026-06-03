"use client";

import { Button } from "@/components/ui/Button";
import { Info, ShieldCheck, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BookingCardProps {
  guide: {
    id: string;
    cityId?: string | null;
    pricePerHour: number;
    user: {
      name?: string | null;
    };
  };
}

export function BookingCard({ guide }: BookingCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const platformFeePreview = Math.round(guide.pricePerHour * 0.15);

  const openBookingFlow = () => {
    setLoading(true);
    router.push(`/booking?guideId=${guide.id}${guide.cityId ? `&cityId=${guide.cityId}` : ""}`);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-gray-800 sticky top-24 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-3xl font-black text-secondary dark:text-white tracking-tighter">Rs {guide.pricePerHour}</span>
          <span className="text-sm font-bold text-gray-400 ml-1">/ hour</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-black text-green-500 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
          <Zap className="w-3 h-3 fill-current" /> Request
        </div>
      </div>

      <div className="space-y-3 mb-8 p-6 bg-gray-50 dark:bg-black rounded-[2rem] border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between text-xs font-bold text-gray-500">
          <span>Guide hourly rate</span>
          <span className="text-secondary dark:text-white">Rs {guide.pricePerHour}</span>
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-500">
          <span className="flex items-center gap-1 underline decoration-dotted">Estimated platform fee <Info className="w-3 h-3" /></span>
          <span className="text-secondary dark:text-white">from Rs {platformFeePreview}</span>
        </div>
        <div className="pt-3 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500">
          Final pricing is calculated server-side after you select an available slot.
        </div>
      </div>

      <Button
        onClick={openBookingFlow}
        loading={loading}
        className="w-full h-16 rounded-[1.5rem] text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20"
      >
        Choose Available Slot
      </Button>

      <p className="text-center text-[10px] font-bold text-gray-400 mt-4 px-4 uppercase tracking-tight">
        Payment is not charged yet
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-accent/20 bg-accent/5 p-4 text-sm text-gray-500">
        <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
        <span>Booking requests are held as pending until the guide accepts.</span>
      </div>
    </div>
  );
}
