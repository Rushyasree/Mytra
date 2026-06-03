"use client";
import { useState } from "react";
import { Button } from "./Button";
import { useRouter } from "next/navigation";

interface BookingStatusButtonsProps {
  bookingId: string;
  currentStatus: string;
  mode?: "guide" | "traveler";
}

export function BookingStatusButtons({ bookingId, currentStatus, mode = "guide" }: BookingStatusButtonsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "traveler" && (currentStatus === "PENDING" || currentStatus === "CONFIRMED")) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={loading}
        onClick={() => updateStatus("CANCELLED")}
        className="rounded-lg px-4 border-red-200 text-red-500 hover:bg-red-50"
      >
        Cancel
      </Button>
    );
  }

  if (mode === "guide" && currentStatus === "PENDING") {
    return (
      <div className="flex items-center gap-3">
        <Button 
          size="sm" 
          disabled={loading}
          onClick={() => updateStatus("CONFIRMED")}
          className="rounded-lg px-4 bg-green-600 hover:bg-green-700"
        >
          Accept
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          disabled={loading}
          onClick={() => updateStatus("CANCELLED")}
          className="rounded-lg px-4 border-red-200 text-red-500 hover:bg-red-50"
        >
          Decline
        </Button>
      </div>
    );
  }

  if (mode === "guide" && currentStatus === "CONFIRMED") {
    return (
      <Button 
        size="sm" 
        disabled={loading}
        onClick={() => updateStatus("COMPLETED")}
        className="rounded-lg px-4 bg-primary hover:bg-primary/90"
      >
        Mark Completed
      </Button>
    );
  }

  return (
    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{currentStatus}</span>
  );
}
