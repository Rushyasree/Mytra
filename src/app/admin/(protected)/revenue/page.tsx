"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { IndianRupee, TrendingUp, CreditCard, PieChart as PieChartIcon, ArrowUpRight } from "lucide-react";

export default function AdminRevenuePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch("/api/admin/revenue");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading revenue data...</div>;

  const stats = [
    { label: "Total Platform Revenue", value: `₹${data.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
    { label: "Platform Commission (15%)", value: `₹${data.platformCommission.toLocaleString()}`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Payouts to Guides", value: `₹${(data.totalRevenue - data.platformCommission).toLocaleString()}`, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">Revenue Control</h1>
          <p className="text-gray-500 mt-1">Monitor platform volume and commission earnings.</p>
        </div>
        <div className="bg-primary/5 px-6 py-4 rounded-[2rem] border border-primary/10 flex items-center gap-4">
           <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <IndianRupee className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs font-black text-primary uppercase tracking-widest">Total Volume</p>
              <p className="text-2xl font-black text-secondary dark:text-white">₹{data.totalRevenue.toLocaleString()}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4`}>
              <s.icon className={`w-6 h-6 ${s.color}`} />
            </div>
            <p className="text-sm font-semibold text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black">Revenue Timeline</h2>
            </div>
            <span className="text-xs font-black text-green-500 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Growth +12%
            </span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#FF7A00" strokeWidth={4} dot={{ r: 4, fill: '#FF7A00', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="commission" stroke="#0A3D62" strokeWidth={2} strokeDasharray="8 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black">Platform Earnings</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="commission" fill="#0A3D62" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
