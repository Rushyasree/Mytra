"use client";
import { useState, useEffect } from "react";
import { Check, X, MapPin, Mail, ExternalLink } from "lucide-react";
import { Button } from "../ui/Button";

interface Guide {
  id: string;
  status: string;
  university: string;
  pricePerHour: number;
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  city?: {
    name: string;
  };
}

export function GuideApprovalList() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuides = async () => {
    try {
      const res = await fetch("/api/admin/guides");
      const data = await res.json();
      setGuides(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED" | "PENDING") => {
    try {
      const res = await fetch(`/api/admin/guides/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setGuides(prev => prev.map(g => g.id === id ? { ...g, status } : g));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">
    {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl" />)}
  </div>;

  return (
    <div className="space-y-6">
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
              src={guide.user.image || `https://ui-avatars.com/api/?name=${guide.user.name}`} 
              className="w-20 h-20 rounded-[1.5rem] border-4 border-gray-50 dark:border-black shadow-lg" 
              alt="" 
            />
            
            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h3 className="text-xl font-black">{guide.user.name}</h3>
                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                  guide.status === "APPROVED" ? "bg-green-100 text-green-600" : 
                  guide.status === "REJECTED" ? "bg-red-100 text-red-600" : 
                  "bg-orange-100 text-orange-600"
                }`}>
                  {guide.status}
                </span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-5 text-sm text-gray-500 font-semibold">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-primary" /> {guide.user.email}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {guide.city?.name || "No City"}</span>
                <span className="text-secondary dark:text-white font-black">₹{guide.pricePerHour}/hr</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                 <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 dark:bg-black px-2 py-0.5 rounded-md">University</span>
                 <p className="text-xs font-bold italic">{guide.university}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {guide.status === "PENDING" && (
                <>
                  <Button 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 h-12 px-8 rounded-2xl shadow-lg shadow-green-200"
                    onClick={() => handleAction(guide.id, "APPROVED")}
                  >
                    <Check className="w-5 h-5 mr-2" /> Approve
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-red-100 text-red-500 hover:bg-red-50 h-12 px-8 rounded-2xl"
                    onClick={() => handleAction(guide.id, "REJECTED")}
                  >
                    <X className="w-5 h-5 mr-2" /> Reject
                  </Button>
                </>
              )}
              {guide.status !== "PENDING" && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12 px-8 rounded-2xl border-gray-200 text-gray-500" 
                  onClick={() => handleAction(guide.id, "PENDING")}
                >
                  Revert to Pending
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
