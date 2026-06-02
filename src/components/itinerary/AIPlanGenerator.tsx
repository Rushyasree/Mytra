"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Sparkles, X, Calendar, Wallet, Tag, Loader2, ChevronRight, MapPin, User, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DayPlan {
  day: number;
  plan: string;
  places: string[];
  guideSuggestions: string[];
  estimatedCost: number;
}

interface ItineraryResponse {
  days: DayPlan[];
  totalEstimatedCost: number;
  isAiGenerated: boolean;
  city: string;
}

export function AIPlanGenerator({ cityName }: { cityName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(5000);
  const [interests, setInterests] = useState("");
  const [result, setResult] = useState<ItineraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: cityName,
          days,
          budget,
          interests: interests.split(",").map(i => i.trim()).filter(Boolean)
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="rounded-full px-8 py-6 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform shadow-xl flex gap-2 items-center"
      >
        <Sparkles className="w-6 h-6" />
        AI Plan My Trip
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AI Itinerary Planner</h2>
                    <p className="text-sm text-gray-500">Personalized plan for {cityName}</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {!result && (
                  <div className="max-w-xl mx-auto space-y-8 py-8">
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                        <Calendar className="w-4 h-4" /> How many days?
                      </label>
                      <input 
                        type="number" 
                        min="1" max="7"
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value))}
                        className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                        <Wallet className="w-4 h-4" /> What's your budget? (₹)
                      </label>
                      <input 
                        type="number" 
                        step="500"
                        value={budget}
                        onChange={(e) => setBudget(parseInt(e.target.value))}
                        className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                        <Tag className="w-4 h-4" /> Interests (comma separated)
                      </label>
                      <input 
                        type="text" 
                        placeholder="Food, History, Photography, Adventure"
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>

                    <Button 
                      onClick={handleGenerate}
                      disabled={loading}
                      className="w-full py-8 text-xl rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          AI is thinking...
                        </span>
                      ) : "Generate My Itinerary"}
                    </Button>

                    {error && (
                      <p className="text-red-500 text-center font-medium bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
                        {error}
                      </p>
                    )}
                  </div>
                )}

                {result && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-wrap gap-4 items-center justify-between bg-primary/5 p-6 rounded-3xl border border-primary/10">
                      <div>
                        <div className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Estimated Cost</div>
                        <div className="text-3xl font-black">₹{result.totalEstimatedCost.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-500 uppercase">Engine</div>
                          <div className="text-sm font-bold flex items-center gap-1 justify-end">
                            {result.isAiGenerated ? (
                              <><Sparkles className="w-3 h-3 text-accent" /> Gemini 1.5 Flash</>
                            ) : (
                              <><CheckCircle2 className="w-3 h-3 text-green-500" /> Database Fallback</>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setResult(null)} className="rounded-xl">Edit Preferences</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {result.days.map((day) => (
                        <div key={day.day} className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <span className="bg-primary text-white text-xs font-black px-3 py-1 rounded-full">DAY {day.day}</span>
                            <span className="text-sm font-bold text-primary">₹{day.estimatedCost}</span>
                          </div>
                          
                          <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium leading-relaxed">
                            {day.plan}
                          </p>

                          <div className="mt-auto space-y-4">
                            <div>
                              <div className="text-xs font-black text-gray-400 uppercase mb-2 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Places & Experiences
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {day.places.map((place, i) => (
                                  <span key={i} className="text-xs font-bold bg-white dark:bg-gray-700 px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                                    {place}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {day.guideSuggestions.length > 0 && (
                              <div>
                                <div className="text-xs font-black text-gray-400 uppercase mb-2 flex items-center gap-1">
                                  <User className="w-3 h-3" /> Suggested Guides
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {day.guideSuggestions.map((guide, i) => (
                                    <span key={i} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                                      {guide}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {result && (
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                   <Button 
                    className="w-full rounded-2xl py-6 font-bold"
                    onClick={() => {
                      setIsOpen(false);
                      // In a real app, this could scroll to bookings or guides section
                    }}
                   >
                    Book Your Favorite Experiences
                   </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
