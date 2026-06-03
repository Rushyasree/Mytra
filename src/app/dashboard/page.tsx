import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Compass, Calendar, Star, Clock, MessageSquare, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SafetyPanel } from "@/components/safety/SafetyPanel";
import { LocationShare } from "@/components/safety/LocationShare";
import { BookingStatusButtons } from "@/components/ui/BookingStatusButtons";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // If user is a guide, redirect to guide dashboard
  if ((session.user as any).role === "GUIDE") {
    redirect("/guide-dashboard");
  }

  const userId = session.user.id;

  // Fetch traveler data
  const traveler = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bookings: {
        include: {
          guide: true,
        },
        orderBy: { date: "asc" },
      },
      reviews: true,
      notifications: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!traveler) {
    return <div>User not found.</div>;
  }

  const upcomingBookings = traveler.bookings.filter(
    (b) => new Date(b.date) >= new Date() && b.status !== "CANCELLED"
  );
  const cancelledBookings = traveler.bookings.filter((b) => b.status === "CANCELLED");
  const completedBookings = traveler.bookings.filter((b) => b.status === "COMPLETED");
  
  // Find currently active trip (today)
  const today = new Date();
  const activeTrip = traveler.bookings.find(
    (b) => new Date(b.date).toDateString() === today.toDateString() && b.status === "CONFIRMED"
  );

  const totalTrips = traveler.bookings.length;
  const upcomingCount = upcomingBookings.length;
  const reviewsGiven = traveler.reviews.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Safety SOS (Global on Dashboard if active trip) */}
      {activeTrip && (
        <SafetyPanel 
          bookingId={activeTrip.id} 
          guideName={activeTrip.guide.name || "Guide"} 
          tripDate={new Date(activeTrip.date).toLocaleDateString()}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Welcome back, {traveler.name?.split(" ")[0]}! 👋</h1>
          <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your trips.</p>
        </div>
        <Link href="/guides">
          <Button className="rounded-full shadow-lg shadow-primary/20">Plan New Trip</Button>
        </Link>
      </div>

      {/* SOS Alert Banner if triggered */}
      {activeTrip?.sosTriggered && (
        <div className="bg-red-600 text-white p-6 rounded-[2rem] mb-8 flex items-center justify-between shadow-xl shadow-red-200 animate-pulse">
           <div className="flex items-center gap-4">
              <ShieldAlert className="w-8 h-8" />
              <div>
                 <p className="font-black text-xl uppercase tracking-tighter">Emergency SOS Active</p>
                 <p className="text-sm font-medium opacity-80">Help is on the way. Stay where you are if safe.</p>
              </div>
           </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
            <Compass className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">Total Trips</p>
          <p className="text-3xl font-bold">{totalTrips}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">Upcoming Bookings</p>
          <p className="text-3xl font-bold">{upcomingCount}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 bg-yellow-500/10 text-yellow-600 rounded-2xl flex items-center justify-center mb-4">
            <Star className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">Reviews Given</p>
          <p className="text-3xl font-bold">{reviewsGiven}</p>
        </div>
      </div>

      {/* Upcoming Trip Section */}
      {traveler.notifications.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          <div className="space-y-3">
            {traveler.notifications.map((notification) => (
              <div key={notification.id} className="rounded-2xl bg-gray-50 dark:bg-black p-4">
                <p className="font-bold">{notification.title}</p>
                <p className="text-sm text-gray-500">{notification.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Upcoming Trips</h2>
      <div className="space-y-6">
        {upcomingBookings.length > 0 ? (
          upcomingBookings.map((booking) => (
            <div key={booking.id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 items-center">
              <div className="w-full md:w-48 h-48 rounded-2xl bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80')" }} />
              
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">Trip with {booking.guide.name}</h3>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      booking.status === "CONFIRMED" ? "bg-green-100 text-green-700" : 
                      booking.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {booking.status}
                    </span>
                    {booking.sosTriggered && (
                      <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2 py-1 rounded-lg">SOS ACTIVE</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> {new Date(booking.date).toLocaleDateString()} • {booking.duration} hours
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 flex items-center gap-3 bg-gray-50 dark:bg-black p-4 rounded-2xl border border-gray-100 dark:border-gray-800 w-full">
                    <img src={booking.guide.image || `https://ui-avatars.com/api/?name=${booking.guide.name}`} alt="Guide" className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-bold">{booking.guide.name}</p>
                      <p className="text-[10px] uppercase font-black text-gray-400">Student Guide</p>
                    </div>
                    <Link href={`/dashboard/messages?bookingId=${booking.id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl h-10 gap-2 font-bold text-xs">
                        <MessageSquare className="w-4 h-4" /> Chat
                      </Button>
                    </Link>
                    <Link href={`/dashboard/bookings/${booking.id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl h-10 font-bold text-xs">
                        Details
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Location Share (Only if today) */}
                  {new Date(booking.date).toDateString() === today.toDateString() && (
                    <LocationShare bookingId={booking.id} />
                  )}
                  {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                    <BookingStatusButtons bookingId={booking.id} currentStatus={booking.status} mode="traveler" />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
            <Compass className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No upcoming trips planned yet.</p>
            <Link href="/guides" className="text-primary font-bold hover:underline mt-2 inline-block">
              Start exploring guides →
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Completed Trips</h2>
          {completedBookings.length === 0 ? (
            <p className="text-sm text-gray-500">No completed trips yet.</p>
          ) : (
            <div className="space-y-3">
              {completedBookings.map((booking) => (
                <div key={booking.id} className="rounded-2xl bg-gray-50 dark:bg-black p-4">
                  <p className="font-bold">Trip with {booking.guide.name}</p>
                  <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()} · Rs {booking.totalPrice.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Cancelled Trips</h2>
          {cancelledBookings.length === 0 ? (
            <p className="text-sm text-gray-500">No cancelled trips.</p>
          ) : (
            <div className="space-y-3">
              {cancelledBookings.map((booking) => (
                <div key={booking.id} className="rounded-2xl bg-gray-50 dark:bg-black p-4">
                  <p className="font-bold">Trip with {booking.guide.name}</p>
                  <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()} · Cancelled</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
