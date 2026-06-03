import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!["APPROVED", "REJECTED", "PENDING_APPROVAL", "SUSPENDED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedGuide = await prisma.guideProfile.update({
      where: { id },
      data: { 
        status,
        isVerified: status === "APPROVED" // Auto-verify if approved
      },
    });

    // Notify user (In a real app, send email)
    await prisma.notification.create({
      data: {
        userId: updatedGuide.userId,
        title: `Guide Status: ${status}`,
        message: status === "APPROVED" 
          ? "Congratulations! Your guide profile has been approved." 
          : "Your guide profile application was reviewed and rejected.",
        type: "INFO"
      }
    });

    return NextResponse.json(updatedGuide);
  } catch (error) {
    console.error("Error updating guide status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
