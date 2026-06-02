"use client";

import { useState } from "react";
import { GuideFilterSidebar } from "./GuideFilterSidebar";
import { GuideGrid } from "./GuideGrid";
import { Filter, X } from "lucide-react";

export function GuideExplorer({ initialQuery = "" }) {
  const [filters, setFilters] = useState({
    q: initialQuery,
    city: "",
    minPrice: 0,
    maxPrice: 5000,
    rating: 0,
    gender: "all",
    interests: [] as string[],
  });

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter chips
  const activeChips = [];
  if (filters.gender === "female") activeChips.push({ label: "Female Guides Only", key: "gender", value: "all" });
  if (filters.city) activeChips.push({ label: `City: ${filters.city}`, key: "city", value: "" });
  if (filters.rating > 0) activeChips.push({ label: `${filters.rating}+ Rating`, key: "rating", value: 0 });
  filters.interests.forEach(i => activeChips.push({ label: i, key: "interests", value: i }));

  const removeChip = (key: string, value: any) => {
    if (key === "interests") {
      setFilters({ ...filters, interests: filters.interests.filter(i => i !== value) });
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:block w-80 shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-4 scrollbar-hide">
          <GuideFilterSidebar onFilterChange={setFilters} activeFilters={filters} />
        </aside>

        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 w-full py-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm font-black uppercase tracking-widest text-xs"
        >
          <Filter className="w-4 h-4" /> Filters & Safety
        </button>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Active Filter Chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active:</span>
              {activeChips.map((chip, i) => (
                <div key={i} className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 text-secondary dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary/30 transition-all">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {chip.label}
                  <button 
                    onClick={() => removeChip(chip.key, chip.value)}
                    className="ml-1 p-1 hover:bg-gray-50 dark:hover:bg-black rounded-lg transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400 group-hover:text-red-500" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setFilters({ q: "", city: "", minPrice: 0, maxPrice: 5000, rating: 0, gender: "all", interests: [] })}
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline px-2"
              >
                Clear all
              </button>
            </div>
          )}

          <GuideGrid filters={filters} />
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-900 p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <GuideFilterSidebar onFilterChange={(f) => { setFilters(f); setIsMobileFilterOpen(false); }} activeFilters={filters} />
          </div>
        </div>
      )}
    </div>
  );
}
