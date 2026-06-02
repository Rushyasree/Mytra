"use client";

import { useState } from "react";
import { MapPin, Map, Check, Navigation } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  bookingId: string;
}

export function LocationShare({ bookingId }: Props) {
  const [sharing, setSharing] = useState(false);
  const [success, setSuccess] = useState(false);

  const shareLocation = async () => {
    setSharing(true);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setSharing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          await fetch("/api/safety/location", {
            method: "POST",
            body: JSON.stringify({ bookingId, lat: latitude, lng: longitude })
          });
          
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
          alert("Failed to share location");
        } finally {
          setSharing(false);
        }
      },
      (error) => {
        alert("Location access denied. Please enable it in settings.");
        setSharing(false);
      }
    );
  };

  return (
    <Button 
      variant="outline" 
      onClick={shareLocation}
      loading={sharing}
      className={`rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs gap-2 transition-all
        ${success ? "bg-green-50 text-green-600 border-green-200" : ""}
      `}
    >
      {success ? (
        <><Check className="w-4 h-4" /> Shared</>
      ) : (
        <><Navigation className="w-4 h-4" /> Share Live Location</>
      )}
    </Button>
  );
}
