import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/security";
import { isStrongPassword, isValidEmail, safeString } from "@/lib/validation";

const allowedRoles = ["TRAVELER", "GUIDE"] as const;

export async function POST(req: Request) {
  const rateLimited = checkRateLimit(req, "signup", 8, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const body = await req.json();
    const name = safeString(body.name);
    const email = safeString(body.email).toLowerCase();
    const password = safeString(body.password);
    const role = safeString(body.role).toUpperCase();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and include uppercase, lowercase, and a number." },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role as typeof allowedRoles[number])) {
      return NextResponse.json({ error: "Invalid signup role." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        ...(role === "GUIDE"
          ? {
              guideProfile: {
                create: {
                  status: "PENDING_APPROVAL",
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ user, message: "Account created successfully." }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
