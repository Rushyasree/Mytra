"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from "recharts";
import { BarChart3, TrendingUp, Users, MapPin, Star } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-8 text-center">Analyzing platform growth...</div>;

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">Platform Analytics</h1>
        <p className="text-gray-500 mt-1">Deep dive into user growth and regional performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black">User Onboarding Trend</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.userGrowth}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FF7A00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="createdAt" hide />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip />
                <Area type="monotone" dataKey="_count" stroke="#FF7A00" fillOpacity={1} fill="url(#colorGrowth)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black">Regional Distribution</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cityAnalytics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Bar dataKey="_count.guides" name="Guides" fill="#FF7A00" radius={[4, 4, 0, 0]} />
                <Bar dataKey="_count.experiences" name="Experiences" fill="#0A3D62" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Guides */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
            <Star className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black">Top Performing Guides</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {data.topGuides.map((g: any) => (
            <div key={g.name} className="p-6 rounded-3xl bg-gray-50/50 dark:bg-black/50 border border-gray-100 dark:border-gray-800 text-center hover:scale-105 transition-transform">
               <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary font-black">
                 {g.name.charAt(0)}
               </div>
               <p className="font-bold text-sm mb-1">{g.name}</p>
               <div className="flex items-center justify-center gap-1 text-yellow-500 font-black text-xs">
                 <Star className="w-3 h-3 fill-current" /> {g.rating}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
