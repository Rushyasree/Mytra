import { auth } from "@/auth";
import { ChatWindow } from "@/components/ui/ChatWindow";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { bookingId } = await searchParams;

  if (!bookingId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-2xl font-bold mb-2">No Conversation Selected</h1>
        <p className="text-gray-500 mb-6">Select a booking from your dashboard to start chatting.</p>
        <Link href="/dashboard" className="text-primary font-bold hover:underline">
          Go back to Dashboard
        </Link>
      </div>
    );
  }

  // Fetch booking details to show in header
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      traveler: true,
      guide: true,
    }
  });

  if (!booking) {
    return <div>Booking not found.</div>;
  }

  // Authorization check
  if (booking.travelerId !== session.user.id && booking.guideId !== session.user.id) {
    return <div>Unauthorized access to this chat.</div>;
  }

  const otherUser = session.user.id === booking.travelerId ? booking.guide : booking.traveler;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Chat with {otherUser.name}</h1>
          <p className="text-sm text-gray-500">Regarding trip on {new Date(booking.date).toLocaleDateString()}</p>
        </div>
      </div>

      <ChatWindow bookingId={bookingId} currentUserId={session.user.id} />
    </div>
  );
}
