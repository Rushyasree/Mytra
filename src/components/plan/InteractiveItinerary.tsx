"use client";

import { useState } from "react";
import { 
  Sparkles, MapPin, Clock, IndianRupee, Utensils, 
  Compass, Hotel, AlertCircle, Star, Edit3, Trash2, 
  RotateCw, Plus, Check, ChevronDown, ChevronUp, Zap
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  initialData: any;
  onRegenerateDay: (day: number) => Promise<void>;
}

export function InteractiveItinerary({ initialData, onRegenerateDay }: Props) {
  const [itinerary, setItinerary] = useState(initialData.itinerary);
  const [editingItem, setEditingItem] = useState<{day: number, idx: number} | null>(null);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);

  const removeItem = (dayIdx: number, itemIdx: number) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIdx].items.splice(itemIdx, 1);
    setItinerary(newItinerary);
  };

  const updateItem = (dayIdx: number, itemIdx: number, field: string, value: string) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIdx].items[itemIdx][field] = value;
    setItinerary(newItinerary);
  };

  const handleRegenerate = async (day: number) => {
    setRegeneratingDay(day);
    await onRegenerateDay(day);
    setRegeneratingDay(null);
  };

  return (
    <div className="space-y-12">
      {/* Header Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
              <Sparkles className="w-8 h-8" />
           </div>
           <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Your {initialData.city} Adventure</h2>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{itinerary.length} Days • Custom Curated</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="text-right mr-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Total Cost</p>
              <p className="text-2xl font-black text-primary tracking-tighter">₹{initialData.estimatedTotal.toLocaleString()}</p>
           </div>
           <Button className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 gap-2">
              <Zap className="w-4 h-4 fill-current" /> Book This Plan
           </Button>
        </div>
      </div>

      {/* Itinerary Days */}
      <div className="space-y-10">
        {itinerary.map((day: any, dIdx: number) => (
          <div key={day.day} className="relative">
             {/* Day Header */}
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center font-black text-xl shadow-lg shadow-secondary/20">
                   {day.day}
                </div>
                <div className="flex-1">
                   <h3 className="text-xl font-black tracking-tight">{day.title}</h3>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{initialData.city}</p>
                </div>
                <button 
                  onClick={() => handleRegenerate(day.day)}
                  disabled={regeneratingDay === day.day}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                   <RotateCw className={`w-3 h-3 ${regeneratingDay === day.day ? "animate-spin" : ""}`} /> Regenerate Day
                </button>
             </div>

             {/* Day Items */}
             <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-50 dark:divide-gray-800">
                {day.items.map((item: any, iIdx: number) => (
                  <div key={iIdx} className="group p-8 flex flex-col md:flex-row gap-6 items-start hover:bg-gray-50/50 dark:hover:bg-black/50 transition-colors">
                     <div className="w-24 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Time</span>
                        <span className="text-sm font-black text-secondary dark:text-white">{item.time}</span>
                     </div>
                     
                     <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
                        {iIdx === 0 ? <Compass className="w-5 h-5 text-primary" /> : iIdx === 1 ? <MapPin className="w-5 h-5 text-secondary" /> : <Utensils className="w-5 h-5 text-accent" />}
                     </div>

                     <div className="flex-1 space-y-1">
                        {editingItem?.day === day.day && editingItem?.idx === iIdx ? (
                          <input 
                            autoFocus
                            className="text-lg font-black bg-white border border-primary/20 rounded-lg px-2 py-1 w-full outline-none"
                            value={item.activity}
                            onChange={(e) => updateItem(dIdx, iIdx, "activity", e.target.value)}
                            onBlur={() => setEditingItem(null)}
                          />
                        ) : (
                          <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
                             {item.activity}
                             <button onClick={() => setEditingItem({day: day.day, idx: iIdx})} className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-primary transition-all">
                                <Edit3 className="w-3 h-3" />
                             </button>
                          </h4>
                        )}
                        <p className="text-sm text-gray-500 font-medium">{item.note}</p>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                           <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-1 rounded-md uppercase tracking-widest">₹{item.price}</span>
                           <button onClick={() => removeItem(dIdx, iIdx)} className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-1">
                              <Trash2 className="w-3 h-3" /> Remove
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
                
                {/* Add Custom Item */}
                <button className="w-full p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-black transition-all flex items-center justify-center gap-2">
                   <Plus className="w-4 h-4" /> Add Custom Activity
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Recommended Guides */}
      <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-2xl font-black tracking-tight uppercase">Top Student Guides for this route</h3>
           <Link href="/guides" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All Guides</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {initialData.guides.map((guide: any) => (
             <div key={guide.id} className="p-6 bg-gray-50 dark:bg-black rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center group hover:scale-[1.02] transition-transform">
                <div className="relative mb-4">
                   <img src={guide.user.image || ""} className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-md object-cover" alt="" />
                   <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                      <Zap className="w-4 h-4 fill-current" />
                   </div>
                </div>
                <p className="font-black text-secondary dark:text-white mb-1">{guide.user.name}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{guide.university}</p>
                <div className="flex items-center gap-1 text-yellow-500 text-xs mb-6 bg-yellow-50 px-3 py-1 rounded-full font-black">
                   <Star className="w-3 h-3 fill-current" /> {guide.rating}
                </div>
                <div className="w-full space-y-2">
                   <Link href={`/guides/${guide.id}`} className="block">
                      <Button className="w-full rounded-2xl h-10 font-black text-[10px] uppercase tracking-widest">Book Guide</Button>
                   </Link>
                   <Button variant="outline" size="sm" className="w-full rounded-2xl h-10 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Profile</Button>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
