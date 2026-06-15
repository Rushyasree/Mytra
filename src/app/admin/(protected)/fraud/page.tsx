"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldAlert, AlertTriangle, Flag, CheckCircle, Activity, IndianRupee, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type FraudAlert = {
  id: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  signal: string;
  message: string;
  entityId: string;
  entityType: "USER" | "GUIDE" | "BOOKING";
  metadata?: Record<string, string | number | boolean | null>;
};

type FlaggedUser = {
  id: string;
  name: string | null;
  email: string | null;
  flagReason: string | null;
};

type FlaggedGuide = {
  id: string;
  flagReason: string | null;
  user: {
    name: string | null;
    email: string | null;
  };
};

type FraudResponse = {
  generatedAt: string;
  summary: {
    totalAlerts: number;
    high: number;
    medium: number;
    low: number;
    flaggedUsers: number;
    flaggedGuides: number;
  };
  alerts: FraudAlert[];
  flaggedUsers: FlaggedUser[];
  flaggedGuides: FlaggedGuide[];
};

const severityStyles = {
  HIGH: "bg-red-50 border-red-100 text-red-700",
  MEDIUM: "bg-orange-50 border-orange-100 text-orange-700",
  LOW: "bg-yellow-50 border-yellow-100 text-yellow-700",
};

const severityIconStyles = {
  HIGH: "text-red-500",
  MEDIUM: "text-orange-500",
  LOW: "text-yellow-500",
};

function MetadataList({ metadata }: { metadata?: FraudAlert["metadata"] }) {
  if (!metadata) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {Object.entries(metadata).map(([key, value]) => (
        <span key={key} className="rounded-lg bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
          {key}: {String(value)}
        </span>
      ))}
    </div>
  );
}

export default function AdminFraudPage() {
  const [data, setData] = useState<FraudResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFraudData = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/fraud");
      if (!res.ok) throw new Error("Unable to load fraud signals");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load fraud signals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFraudData();
  }, [fetchFraudData]);

  const handleUnflag = async (id: string, type: "USER" | "GUIDE") => {
    try {
      await fetch("/api/admin/fraud", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: id, targetType: type, isFlagged: false }),
      });
      fetchFraudData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading marketplace risk signals...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-red-600 flex items-center gap-2">
          <ShieldAlert className="w-8 h-8" /> Fraud & Security
        </h1>
        <p className="text-gray-500">
          Monitor booking velocity, pricing integrity, SOS incidents, and manually flagged accounts.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700 flex items-center gap-3">
          <XCircle className="h-5 w-5" /> {error}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Alerts", value: data.summary.totalAlerts, icon: Activity },
              { label: "High Risk", value: data.summary.high, icon: AlertTriangle },
              { label: "Medium Risk", value: data.summary.medium, icon: ShieldAlert },
              { label: "Flagged Users", value: data.summary.flaggedUsers, icon: Flag },
              { label: "Flagged Guides", value: data.summary.flaggedGuides, icon: IndianRupee },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <p className="text-2xl font-black">{item.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {data.alerts.map((alert) => (
              <div key={alert.id} className={`rounded-2xl border p-5 ${severityStyles[alert.severity]}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-3">
                    <AlertTriangle className={`mt-0.5 h-5 w-5 ${severityIconStyles[alert.severity]}`} />
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest">
                          {alert.severity}
                        </span>
                        <span className="text-xs font-black uppercase tracking-widest">{alert.signal}</span>
                        <span className="text-xs font-semibold opacity-70">{alert.entityType}</span>
                      </div>
                      <p className="text-sm font-bold">{alert.message}</p>
                      <MetadataList metadata={alert.metadata} />
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-9 rounded-xl bg-white/60 px-4">
                    Review
                  </Button>
                </div>
              </div>
            ))}
            {data.alerts.length === 0 && (
              <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-sm font-bold text-green-800">No pricing, booking, or SOS risk signals currently require review.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" /> Flagged Users
              </h2>
              <div className="space-y-4">
                {data.flaggedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                    <div>
                      <p className="font-bold text-sm">{user.name || "Unnamed user"}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">
                        Reason: {user.flagReason || "Manual review"}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleUnflag(user.id, "USER")} variant="ghost" className="text-primary hover:bg-primary/5">
                      Resolve
                    </Button>
                  </div>
                ))}
                {data.flaggedUsers.length === 0 && <p className="text-sm text-gray-400">No users currently flagged.</p>}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" /> Flagged Guides
              </h2>
              <div className="space-y-4">
                {data.flaggedGuides.map((guide) => (
                  <div key={guide.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                    <div>
                      <p className="font-bold text-sm">{guide.user.name || "Unnamed guide"}</p>
                      <p className="text-xs text-gray-500">{guide.user.email}</p>
                      <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">
                        Reason: {guide.flagReason || "Manual review"}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleUnflag(guide.id, "GUIDE")} variant="ghost" className="text-primary hover:bg-primary/5">
                      Resolve
                    </Button>
                  </div>
                ))}
                {data.flaggedGuides.length === 0 && <p className="text-sm text-gray-400">No guides currently flagged.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
