import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const completedBookings = await prisma.booking.findMany({
      where: { status: "COMPLETED" },
      select: { totalPrice: true, createdAt: true }
    });

    // Group by date for chart
    const revenueByDate: Record<string, number> = {};
    completedBookings.forEach(b => {
      const date = b.createdAt.toISOString().split('T')[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + b.totalPrice;
    });

    const chartData = Object.entries(revenueByDate).map(([date, amount]) => ({
      date,
      revenue: amount,
      commission: amount * 0.15 // 15% Platform commission
    })).sort((a, b) => a.date.localeCompare(b.date));

    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    return NextResponse.json({
      totalRevenue,
      platformCommission: totalRevenue * 0.15,
      chartData
    });
  } catch (error) {
    console.error("Revenue API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
