"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Star, IndianRupee, Heart, ShieldCheck, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Filters {
  q: string;
  city: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
  gender: string;
  interests: string[];
}

interface Props {
  onFilterChange: (filters: Filters) => void;
  activeFilters: Filters;
}

export function GuideFilterSidebar({ onFilterChange, activeFilters }: Props) {
  const [localFilters, setLocalFilters] = useState<Filters>(activeFilters);

  const interestOptions = ["Food", "Heritage", "Nightlife", "Shopping", "Adventure", "Culture"];

  const handleChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleInterest = (interest: string) => {
    const newInterests = localFilters.interests.includes(interest)
      ? localFilters.interests.filter(i => i !== interest)
      : [...localFilters.interests, interest];
    handleChange("interests", newInterests);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Search Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Find Your Guide</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search name or university..." 
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-black border border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-medium"
            value={localFilters.q}
            onChange={(e) => handleChange("q", e.target.value)}
          />
        </div>
      </div>

      {/* Safety & Gender (PREMIUM) */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gender Filter</h3>
            <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified Safety</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["all", "male", "female"].map((g) => (
              <button
                key={g}
                onClick={() => handleChange("gender", g)}
                className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  localFilters.gender === g 
                    ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20" 
                    : "bg-gray-50 dark:bg-black border-transparent text-gray-400 hover:bg-gray-100"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-50 dark:border-gray-800">
          <div className="flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-sm font-black text-secondary dark:text-white">Female Only</span>
                <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Safe for Solo Travelers
                </span>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={localFilters.gender === "female"}
                  onChange={(e) => handleChange("gender", e.target.checked ? "female" : "all")}
                />
                <div className="w-11 h-6 bg-gray-100 peer-focus:outline-none rounded-full peer dark:bg-gray-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500 shadow-inner"></div>
             </label>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Location</h3>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Enter city..." 
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-black border border-transparent focus:border-primary/30 outline-none text-sm font-medium"
            value={localFilters.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </div>
      </div>

      {/* Price */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hourly Rate</h3>
          <span className="text-xs font-black text-primary">₹{localFilters.minPrice} – ₹{localFilters.maxPrice}</span>
        </div>
        <input 
          type="range" 
          min="500" 
          max="5000" 
          step="100"
          value={localFilters.maxPrice}
          onChange={(e) => handleChange("maxPrice", parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between mt-2">
           <span className="text-[8px] font-black text-gray-300">₹500</span>
           <span className="text-[8px] font-black text-gray-300">₹5,000+</span>
        </div>
      </div>

      {/* Interests */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((interest) => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                localFilters.interests.includes(interest)
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-gray-50 dark:bg-black text-gray-400 hover:text-secondary"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={() => {
          const reset = { q: "", city: "", minPrice: 0, maxPrice: 5000, rating: 0, gender: "all", interests: [] };
          setLocalFilters(reset);
          onFilterChange(reset);
        }}
        className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <X className="w-3 h-3" /> Reset All Filters
      </button>
    </div>
  );
}
