"use client";
import { Navbar } from "@/components/ui/Navbar";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/ui/Footer";
import { Sparkles, MapPin, Clock, IndianRupee, Utensils, Compass, Hotel, AlertCircle, Star, RotateCw } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const cities = ["Delhi", "Mumbai", "Jaipur", "Varanasi", "Goa", "Kerala", "Bengaluru", "Kolkata"];
const interests = ["Street Food", "Heritage", "Shopping", "Photography", "Nightlife", "Spirituality", "Nature", "Art"];

import { InteractiveItinerary } from "@/components/plan/InteractiveItinerary";

export default function TripPlannerPage() {
  const [city, setCity] = useState("");
  const [days, setDays] = useState(2);
  const [budget, setBudget] = useState("mid");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itineraryData, setItineraryData] = useState<any>(null);

  const toggleInterest = (i: string) =>
    setSelectedInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const [loadingMessage, setLoadingMessage] = useState("");

  const handleGenerate = async () => {
    if (!city) {
      setError("Please select a city first.");
      return;
    }
    
    setLoading(true);
    setShowPlan(false);
    setError(null);
    
    const messages = [
      "Analyzing your interests...",
      "Searching for the best local spots...",
      "Optimizing your travel route...",
      "Curating student guide recommendations...",
      "Finalizing your personalized itinerary..."
    ];

    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      if (msgIdx < messages.length) {
        setLoadingMessage(messages[msgIdx]);
        msgIdx++;
      }
    }, 600);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, days, budget, interests: selectedInterests }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setItineraryData(data);
      setShowPlan(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  };

  const handleRegenerateDay = async (day: number) => {
    try {
      const res = await fetch("/api/plan/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, budget, interests: selectedInterests, day }),
      });
      const data = await res.json();
      if (res.ok) {
        const newItinerary = [...itineraryData.itinerary];
        newItinerary[day - 1] = data.dayPlan;
        setItineraryData({ ...itineraryData, itinerary: newItinerary });
      }
    } catch (err) {
      console.error("Failed to regenerate day", err);
    }
  };

  return (
    <main className="min-h-screen flex flex-col pt-16 bg-gray-50 dark:bg-black">
      <Navbar />

      {/* Header */}
      <section className="py-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8"
          >
            <Sparkles className="w-4 h-4" /> AI-Powered Experience Designer
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-none">Your Dream Trip, <br /><span className="text-primary">Curated by AI.</span></h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">Tell us where you're headed and what you love. We'll handle the rest—from local spots to student guides.</p>
        </div>
      </section>

      {/* Planner Form */}
      <section className="py-12 flex-1">
        <div className="max-w-4xl mx-auto px-4 space-y-12">

          {!showPlan && (
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 border border-gray-100 dark:border-gray-800 shadow-sm space-y-10">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-bold">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              {/* City Selection */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Which city are you visiting?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cities.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCity(c)}
                      className={`px-4 py-4 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all ${city === c ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10" : "border-gray-50 dark:border-gray-800 hover:border-primary/30"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Days Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Duration: <span className="text-secondary dark:text-white">{days} days</span></label>
                  <div className="px-2">
                    <input
                      type="range" min={1} max={7} value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-black text-gray-300 mt-4 uppercase">
                      <span>1 day</span><span>7 days</span>
                    </div>
                  </div>
                </div>

                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Budget Level</label>
                   <div className="flex gap-2">
                      {["budget", "mid", "luxury"].map((b) => (
                        <button
                          key={b}
                          onClick={() => setBudget(b)}
                          className={`flex-1 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${budget === b ? "border-secondary bg-secondary/5 text-secondary" : "border-gray-50 dark:border-gray-800 hover:border-secondary/30"}`}
                        >
                          {b}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              {/* Interests Selection */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Your Interests</label>
                <div className="flex flex-wrap gap-2">
                  {interests.map((i) => (
                    <button
                      key={i}
                      onClick={() => toggleInterest(i)}
                      className={`px-6 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${selectedInterests.includes(i) ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" : "border-gray-50 dark:border-gray-800 hover:border-primary/30 text-gray-400"}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!city || loading}
                className="w-full h-20 text-xl font-black uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-primary/20 flex flex-col items-center justify-center gap-1 disabled:opacity-50 overflow-hidden"
              >
                {loading ? (
                  <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-3">
                      <RotateCw className="w-6 h-6 animate-spin" />
                      <span>Designing...</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest opacity-60 font-black mt-1">{loadingMessage}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6" /> 
                    <span>Generate Experience</span>
                  </div>
                )}
              </Button>
            </div>
          )}

          {/* Generated Plan (Interactive) */}
          <AnimatePresence>
            {showPlan && itineraryData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <InteractiveItinerary 
                  initialData={itineraryData} 
                  onRegenerateDay={handleRegenerateDay}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </main>
  );
}
