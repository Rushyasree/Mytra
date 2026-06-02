"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { Button } from "./Button";
import { useRouter } from "next/navigation";

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/cities/search?q=${query}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCities, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (city: any) => {
    setQuery(`${city.name}, ${city.state}`);
    setIsOpen(false);
    router.push(`/city/${city.slug}`);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto" ref={dropdownRef}>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Where do you want to go?"
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-0 focus:ring-2 focus:ring-primary outline-none text-sm font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
          )}
          {query && !loading && (
            <button 
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
                <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
        <input type="date" className="sm:w-40 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-0 focus:ring-2 focus:ring-primary outline-none text-sm" />
        <Button size="lg" className="h-12 px-8 rounded-xl shadow-lg shadow-primary/30 whitespace-nowrap">
          Search
        </Button>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2">
            {results.map((city) => (
              <button
                key={city.id}
                onClick={() => handleSelect(city)}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left group"
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-primary/10 transition-colors">
                  <MapPin className="w-4 h-4 text-gray-500 group-hover:text-primary" />
                </div>
                <div>
                  <div className="font-bold text-sm">{city.name}</div>
                  <div className="text-xs text-gray-500">{city.state} • {city.category}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results State */}
      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 text-center z-50">
          <div className="text-gray-400 mb-2">📍</div>
          <div className="font-bold text-sm mb-1">City not supported yet</div>
          <div className="text-xs text-gray-500">We're expanding fast! Try Delhi or Mumbai.</div>
        </div>
      )}
    </div>
  );
}
