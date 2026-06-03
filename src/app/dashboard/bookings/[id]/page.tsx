import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { BookingStatusButtons } from "@/components/ui/BookingStatusButtons";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      guide: true,
      traveler: true,
      payments: true,
      availability: true,
    },
  });

  if (!booking) notFound();

  const role = (session.user as { role?: string }).role;
  const canView =
    role === "ADMIN" ||
    booking.travelerId === session.user.id ||
    booking.guideId === session.user.id;

  if (!canView) notFound();

  const isTraveler = booking.travelerId === session.user.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booking</p>
          <h1 className="text-3xl font-black tracking-tight">{booking.id.slice(0, 8).toUpperCase()}</h1>
        </div>
        <span className="rounded-full bg-primary/10 text-primary px-4 py-2 text-xs font-black uppercase tracking-widest">
          {booking.status}
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Traveler</p>
            <p className="font-black">{booking.traveler.name || booking.traveler.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Guide</p>
            <p className="font-black">{booking.guide.name || booking.guide.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date & Time</p>
            <p className="font-black">
              {new Date(booking.date).toLocaleDateString()} · {booking.startTime || "TBD"}-{booking.endTime || "TBD"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Travelers</p>
            <p className="font-black">{booking.travelersCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-black">Rs {booking.totalPrice.toLocaleString("en-IN")} {booking.currency}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment</p>
            <p className="font-black">{booking.payments[0]?.status || "INITIATED"}</p>
          </div>
        </div>

        {booking.notes && (
          <div className="mt-6 rounded-2xl bg-gray-50 dark:bg-black p-4">
            <p className="text-sm text-gray-500 mb-1">Notes</p>
            <p className="text-sm">{booking.notes}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {isTraveler && (booking.status === "PENDING" || booking.status === "CONFIRMED") && (
          <BookingStatusButtons bookingId={booking.id} currentStatus={booking.status} mode="traveler" />
        )}
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-xl">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
