"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  bookingId: string;
}

export function SOSButton({ bookingId }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [triggered, setTriggered] = useState(false);

  const handleSOS = async () => {
    setLoading(true);
    
    // Get location
    let lat = null;
    let lng = null;
    
    try {
      const pos: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch (err) {
      console.warn("Location denied for SOS");
    }

    try {
      await fetch("/api/safety/sos", {
        method: "POST",
        body: JSON.stringify({ bookingId, lat, lng })
      });
      setTriggered(true);
      setShowModal(false);
    } catch (err) {
      alert("Emergency alert failed. Please contact support immediately.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className={`fixed bottom-8 right-8 z-50 w-20 h-20 rounded-full flex flex-col items-center justify-center text-white font-black transition-all shadow-2xl ring-4 ring-white dark:ring-gray-900 animate-pulse
          ${triggered ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"}
        `}
      >
        <ShieldAlert className="w-8 h-8 mb-1" />
        <span className="text-[10px] uppercase tracking-widest">SOS</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-red-600/20 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl border-4 border-red-100">
            <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
               <AlertTriangle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">Emergency SOS</h2>
            <p className="text-gray-500 text-sm mb-8">
              Triggering SOS will alert your guide, local support, and Mytra administrators with your current location. Are you sure?
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleSOS}
                loading={loading}
                className="w-full bg-red-600 hover:bg-red-700 h-14 rounded-2xl font-black text-lg shadow-lg shadow-red-200"
              >
                Trigger SOS
              </Button>
              <button 
                onClick={() => setShowModal(false)}
                className="text-sm font-bold text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {triggered && (
        <div className="fixed bottom-32 right-8 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-black text-sm z-50 animate-in slide-in-from-bottom duration-500">
          🆘 SOS Alert Sent Successfully
        </div>
      )}
    </>
  );
}
