import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit, requireSession } from "@/lib/security";
import { normalizeCsvList, safeString } from "@/lib/validation";

export async function POST(req: Request) {
  const rateLimited = checkRateLimit(req, "guide-apply", 6, 60_000);
  if (rateLimited) return rateLimited;

  const { response, user } = await requireSession();
  if (response) return response;

  if (user.role !== "GUIDE") {
    return NextResponse.json({ error: "Only guide accounts can submit guide applications." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const city = safeString(body.city);
    const bio = safeString(body.bio);
    const languages = normalizeCsvList(body.languages);
    const interests = normalizeCsvList(body.interests);
    const university = safeString(body.university);
    const studentId = safeString(body.studentId);
    const governmentId = safeString(body.governmentId);
    const emergencyContact = safeString(body.emergencyContact);
    const availabilityNote = Array.isArray(body.availability)
      ? normalizeCsvList(body.availability)
      : safeString(body.availability);
    const hourlyRate = Number(body.hourlyRate);

    if (!city || !bio || !languages || !interests || !university || !studentId || !governmentId || !emergencyContact) {
      return NextResponse.json({ error: "Complete all required guide application fields." }, { status: 400 });
    }

    if (!Number.isFinite(hourlyRate) || hourlyRate < 100 || hourlyRate > 10000) {
      return NextResponse.json({ error: "Hourly rate must be between 100 and 10000." }, { status: 400 });
    }

    const cityRecord = await prisma.city.findFirst({
      where: {
        OR: [
          { id: city },
          { name: { contains: city } },
          { slug: city.toLowerCase().replace(/\s+/g, "-") },
        ],
      },
    });

    if (!cityRecord) {
      return NextResponse.json({ error: "Choose a supported city." }, { status: 404 });
    }

    const guideProfile = await prisma.guideProfile.upsert({
      where: { userId: user.id },
      update: {
        cityId: cityRecord.id,
        bio,
        languages,
        interests,
        university,
        studentId,
        governmentId,
        emergencyContact,
        availabilityNote,
        pricePerHour: hourlyRate,
        status: "PENDING_APPROVAL",
        isVerified: false,
      },
      create: {
        userId: user.id,
        cityId: cityRecord.id,
        bio,
        languages,
        interests,
        university,
        studentId,
        governmentId,
        emergencyContact,
        availabilityNote,
        pricePerHour: hourlyRate,
        status: "PENDING_APPROVAL",
      },
      select: {
        id: true,
        status: true,
        city: { select: { name: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Guide application submitted",
        message: "Your guide profile is under review. We will notify you once an admin reviews it.",
        type: "INFO",
      },
    });

    return NextResponse.json({ guideProfile, message: "Guide application submitted for review." });
  } catch (error) {
    console.error("Guide application error:", error);
    return NextResponse.json({ error: "Could not submit guide application." }, { status: 500 });
  }
}
