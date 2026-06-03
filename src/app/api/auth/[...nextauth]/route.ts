import { handlers } from "@/auth"
import { checkRateLimit } from "@/lib/security"
import { NextRequest } from "next/server"

export const GET = handlers.GET

export async function POST(req: NextRequest) {
  const rateLimited = checkRateLimit(req, "auth", 10, 60_000)
  if (rateLimited) return rateLimited

  return handlers.POST(req)
}
