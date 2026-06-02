"use client";

import { useState, useEffect } from "react";
import { BookOpen, Calendar, Clock, IndianRupee, Tag } from "lucide-react";

interface BookingData {
  id: string;
  traveler: { name: string; email: string };
  guide: { name: string; email: string };
  date: string;
  duration: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/admin/bookings");
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">Platform Bookings</h1>
          <p className="text-gray-500 mt-1">Real-time oversight of all travel activities.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction ID</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Participants</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Schedule</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Financials</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Booking Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full w-24" /></td>
                    <td className="px-8 py-6"><div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg w-48" /></td>
                    <td className="px-8 py-6"><div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg w-40" /></td>
                    <td className="px-8 py-6"><div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full w-20" /></td>
                    <td className="px-8 py-6"><div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full w-24" /></td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-bold">No bookings recorded yet.</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 dark:hover:bg-black/50 transition-colors group">
                    <td className="px-8 py-5 text-xs font-mono text-gray-300 group-hover:text-gray-500">
                      #{booking.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-2">
                        <div className="text-sm font-black flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          {booking.traveler.name}
                        </div>
                        <div className="text-sm font-black flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                          {booking.guide.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-xs space-y-1.5 text-gray-500 font-semibold">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          {new Date(booking.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          {booking.duration} hours
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-black text-secondary dark:text-white">
                      ₹{booking.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        booking.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 
                        booking.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-600' : 
                        booking.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
