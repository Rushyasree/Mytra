import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AvailabilityManager } from "./AvailabilityManager";

export default async function GuideAvailabilityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if ((session.user as { role?: string }).role !== "GUIDE") redirect("/dashboard");

  const guideProfile = await prisma.guideProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      availability: {
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      },
    },
  });

  if (!guideProfile) redirect("/guide-dashboard/profile");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Manage Availability</h1>
        <p className="mt-2 text-gray-500">
          Publish time slots travelers can request. Booked slots are locked automatically.
        </p>
      </div>

      <AvailabilityManager
        initialSlots={guideProfile.availability.map((slot) => ({
          id: slot.id,
          date: slot.date.toISOString().split("T")[0],
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: slot.isBooked,
        }))}
      />
    </div>
  );
}
