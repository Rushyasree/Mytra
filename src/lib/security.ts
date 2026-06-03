import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import type { Booking } from "@prisma/client";
import { NextResponse } from "next/server";

type SessionUser = {
  id?: string;
  role?: string;
};

type AuthenticatedUser = {
  id: string;
  role?: string;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  mytraRateLimit?: Map<string, RateLimitBucket>;
};

const rateLimitStore =
  globalForRateLimit.mytraRateLimit ?? new Map<string, RateLimitBucket>();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.mytraRateLimit = rateLimitStore;
}

export function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    "anonymous"
  );
}

export function checkRateLimit(
  req: Request,
  scope: string,
  limit: number,
  windowMs: number
) {
  const key = `${scope}:${getClientIp(req)}`;
  const now = Date.now();
  const bucket = rateLimitStore.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (bucket.count >= limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((bucket.resetAt - now) / 1000).toString(),
        },
      }
    );
  }

  bucket.count += 1;
  rateLimitStore.set(key, bucket);
  return null;
}

export async function requireSession() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }

  return { response: null, user: user as AuthenticatedUser };
}

export async function requireAdmin() {
  const { response, user } = await requireSession();
  if (response) return { response, user: null };

  if (user?.role !== "ADMIN") {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }

  return { response: null, user };
}

export function canAccessBooking(booking: Booking, user: AuthenticatedUser) {
  return (
    user.role === "ADMIN" ||
    booking.travelerId === user.id ||
    booking.guideId === user.id
  );
}

export async function requireBookingAccess(bookingId: string) {
  const { response, user } = await requireSession();
  if (response) return { response, user: null, booking: null };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return {
      response: NextResponse.json({ error: "Booking not found" }, { status: 404 }),
      user,
      booking: null,
    };
  }

  if (!canAccessBooking(booking, user)) {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      user,
      booking,
    };
  }

  return { response: null, user, booking };
}

const allowedBookingTransitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function validateBookingStatusTransition(current: string, next: string) {
  const allowedStatuses = Object.keys(allowedBookingTransitions);

  if (!allowedStatuses.includes(next)) {
    return `Invalid booking status: ${next}`;
  }

  if (!allowedBookingTransitions[current]?.includes(next)) {
    return `Cannot move booking from ${current} to ${next}`;
  }

  return null;
}
