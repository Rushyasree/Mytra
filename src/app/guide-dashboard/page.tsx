import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { BookingStatusButtons } from "@/components/ui/BookingStatusButtons";
import { Button } from "@/components/ui/Button";
import { IndianRupee, Calendar, Star, Users, TrendingUp, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function GuideDashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      guideProfile: {
        include: {
          city: true,
        }
      },
      guideBookings: {
        include: {
          traveler: true,
        },
        orderBy: { date: "asc" },
      },
      reviews: true,
    },
  });

  if (!user || !user.guideProfile) {
    redirect("/dashboard"); // Not a guide, go to traveler dashboard
  }

  const pendingBookings = user.guideBookings.filter(b => b.status === "PENDING");
  const confirmedBookings = user.guideBookings.filter(b => b.status === "CONFIRMED");
  const totalEarnings = user.guideBookings
    .filter(b => b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const isApproved = user.guideProfile.status === "APPROVED";

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 py-8 relative">
      {!isApproved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 dark:bg-black/60 backdrop-blur-md">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 p-10 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800 text-center space-y-6">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto text-yellow-600">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Pending Approval</h2>
            <p className="text-gray-500">
              Your guide profile is currently being reviewed by our admin team. This usually takes 24-48 hours.
            </p>
            <div className="pt-4 flex flex-col gap-3">
               <Link href="/guide-dashboard/profile">
                 <Button className="w-full h-12 rounded-2xl">Complete Your Profile</Button>
               </Link>
               <Link href="/">
                 <Button variant="outline" className="w-full h-12 rounded-2xl">Back to Home</Button>
               </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Guide Dashboard 🎓</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome back, {user.name}! You have {pendingBookings.length} new booking requests.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/guide-dashboard/profile">
            <Button variant="outline" className="rounded-full">Edit Profile</Button>
          </Link>
          <Link href="/guide-dashboard/availability">
            <Button className="rounded-full shadow-lg shadow-primary/20">Manage Availability</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: IndianRupee, label: "Total Earnings", value: `₹${totalEarnings.toLocaleString('en-IN')}`, color: "primary", delta: "From completed trips" },
          { icon: Calendar, label: "Confirmed", value: confirmedBookings.length.toString(), color: "accent", delta: "Upcoming trips" },
          { icon: Star, label: "Avg. Rating", value: `${user.guideProfile.rating} ★`, color: "yellow-500", delta: `From ${user.reviews.length} reviews` },
          { icon: Users, label: "Total Travelers", value: user.guideBookings.length.toString(), color: "secondary", delta: "Lifetime connections" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <stat.icon className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-extrabold mb-1">{stat.value}</p>
            <p className="text-xs text-accent font-medium">{stat.delta}</p>
          </div>
        ))}
      </div>

      {/* Booking Requests */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> New Booking Requests
        </h2>
        <div className="space-y-4">
          {pendingBookings.length > 0 ? (
            pendingBookings.map((req) => (
              <div key={req.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-50 dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800">
                <img src={req.traveler.image || `https://ui-avatars.com/api/?name=${req.traveler.name}`} alt={req.traveler.name || ""} className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow" />
                <div className="flex-1">
                  <p className="font-bold text-lg">{req.traveler.name}</p>
                  <p className="text-sm text-gray-500">
                    📅 {new Date(req.date).toLocaleDateString()} &nbsp;•&nbsp; ⏱ {req.duration} hrs &nbsp;•&nbsp; <span className="font-bold text-primary">₹{req.totalPrice.toLocaleString('en-IN')}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <BookingStatusButtons bookingId={req.id} currentStatus={req.status} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-8 text-gray-500">No new requests. Good time to update your availability!</p>
          )}
        </div>
      </div>

      {/* Confirmed Trips */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" /> Upcoming Confirmed Trips
        </h2>
        <div className="space-y-4">
          {confirmedBookings.length > 0 ? (
            confirmedBookings.map((trip) => (
              <div key={trip.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-50 dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex-1">
                  <p className="font-bold text-lg">{trip.traveler.name}</p>
                  <p className="text-sm text-gray-500">
                    📅 {new Date(trip.date).toLocaleDateString()} &nbsp;•&nbsp; ⏱ {trip.duration} hrs
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/dashboard/messages?bookingId=${trip.id}`}>
                    <Button size="sm" variant="outline" className="rounded-lg">Message Traveler</Button>
                  </Link>
                  <BookingStatusButtons bookingId={trip.id} currentStatus={trip.status} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-8 text-gray-500">No confirmed trips yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

