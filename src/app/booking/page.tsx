import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BookingRequestForm } from "./BookingRequestForm";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ guideId?: string; experienceId?: string; cityId?: string }>;
}) {
  const { guideId, experienceId, cityId } = await searchParams;

  if (!guideId && !experienceId) {
    notFound();
  }

  const experience = experienceId
    ? await prisma.experience.findUnique({
        where: { id: experienceId },
        include: { city: true },
      })
    : null;

  if (experienceId && !experience) {
    notFound();
  }

  const resolvedCityId = cityId || experience?.cityId;

  const selectedGuide = guideId
    ? await prisma.guideProfile.findFirst({
        where: {
          id: guideId,
          status: "APPROVED",
          isVerified: true,
          bio: { not: null },
          languages: { not: null },
          interests: { not: null },
          pricePerHour: { gt: 0 },
        },
        include: { user: true, city: true },
      })
    : null;

  if (guideId && !selectedGuide) {
    notFound();
  }

  const cityForGuides = resolvedCityId || selectedGuide?.cityId;

  if (!cityForGuides) {
    notFound();
  }

  const guides = await prisma.guideProfile.findMany({
    where: {
      cityId: cityForGuides,
      status: "APPROVED",
      isVerified: true,
      bio: { not: null },
      languages: { not: null },
      interests: { not: null },
      pricePerHour: { gt: 0 },
    },
    include: { user: true, city: true },
    orderBy: { rating: "desc" },
  });

  if (guides.length === 0) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col pt-16 bg-gray-50 dark:bg-black">
      <Navbar />
      <section className="py-12 flex-1">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Request a Booking</h1>
            <p className="text-gray-500">
              Choose an approved guide, pick an available slot, and send a booking request. Payment is prepared but not charged yet.
            </p>
          </div>

          <BookingRequestForm
            guides={guides.map((guide) => ({
              id: guide.id,
              userId: guide.userId,
              name: guide.user.name || "Mytra guide",
              image: guide.user.image,
              university: guide.university,
              rating: guide.rating,
              pricePerHour: guide.pricePerHour,
              cityId: guide.cityId || cityForGuides,
              cityName: guide.city?.name || experience?.city.name || "Selected city",
            }))}
            selectedGuideId={selectedGuide?.id || guides[0].id}
            experience={experience ? {
              id: experience.id,
              title: experience.title,
              price: experience.price,
              cityId: experience.cityId,
              cityName: experience.city.name,
            } : null}
          />
        </div>
      </section>
      <Footer />
    </main>
  );
}
