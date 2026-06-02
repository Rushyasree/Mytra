import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import prisma from "@/lib/prisma";
import { ShieldCheck, Star, MapPin, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AIPlanGenerator } from "@/components/itinerary/AIPlanGenerator";

export default async function CityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const city = await prisma.city.findUnique({
    where: { slug },
    include: {
      guides: {
        where: { status: 'APPROVED' },
        include: { user: true }
      },
      experiences: true
    }
  });

  if (!city) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col pt-16 bg-gray-50 dark:bg-black">
      <Navbar />

      {/* Hero Header */}
      <section className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${city.image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="max-w-3xl flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">{city.name}</h1>
            <p className="text-xl text-gray-200 font-medium drop-shadow-md mb-8">{city.state}, India</p>
            <AIPlanGenerator cityName={city.name} />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">
        
        {/* City Overview */}
        <section className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800">
            <div className="max-w-3xl">
                <h2 className="text-3xl font-bold mb-4">About {city.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                    {city.description || `Discover the beauty and culture of ${city.name}, ${city.state}. Mytra connects you with verified local student guides to experience this city like a local friend.`}
                </p>
            </div>
        </section>

        {/* Guides Section */}
        <section>
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Verified Student Guides in {city.name}</h2>
              <p className="text-gray-500">Connecting you with the best local students for an authentic experience.</p>
            </div>
            <Link href={`/guides?city=${city.name}`} className="text-primary font-bold hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {city.guides.map((guide) => (
              <div key={guide.id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img 
                      src={guide.user.image || ""} 
                      alt={guide.user.name || ""} 
                      className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                    />
                    {guide.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-1 shadow-md">
                        <ShieldCheck className="w-5 h-5 text-accent" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{guide.user.name}</h3>
                    <p className="text-sm text-primary font-semibold">{guide.university}</p>
                    <div className="flex items-center gap-1 text-yellow-500 mt-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{guide.rating}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                  {guide.bio}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                  <div className="text-lg font-bold">₹{guide.pricePerHour.toLocaleString('en-IN')}<span className="text-sm text-gray-500 font-normal">/hr</span></div>
                  <Link href={`/guides/${guide.id}`}>
                    <Button variant="outline" className="rounded-xl px-6">View Profile</Button>
                  </Link>
                </div>
              </div>
            ))}
            {city.guides.length === 0 && (
              <div className="col-span-full py-12 text-center bg-gray-100 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-500">No guides found in this city yet. We're expanding fast!</p>
              </div>
            )}
          </div>
        </section>

        {/* Experiences Section */}
        <section>
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Curated {city.name} Experiences</h2>
              <p className="text-gray-500">Discover hidden gems and local favorites through these unique tours.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {city.experiences.map((exp) => (
              <div key={exp.id} className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all group">
                <div className="h-48 overflow-hidden relative">
                  <div 
                    className="w-full h-full transition-transform duration-500 group-hover:scale-110 bg-cover bg-center" 
                    style={{ backgroundImage: `url('${exp.image}')` }} 
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary">
                    {exp.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{exp.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {exp.duration} mins</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {city.name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-bold text-primary text-xl">₹{exp.price.toLocaleString('en-IN')}</span>
                    <Link href={`/booking?experienceId=${exp.id}&cityId=${city.id}&price=${exp.price}`}>
                      <Button size="sm" className="rounded-lg">Book Now</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {city.experiences.length === 0 && (
              <div className="col-span-full py-12 text-center bg-gray-100 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-500">No specific experiences listed yet. Ask our guides for custom plans!</p>
              </div>
            )}
          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}
