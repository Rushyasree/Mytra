import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GuideApplicationForm } from "./GuideApplicationForm";

export default async function GuideProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  if ((session.user as { role?: string }).role !== "GUIDE") {
    redirect("/dashboard");
  }

  const [user, cities] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { guideProfile: { include: { city: true } } },
    }),
    prisma.city.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, state: true },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Guide Application</h1>
        <p className="mt-2 text-gray-500">
          Complete your profile so the Mytra admin team can review and approve your guide account.
        </p>
      </div>

      <GuideApplicationForm
        cities={cities}
        initialProfile={{
          status: user.guideProfile?.status ?? "PENDING_APPROVAL",
          city: user.guideProfile?.city?.name ?? "",
          bio: user.guideProfile?.bio ?? "",
          languages: user.guideProfile?.languages ?? "",
          interests: user.guideProfile?.interests ?? "",
          hourlyRate: user.guideProfile?.pricePerHour ?? 1000,
          university: user.guideProfile?.university ?? "",
          studentId: user.guideProfile?.studentId ?? "",
          governmentId: user.guideProfile?.governmentId ?? "",
          emergencyContact: user.guideProfile?.emergencyContact ?? "",
          availability: user.guideProfile?.availabilityNote ?? "",
        }}
      />
    </div>
  );
}
