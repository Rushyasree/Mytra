"use client";

import { Button } from "@/components/ui/Button";
import { CheckCircle2, Clock, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

type CityOption = {
  id: string;
  name: string;
  state: string;
};

type ProfileState = {
  status: string;
  city: string;
  bio: string;
  languages: string;
  interests: string;
  hourlyRate: number;
  university: string;
  studentId: string;
  governmentId: string;
  emergencyContact: string;
  availability: string;
};

export function GuideApplicationForm({
  cities,
  initialProfile,
}: {
  cities: CityOption[];
  initialProfile: ProfileState;
}) {
  const [form, setForm] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (key: keyof ProfileState, value: string | number) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/guides/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not submit application.");
      }

      setForm((current) => ({ ...current, status: "PENDING_APPROVAL" }));
      setSuccess("Application submitted. Your guide profile is under review.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit application.");
    } finally {
      setLoading(false);
    }
  };

  const statusCopy =
    form.status === "APPROVED"
      ? "Your guide profile is approved and visible to travelers."
      : form.status === "REJECTED"
        ? "Your application was rejected. Update your details and resubmit for review."
        : form.status === "SUSPENDED"
          ? "Your guide profile is suspended. Contact support before resubmitting."
          : "Your guide application is under review.";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="city" className="block text-sm font-bold mb-2">Primary City</label>
            <select id="city" required value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select city</option>
              {cities.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}, {city.state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-bold mb-2">Hourly Rate</label>
            <input id="hourlyRate" required min={100} max={10000} type="number" value={form.hourlyRate} onChange={(e) => update("hourlyRate", Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-bold mb-2">Guide Bio</label>
          <textarea id="bio" required minLength={60} rows={5} value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Tell travelers what makes your local experience special." className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary" />
          <p className="mt-1 text-xs text-gray-500">Minimum 60 characters.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="languages" className="block text-sm font-bold mb-2">Languages</label>
            <input id="languages" required value={form.languages} onChange={(e) => update("languages", e.target.value)} placeholder="English, Hindi, Telugu" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="interests" className="block text-sm font-bold mb-2">Interests / Expertise</label>
            <input id="interests" required value={form.interests} onChange={(e) => update("interests", e.target.value)} placeholder="Food, Heritage, Photography" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="university" className="block text-sm font-bold mb-2">University / College</label>
            <input id="university" required value={form.university} onChange={(e) => update("university", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="studentId" className="block text-sm font-bold mb-2">Student ID</label>
            <input id="studentId" required value={form.studentId} onChange={(e) => update("studentId", e.target.value)} placeholder="College ID number" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="governmentId" className="block text-sm font-bold mb-2">Government ID Placeholder</label>
            <input id="governmentId" required value={form.governmentId} onChange={(e) => update("governmentId", e.target.value)} placeholder="Masked ID reference only" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="emergencyContact" className="block text-sm font-bold mb-2">Emergency Contact</label>
            <input id="emergencyContact" required value={form.emergencyContact} onChange={(e) => update("emergencyContact", e.target.value)} placeholder="+91 98765 43210" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div>
          <label htmlFor="availability" className="block text-sm font-bold mb-2">Availability</label>
          <textarea id="availability" rows={3} value={form.availability} onChange={(e) => update("availability", e.target.value)} placeholder="Weekends 9 AM-6 PM, Fridays after 2 PM" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary" />
        </div>

        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}
        {success && <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">{success}</p>}

        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </span>
          ) : "Submit for Admin Review"}
        </Button>
      </form>

      <aside className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 h-fit shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          {form.status === "APPROVED" ? <ShieldCheck className="w-6 h-6" /> : form.status === "PENDING_APPROVAL" ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Application Status</p>
        <h2 className="text-xl font-black mb-2">{form.status.replace("_", " ")}</h2>
        <p className="text-sm text-gray-500 leading-relaxed">{statusCopy}</p>
      </aside>
    </div>
  );
}
