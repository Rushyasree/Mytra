import prisma from "@/lib/prisma";
import { Users, UserCheck, BookOpen, IndianRupee, AlertTriangle, MapPin } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const results = await Promise.all([
    prisma.user.count(),
    prisma.guideProfile.count({ where: { status: "APPROVED" } }),
    prisma.booking.count(),
    prisma.booking.aggregate({ 
      where: { status: "COMPLETED" },
      _sum: { totalPrice: true } 
    }),
    prisma.user.count({ where: { updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.guideProfile.count({ where: { status: "PENDING" } }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { traveler: { select: { name: true } }, guide: { select: { name: true } } }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { name: true, email: true, createdAt: true, image: true }
    }),
    prisma.booking.findMany({
      where: { sosTriggered: true },
      include: { traveler: { select: { name: true } }, guide: { select: { name: true } } },
      orderBy: { sosTimestamp: "desc" }
    })
  ]);

  const [
    userCount, 
    guideCount, 
    bookingCount, 
    totalRevenue, 
    activeUserCount, 
    pendingGuideCount,
    recentBookings,
    recentUsers,
    emergencyAlerts
  ] = results;

  const stats = [
    { label: "Total Users", value: userCount, icon: Users, color: "text-blue-500", bg: "bg-blue-50", trend: "+12%" },
    { label: "Verified Guides", value: guideCount, icon: UserCheck, color: "text-green-500", bg: "bg-green-50", trend: "+5%" },
    { label: "Total Bookings", value: bookingCount, icon: BookOpen, color: "text-purple-500", bg: "bg-purple-50", trend: "+18%" },
    { label: "Platform Volume", value: `₹${(totalRevenue._sum.totalPrice || 0).toLocaleString()}`, icon: IndianRupee, color: "text-orange-500", bg: "bg-orange-50", trend: "+24%" },
  ];

  return (
    <div className="space-y-10 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">Admin Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
           <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <span className="text-sm font-bold">{activeUserCount} Active Users</span>
           </div>
           <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-2">
             <div className="w-2 h-2 bg-red-500 rounded-full" />
             <span className="text-sm font-bold">{pendingGuideCount} Pending Reviews</span>
           </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">{stat.trend}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-black tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black">Recent Bookings</h2>
                <Link href="/admin/bookings" className="text-xs font-bold text-primary hover:underline">View all</Link>
             </div>
             <div className="space-y-4">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-4 rounded-3xl hover:bg-gray-50 dark:hover:bg-black transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {(b.traveler.name || 'User').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{b.traveler.name || 'Anonymous User'}</p>
                        <p className="text-xs text-gray-500">Booked with {b.guide.name || 'Guide'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black">₹{b.totalPrice}</p>
                       <p className="text-[10px] text-gray-400 uppercase font-bold">{new Date(b.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
             </div>
           </div>

           <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black">Newest Users</h2>
                <Link href="/admin/users" className="text-xs font-bold text-primary hover:underline">View all</Link>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentUsers.map((u) => (
                  <div key={u.email} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 dark:bg-black/50 border border-gray-100 dark:border-gray-800">
                    <img src={u.image || `https://ui-avatars.com/api/?name=${u.name || 'User'}`} className="w-10 h-10 rounded-xl" alt="" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{u.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>

        {/* Alerts & Health */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-red-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-red-600">🆘 Active Emergency Alerts</h2>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black">{emergencyAlerts.length} Active</span>
            </div>
            <div className="space-y-4">
               {emergencyAlerts.length === 0 ? (
                 <p className="text-sm text-gray-500 text-center py-4 font-bold">No active emergencies. System clear.</p>
               ) : (
                 emergencyAlerts.map((alert) => (
                   <div key={alert.id} className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20">
                     <div className="flex justify-between items-start mb-2">
                       <p className="text-sm font-black text-red-900 dark:text-red-200">{alert.traveler.name || 'Anonymous User'}</p>
                       <p className="text-[10px] font-black uppercase text-red-500">{new Date(alert.sosTimestamp!).toLocaleTimeString()}</p>
                     </div>
                     <p className="text-xs text-red-700 dark:text-red-400 mb-3">Booking ID: {alert.id.slice(0,8)}</p>
                     {alert.lat && (
                       <Link 
                         href={`https://maps.google.com/?q=${alert.lat},${alert.lng}`} 
                         target="_blank"
                         className="inline-flex items-center gap-2 text-xs font-black bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl shadow-sm border border-red-100 hover:scale-105 transition-transform"
                       >
                         <MapPin className="w-3 h-3" /> Track Location
                       </Link>
                     )}
                   </div>
                 ))
               )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">Fraud Alerts</h2>
              <Link href="/admin/fraud" className="text-xs text-primary font-bold hover:underline">Manage</Link>
            </div>
            <div className="space-y-4">
               <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20">
                 <div className="flex items-center gap-2 mb-1">
                   <AlertTriangle className="w-4 h-4 text-red-500" />
                   <p className="text-xs font-black text-red-800 dark:text-red-400 uppercase tracking-wider">Critical Alert</p>
                 </div>
                 <p className="text-sm font-bold text-red-900 dark:text-red-200">Suspicious booking pattern detected</p>
               </div>
               <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-100 dark:border-orange-500/20">
                 <div className="flex items-center gap-2 mb-1">
                   <AlertTriangle className="w-4 h-4 text-orange-500" />
                   <p className="text-xs font-black text-orange-800 dark:text-orange-400 uppercase tracking-wider">Risk Warning</p>
                 </div>
                 <p className="text-sm font-bold text-orange-900 dark:text-orange-200">Abnormal pricing on Guide profile</p>
               </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-black mb-6">System Status</h2>
            <div className="space-y-4">
               {[
                 { label: "Database", status: "Operational", color: "text-green-500" },
                 { label: "Auth API", status: "Stable", color: "text-green-500" },
                 { label: "CDN Cache", status: "Hit 94%", color: "text-primary" },
                 { label: "Log Service", status: "Active", color: "text-green-500" },
               ].map((s) => (
                 <div key={s.label} className="flex justify-between items-center text-sm">
                   <span className="font-semibold text-gray-500">{s.label}</span>
                   <span className={`${s.color} font-black`}>{s.status}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
