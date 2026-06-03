import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";
import { safeString } from "@/lib/validation";

const actionToStatus: Record<string, string> = {
  APPROVE: "APPROVED",
  REJECT: "REJECTED",
  SUSPEND: "SUSPENDED",
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const action = safeString((await req.json()).action).toUpperCase();
    const status = actionToStatus[action];

    if (!status) {
      return NextResponse.json({ error: "Invalid guide approval action." }, { status: 400 });
    }

    const updatedGuide = await prisma.guideProfile.update({
      where: { id },
      data: {
        status,
        isVerified: status === "APPROVED",
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: updatedGuide.userId,
        title: `Guide application ${status.toLowerCase().replace("_", " ")}`,
        message:
          status === "APPROVED"
            ? "Congratulations! Your guide profile has been approved."
            : `Your guide profile status is now ${status}.`,
        type: "INFO",
      },
    });

    return NextResponse.json(updatedGuide);
  } catch (error) {
    console.error("Guide approval error:", error);
    return NextResponse.json({ error: "Could not update guide approval." }, { status: 500 });
  }
}
