"use client";

import { useState } from "react";
import { Ban, Check, Loader2, MapPin, Mail, X } from "lucide-react";
import { Button } from "../ui/Button";

interface Guide {
  id: string;
  status: string;
  university: string | null;
  pricePerHour: number;
  bio: string | null;
  languages: string | null;
  interests: string | null;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  city?: {
    name: string;
  } | null;
}

const statusClass: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-600",
  REJECTED: "bg-red-100 text-red-600",
  SUSPENDED: "bg-gray-200 text-gray-600",
  PENDING_APPROVAL: "bg-orange-100 text-orange-600",
};

export function GuideApprovalList({ initialGuides }: { initialGuides: Guide[] }) {
  const [guides, setGuides] = useState<Guide[]>(initialGuides);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleAction = async (id: string, action: "APPROVE" | "REJECT" | "SUSPEND") => {
    setActionId(id);
    setError("");

    try {
      const res = await fetch(`/api/admin/guides/${id}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update guide status.");

      setGuides((prev) => prev.map((guide) => (guide.id === id ? { ...guide, status: data.status } : guide)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update guide status.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      {guides.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 bg-gray-50 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-bold">No guide applications found.</p>
          <p className="text-xs text-gray-400 mt-1">Applications will appear here once guides sign up.</p>
        </div>
      ) : (
        guides.map((guide) => (
          <div key={guide.id} className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center gap-8 hover:shadow-xl transition-all">
            <img
              src={guide.user.image || `https://ui-avatars.com/api/?name=${guide.user.name || "Guide"}`}
              className="w-20 h-20 rounded-[1.5rem] border-4 border-gray-50 dark:border-black shadow-lg"
              alt={guide.user.name || "Guide applicant"}
            />

            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h3 className="text-xl font-black">{guide.user.name || "Unnamed guide"}</h3>
                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${statusClass[guide.status] || statusClass.PENDING_APPROVAL}`}>
                  {guide.status.replace("_", " ")}
                </span>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-5 text-sm text-gray-500 font-semibold">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-primary" /> {guide.user.email || "No email"}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {guide.city?.name || "No city"}</span>
                <span className="text-secondary dark:text-white font-black">Rs {guide.pricePerHour}/hr</span>
              </div>

              <div className="mt-4 flex flex-wrap justify-center md:justify-start items-center gap-2">
                {guide.university && <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 dark:bg-black px-2 py-0.5 rounded-md">{guide.university}</span>}
                {guide.languages && <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 dark:bg-black px-2 py-0.5 rounded-md">{guide.languages}</span>}
                {guide.interests && <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 dark:bg-black px-2 py-0.5 rounded-md">{guide.interests}</span>}
              </div>

              {guide.bio && <p className="mt-3 text-sm text-gray-500 line-clamp-2">{guide.bio}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {guide.status !== "APPROVED" && (
                <Button
                  size="lg"
                  disabled={actionId === guide.id}
                  className="bg-green-600 hover:bg-green-700 h-12 px-8 rounded-2xl shadow-lg shadow-green-200"
                  onClick={() => handleAction(guide.id, "APPROVE")}
                >
                  {actionId === guide.id ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
                  Approve
                </Button>
              )}

              {guide.status !== "REJECTED" && (
                <Button
                  size="lg"
                  variant="outline"
                  disabled={actionId === guide.id}
                  className="border-red-100 text-red-500 hover:bg-red-50 h-12 px-8 rounded-2xl"
                  onClick={() => handleAction(guide.id, "REJECT")}
                >
                  <X className="w-5 h-5 mr-2" />
                  Reject
                </Button>
              )}

              {guide.status === "APPROVED" && (
                <Button
                  variant="outline"
                  size="lg"
                  disabled={actionId === guide.id}
                  className="h-12 px-8 rounded-2xl border-gray-200 text-gray-500"
                  onClick={() => handleAction(guide.id, "SUSPEND")}
                >
                  <Ban className="w-5 h-5 mr-2" />
                  Suspend
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
