import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch flagged entities
    const flaggedUsers = await prisma.user.findMany({
      where: { isFlagged: true },
      select: { id: true, name: true, email: true, flagReason: true }
    });

    const flaggedGuides = await prisma.guideProfile.findMany({
      where: { isFlagged: true },
      include: { user: { select: { name: true, email: true } } }
    });

    // 2. Simple Fraud Detection Patterns
    // A. Abnormal pricing (Guide price > 5000/hr)
    const highPriceGuides = await prisma.guideProfile.findMany({
      where: { pricePerHour: { gt: 5000 } },
      include: { user: { select: { name: true } } }
    });

    // B. Spam bookings (Same traveler > 3 bookings in 1 hour - simplified check)
    // For demo, we just return empty or mock patterns
    
    return NextResponse.json({
      flaggedUsers,
      flaggedGuides,
      alerts: [
        ...highPriceGuides.map(g => ({
          type: "WARNING",
          message: `Abnormal pricing detected for ${g.user.name}: ₹${g.pricePerHour}/hr`,
          entityId: g.id
        }))
      ]
    });
  } catch (error) {
    console.error("Fraud API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { targetId, targetType, isFlagged, flagReason } = await req.json();

        if (targetType === "USER") {
            await prisma.user.update({
                where: { id: targetId },
                data: { isFlagged, flagReason }
            });
        } else {
            await prisma.guideProfile.update({
                where: { id: targetId },
                data: { isFlagged, flagReason }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update flag status" }, { status: 500 });
    }
}
