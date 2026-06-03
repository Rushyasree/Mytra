"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Star, MapPin, Heart, ArrowUpDown, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface GuideGridProps {
  filters: {
    q: string;
    city: string;
    minPrice: number;
    maxPrice: number;
    rating: number;
    gender: string;
    interests: string[];
  };
}

type GuideSearchResult = {
  id: string;
  pricePerHour: number;
  rating: number;
  gender: string;
  isVerified: boolean;
  languages?: string | null;
  bio?: string | null;
  city?: { name?: string | null; image?: string | null } | null;
  user: { name?: string | null; image?: string | null };
  recommendation?: {
    matchScore: number;
    matchReasons: string[];
  };
};

export function GuideGrid({ filters }: GuideGridProps) {
  const [guides, setGuides] = useState<GuideSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recommended");

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          q: filters.q,
          city: filters.city,
          minPrice: String(filters.minPrice),
          maxPrice: String(filters.maxPrice),
          rating: String(filters.rating),
          gender: filters.gender,
          interests: filters.interests.join(","),
        });
        const res = await fetch(`/api/guides/search?${queryParams.toString()}`);
        const data = await res.json();
        setGuides(data.guides || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, [filters]);

  const sortedGuides = [...guides].sort((a, b) => {
    if (sortBy === "price_low") return a.pricePerHour - b.pricePerHour;
    if (sortBy === "price_high") return b.pricePerHour - a.pricePerHour;
    if (sortBy === "recommended") return (b.recommendation?.matchScore || 0) - (a.recommendation?.matchScore || 0);
    return b.rating - a.rating;
  });

  return (
    <div className="space-y-8">
      {/* Top Bar / Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm font-bold text-gray-500">
          Showing <span className="text-secondary dark:text-white font-black">{guides.length}</span> verified local guides
        </p>
        
        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
           <ArrowUpDown className="w-4 h-4 text-gray-400" />
           <select 
             className="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none cursor-pointer"
             value={sortBy}
             onChange={(e) => setSortBy(e.target.value)}
           >
             <option value="recommended">Best Match</option>
             <option value="rating">Top Rated</option>
             <option value="price_low">Price: Low to High</option>
             <option value="price_high">Price: High to Low</option>
           </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 4, 5, 6].map(i => (
             <div key={i} className="h-96 rounded-[2.5rem] bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : guides.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
           <div className="w-16 h-16 bg-gray-50 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-gray-300" />
           </div>
           <h3 className="text-xl font-black mb-2">No matches found</h3>
           <p className="text-gray-500 text-sm max-w-xs mx-auto">Try adjusting your filters or searching for a different city.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sortedGuides.map((guide) => (
            <div key={guide.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 group hover:shadow-xl transition-all">
              <div className="relative h-56 bg-gray-200 dark:bg-black overflow-hidden">
                <img 
                  src={guide.city?.image || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Safety Tags */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {guide.recommendation && (
                    <div className="bg-primary text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg">
                      {guide.recommendation.matchScore}% Match
                    </div>
                  )}
                  {guide.gender === "female" && (
                    <div className="bg-pink-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                      <Heart className="w-3 h-3 fill-current" /> Safe for Solo Females
                    </div>
                  )}
                  {guide.isVerified && (
                    <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-accent shadow-sm">
                      <ShieldCheck className="w-3 h-3" /> Verified Local
                    </div>
                  )}
                </div>

                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <img 
                    src={guide.user.image || `https://ui-avatars.com/api/?name=${guide.user.name}`} 
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/50 shadow-xl" 
                    alt="" 
                  />
                  <div>
                    <h3 className="text-white font-black text-xl leading-none">{guide.user.name}</h3>
                    <p className="text-white/70 text-xs font-bold mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {guide.city?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-black text-secondary dark:text-white">{guide.rating}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-secondary dark:text-white tracking-tighter">₹{guide.pricePerHour}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase ml-1">/hour</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {guide.recommendation?.matchReasons?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {guide.recommendation.matchReasons.map((reason) => (
                        <span key={reason} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-black uppercase text-primary">
                          {reason}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {guide.languages?.split(",").slice(0, 3).map((lang: string) => (
                      <span key={lang} className="px-3 py-1 bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 rounded-xl text-[10px] font-black uppercase text-gray-500">
                        {lang.trim()}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                    {guide.bio}
                  </p>
                </div>

                <div className="mt-8">
                  <Link href={`/guides/${guide.id}`}>
                    <Button className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-xs" variant="outline">
                      View Profile & Reviews
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
