"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, UserMinus, Flag, CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminFraudPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFraudData = async () => {
    try {
      const res = await fetch("/api/admin/fraud");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraudData();
  }, []);

  const handleUnflag = async (id: string, type: string) => {
    try {
      await fetch("/api/admin/fraud", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: id, targetType: type, isFlagged: false })
      });
      fetchFraudData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Scanning for threats...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-red-600 flex items-center gap-2">
          <ShieldAlert className="w-8 h-8" /> Fraud & Security
        </h1>
        <p className="text-gray-500">Monitor suspicious activities and manage flagged accounts.</p>
      </div>

      {/* Real-time Alerts */}
      <div className="grid grid-cols-1 gap-4">
        {data.alerts.map((alert: any, i: number) => (
          <div key={i} className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-bold text-orange-800">{alert.message}</p>
                <p className="text-xs text-orange-600">Automated pattern detection flagged this entity for review.</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-100 h-9 px-4 rounded-xl">Review</Button>
          </div>
        ))}
        {data.alerts.length === 0 && (
          <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-sm font-bold text-green-800">No suspicious activity detected in the last 24 hours.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Flagged Users */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" /> Flagged Users
          </h2>
          <div className="space-y-4">
            {data.flaggedUsers.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div>
                  <p className="font-bold text-sm">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                  <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">Reason: {u.flagReason || 'Unknown'}</p>
                </div>
                <Button size="sm" onClick={() => handleUnflag(u.id, "USER")} variant="ghost" className="text-primary hover:bg-primary/5">Resolve</Button>
              </div>
            ))}
            {data.flaggedUsers.length === 0 && <p className="text-sm text-gray-400">No users currently flagged.</p>}
          </div>
        </div>

        {/* Flagged Guides */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" /> Flagged Guides
          </h2>
          <div className="space-y-4">
            {data.flaggedGuides.map((g: any) => (
              <div key={g.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div>
                  <p className="font-bold text-sm">{g.user.name}</p>
                  <p className="text-xs text-gray-500">{g.user.email}</p>
                  <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">Reason: {g.flagReason || 'Policy Violation'}</p>
                </div>
                <Button size="sm" onClick={() => handleUnflag(g.id, "GUIDE")} variant="ghost" className="text-primary hover:bg-primary/5">Resolve</Button>
              </div>
            ))}
            {data.flaggedGuides.length === 0 && <p className="text-sm text-gray-400">No guides currently flagged.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
