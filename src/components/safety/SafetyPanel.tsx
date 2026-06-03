"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert, X, Navigation, Check, MapPin, ShieldCheck, Heart, Map } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Props {
  bookingId: string;
  guideName: string;
  tripDate: string;
}

export function SafetyPanel({ bookingId, guideName, tripDate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  const handleSOS = async () => {
    if (!confirm("Are you sure you want to trigger SOS? This will alert Mytra Admins and your guide.")) return;
    
    setSosLoading(true);
    try {
      await fetch("/api/safety/sos", {
        method: "POST",
        body: JSON.stringify({ bookingId, lat: coords?.lat, lng: coords?.lng })
      });
      setSosTriggered(true);
    } catch (err) {
      alert("SOS failed. Call emergency services!");
    } finally {
      setSosLoading(false);
    }
  };

  const shareLocation = async () => {
    setSharing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        try {
          await fetch("/api/safety/location", {
            method: "POST",
            body: JSON.stringify({ bookingId, lat: latitude, lng: longitude })
          });
          setLocationShared(true);
          setTimeout(() => setLocationShared(false), 5000);
        } catch (err) {
          alert("Location share failed");
        } finally {
          setSharing(false);
        }
      },
      () => {
        alert("Location permission denied");
        setSharing(false);
      }
    );
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex flex-col items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ring-4 ring-white dark:ring-gray-900 group"
      >
        <ShieldAlert className="w-7 h-7 group-hover:animate-bounce" />
        <span className="text-[8px] font-black uppercase tracking-widest mt-1">Safety</span>
      </button>

      {/* Panel Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-secondary/40 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
             
             {/* Header */}
             <div className="bg-red-600 p-8 text-white flex justify-between items-start">
                <div>
                   <h2 className="text-3xl font-black tracking-tighter leading-none mb-2 uppercase">Safety Panel</h2>
                   <div className="flex items-center gap-2 opacity-80">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Active Protection Enabled</span>
                   </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                   <X className="w-5 h-5" />
                </button>
             </div>

             <div className="p-8 space-y-8">
                {/* Emergency SOS Section */}
                <div className="text-center space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Emergency Actions</p>
                   <button 
                     onClick={handleSOS}
                     disabled={sosTriggered}
                     className={`w-32 h-32 rounded-full mx-auto flex flex-col items-center justify-center transition-all shadow-xl shadow-red-200
                       ${sosTriggered ? "bg-gray-100 text-gray-400" : "bg-red-600 hover:bg-red-700 text-white animate-pulse ring-8 ring-red-50"}
                     `}
                   >
                      <AlertTriangle className="w-10 h-10 mb-1" />
                      <span className="text-xs font-black uppercase tracking-widest">SOS</span>
                   </button>
                   {sosTriggered && <p className="text-xs font-black text-green-500 uppercase">Emergency Alert Sent Successfully</p>}
                </div>

                {/* Info & Tools */}
                <div className="space-y-4">
                   <div className="p-6 rounded-[2rem] bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-center mb-4">
                         <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Location</h3>
                         {locationShared && <span className="text-[10px] font-black text-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> Shared</span>}
                      </div>
                      <div className="flex items-center gap-4">
                         <Button 
                           onClick={shareLocation}
                           loading={sharing}
                           className="flex-1 rounded-2xl h-12 bg-secondary hover:bg-secondary/90 font-black uppercase tracking-widest text-[10px] gap-2"
                         >
                            <Navigation className="w-4 h-4" /> Update Location
                         </Button>
                         {coords && (
                           <Link 
                             href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`} 
                             target="_blank"
                             className="w-12 h-12 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-center text-secondary dark:text-white"
                           >
                             <Map className="w-5 h-5" />
                           </Link>
                         )}
                      </div>
                   </div>

                   <div className="p-6 rounded-[2rem] bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Emergency Contact</h3>
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Heart className="w-6 h-6 fill-current" />
                         </div>
                         <div>
                            <p className="font-black text-secondary dark:text-white">{guideName}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase">Primary Responder (Guide)</p>
                         </div>
                      </div>
                   </div>
                </div>

                <p className="text-center text-[10px] font-bold text-gray-400 px-8">
                  Mytra Safety handles emergency requests 24/7. Your data is encrypted and only shared with responders.
                </p>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
