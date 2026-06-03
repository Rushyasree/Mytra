"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { Button } from "@/components/ui/Button";
import { AlertCircle, Check, Clock, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type GuideOption = {
  id: string;
  userId: string;
  name: string;
  image: string | null;
  university: string | null;
  rating: number;
  pricePerHour: number;
  cityId: string;
  cityName: string;
};

type ExperienceOption = {
  id: string;
  title: string;
  price: number;
  cityId: string;
  cityName: string;
} | null;

type AvailabilitySlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
};

export function BookingRequestForm({
  guides,
  selectedGuideId,
  experience,
}: {
  guides: GuideOption[];
  selectedGuideId: string;
  experience: ExperienceOption;
}) {
  const [guideId, setGuideId] = useState(selectedGuideId);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [slotId, setSlotId] = useState("");
  const [travelersCount, setTravelersCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successBookingId, setSuccessBookingId] = useState("");

  const selectedGuide = useMemo(
    () => guides.find((guide) => guide.id === guideId) || guides[0],
    [guideId, guides]
  );

  const selectedSlot = availability.find((slot) => slot.id === slotId);

  useEffect(() => {
    let ignore = false;
    setAvailabilityLoading(true);
    setSlotId("");
    setError("");

    fetch(`/api/guides/${guideId}/availability`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load availability.");
        if (!ignore) setAvailability(data.availability || []);
      })
      .catch((err) => {
        if (!ignore) {
          setAvailability([]);
          setError(err instanceof Error ? err.message : "Could not load availability.");
        }
      })
      .finally(() => {
        if (!ignore) setAvailabilityLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [guideId]);

  const durationHours = selectedSlot
    ? Math.max(1, Number(selectedSlot.endTime.split(":")[0]) - Number(selectedSlot.startTime.split(":")[0]))
    : 0;
  const guideAmount = selectedGuide.pricePerHour * durationHours;
  const experienceAmount = experience?.price || 0;
  const total = (guideAmount + experienceAmount) * travelersCount;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (!selectedSlot) {
        throw new Error("Select an available slot before booking.");
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideProfileId: selectedGuide.id,
          experienceId: experience?.id,
          cityId: selectedGuide.cityId,
          availabilityId: selectedSlot.id,
          date: selectedSlot.date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          travelersCount,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create booking.");

      setSuccessBookingId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create booking.");
    } finally {
      setLoading(false);
    }
  };

  if (successBookingId) {
    return (
      <div className="max-w-lg mx-auto text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-10 shadow-sm">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black mb-3">Request Sent</h2>
        <p className="text-gray-500 mb-8">
          Your booking request was sent to {selectedGuide.name}. You will see updates in your dashboard.
        </p>
        <Link href="/dashboard">
          <Button className="w-full h-12 rounded-xl">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
          <h2 className="text-xl font-bold">1. Choose Guide</h2>
          <div className="grid gap-3">
            {guides.map((guide) => (
              <button
                key={guide.id}
                type="button"
                onClick={() => setGuideId(guide.id)}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${guide.id === guideId ? "border-primary bg-primary/5" : "border-gray-100 dark:border-gray-800 hover:border-primary/30"}`}
              >
                <img src={guide.image || `https://ui-avatars.com/api/?name=${guide.name}`} alt={guide.name} className="w-14 h-14 rounded-2xl object-cover" />
                <div className="flex-1">
                  <p className="font-black">{guide.name}</p>
                  <p className="text-sm text-gray-500">{guide.university || "Verified local guide"} · {guide.cityName}</p>
                </div>
                <div className="text-right">
                  <p className="font-black">Rs {guide.pricePerHour}/hr</p>
                  <p className="text-xs text-yellow-500 flex items-center justify-end gap-1"><Star className="w-3 h-3 fill-current" /> {guide.rating}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
          <h2 className="text-xl font-bold">2. Select Available Slot</h2>
          {availabilityLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading availability...
            </div>
          ) : availability.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center text-gray-500">
              This guide has no open slots yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {availability.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSlotId(slot.id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${slot.id === slotId ? "border-primary bg-primary/5" : "border-gray-100 dark:border-gray-800 hover:border-primary/30"}`}
                >
                  <p className="font-black">{new Date(slot.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {slot.startTime} - {slot.endTime}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
          <h2 className="text-xl font-bold">3. Trip Details</h2>
          <div>
            <label htmlFor="travelersCount" className="block text-sm font-bold mb-2">Travelers</label>
            <input id="travelersCount" type="number" min={1} max={10} value={travelersCount} onChange={(e) => setTravelersCount(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-bold mb-2">Notes for the guide</label>
            <textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Share interests, pickup needs, accessibility notes, or anything the guide should know." className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
      </div>

      <aside className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm h-fit sticky top-24">
        <h3 className="font-black text-lg mb-5">Booking Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Guide</span>
            <span className="font-bold text-right">{selectedGuide.name}</span>
          </div>
          {experience && (
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Experience</span>
              <span className="font-bold text-right">{experience.title}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Slot</span>
            <span className="font-bold">{selectedSlot ? `${selectedSlot.startTime}-${selectedSlot.endTime}` : "Not selected"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Guide fee</span>
            <span className="font-bold">Rs {guideAmount.toLocaleString("en-IN")}</span>
          </div>
          {experienceAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Experience</span>
              <span className="font-bold">Rs {experienceAmount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Travelers</span>
            <span className="font-bold">x {travelersCount}</span>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-between text-lg">
            <span className="font-black">Total</span>
            <span className="font-black text-primary">Rs {total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-accent/5 border border-accent/20 p-4 text-xs text-gray-500">
          Payment is initialized for future Razorpay or Stripe integration. No real charge is made yet.
        </div>

        <Button onClick={handleSubmit} disabled={loading || !selectedSlot} className="w-full h-12 rounded-xl mt-5">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Booking Request"}
        </Button>
      </aside>
    </div>
  );
}
