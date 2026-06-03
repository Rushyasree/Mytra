"use client";

import { Button } from "@/components/ui/Button";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

type Slot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

export function AvailabilityManager({ initialSlots }: { initialSlots: Slot[] }) {
  const [slots, setSlots] = useState(initialSlots);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const createSlot = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/guides/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, startTime, endTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create availability.");

      setSlots((current) => [
        ...current,
        {
          id: data.availability.id,
          date: data.availability.date.split("T")[0],
          startTime: data.availability.startTime,
          endTime: data.availability.endTime,
          isBooked: data.availability.isBooked,
        },
      ]);
      setSuccess("Availability slot added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create availability.");
    } finally {
      setLoading(false);
    }
  };

  const deleteSlot = async (id: string) => {
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/guides/availability/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete slot.");

      setSlots((current) => current.filter((slot) => slot.id !== id));
      setSuccess("Availability slot deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete slot.");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[24rem_1fr]">
      <form onSubmit={createSlot} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 h-fit shadow-sm space-y-5">
        <h2 className="text-xl font-black">Add Slot</h2>
        <div>
          <label htmlFor="date" className="block text-sm font-bold mb-2">Date</label>
          <input id="date" type="date" required min={new Date().toISOString().split("T")[0]} value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startTime" className="block text-sm font-bold mb-2">Start</label>
            <input id="startTime" type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-bold mb-2">End</label>
            <input id="endTime" type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-600">{error}</p>}
        {success && <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-700">{success}</p>}
        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Slot"}
        </Button>
      </form>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <h2 className="text-xl font-black mb-5">Published Slots</h2>
        {slots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-10 text-center text-gray-500">
            No availability slots yet.
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map((slot) => (
              <div key={slot.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <div>
                  <p className="font-black">{new Date(slot.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">{slot.startTime} - {slot.endTime}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${slot.isBooked ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {slot.isBooked ? "Booked" : "Open"}
                  </span>
                  <Button size="sm" variant="outline" disabled={slot.isBooked} onClick={() => deleteSlot(slot.id)} className="rounded-xl text-red-500 border-red-100">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
