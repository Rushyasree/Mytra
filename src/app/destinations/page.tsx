import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function DestinationsPage() {
  const cities = await prisma.city.findMany({
    include: {
      _count: {
        select: { guides: true, experiences: true }
      }
    }
  });

  return (
    <main className="min-h-screen flex flex-col pt-16 bg-gray-50 dark:bg-black">
      <Navbar />
      
      <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover India</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Choose your next destination and find the perfect local friend to guide you.
          </p>
        </div>
      </section>

      <section className="py-16 flex-1">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {cities.map((city) => (
              <Link href={`/destinations/${city.id}`} key={city.id} className="group relative rounded-3xl overflow-hidden h-80 shadow-md hover:shadow-xl transition-all cursor-pointer bg-white dark:bg-gray-800">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${city.image}')` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-2xl font-bold text-white mb-2">{city.name}</h3>
                  <div className="flex gap-4 text-sm text-gray-300 font-medium">
                    <span>{city._count.guides} Guides</span>
                    <span>{city._count.experiences} Experiences</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
