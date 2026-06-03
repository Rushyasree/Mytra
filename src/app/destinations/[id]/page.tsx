import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import prisma from "@/lib/prisma";
import { ShieldCheck, Star, MapPin, Clock, ArrowRight, Sparkles, Flame, Heart, Compass, Gem } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AIPlanGenerator } from "@/components/itinerary/AIPlanGenerator";

export const dynamic = "force-dynamic";

export default async function DestinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const city = await prisma.city.findUnique({
    where: { id },
    include: {
      guides: {
        where: {
          status: 'APPROVED',
          bio: { not: null },
          languages: { not: null },
          interests: { not: null },
          pricePerHour: { gt: 0 },
        },
        include: { user: true }
      },
      experiences: true
    }
  });

  if (!city) {
    notFound();
  }

  const hiddenGems = city.experiences.filter(exp => exp.tag === 'hidden');
  const trendingNow = city.experiences.filter(exp => exp.tag === 'trending');
  const localFavorites = city.experiences.filter(exp => exp.tag === 'favorite' || !exp.tag);

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

      {/* City Stats */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 flex justify-center gap-12 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{city.guides.length}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Student Guides</div>
          </div>
          <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
          <div>
            <div className="text-2xl font-bold text-primary">{city.experiences.length}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Experiences</div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">
        
        {/* Guides Section */}
        <section>
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Verified Student Guides in {city.name}</h2>
              <p className="text-gray-500">Connecting you with the best local students for an authentic experience.</p>
            </div>
            <Link href="/guides" className="text-primary font-bold hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
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

        {/* Dynamic Content Sections */}
        <section className="space-y-16">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-6">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Explore {city.name} like a Local</h2>
            <p className="text-gray-500 text-lg">Curated activities, popular spots, and unique local recommendations.</p>
          </div>

          {/* Trending Now */}
          {trendingNow.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                    <Flame className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Trending Now</h3>
                    <p className="text-sm text-gray-500">Most popular choices this week based on bookings</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent snap-x snap-mandatory scroll-smooth">
                {trendingNow.map((exp) => (
                  <div key={exp.id} className="flex-shrink-0 w-80 snap-start bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 group">
                    <div className="h-48 overflow-hidden relative">
                      <div 
                        className="w-full h-full transition-transform duration-500 group-hover:scale-110 bg-cover bg-center" 
                        style={{ backgroundImage: `url('${exp.image}')` }} 
                      />
                      <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                        {exp.category}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col justify-between h-[200px]">
                      <div>
                        <h4 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{exp.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                          {exp.description}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {exp.duration} mins</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {city.name}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                          <span className="font-bold text-primary text-xl">₹{exp.price.toLocaleString('en-IN')}</span>
                          <Link href={`/booking?experienceId=${exp.id}&cityId=${city.id}&price=${exp.price}`}>
                            <Button size="sm" className="rounded-xl px-4 py-2 text-xs font-semibold">Book Now</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden Gems */}
          {hiddenGems.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                    <Gem className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Hidden Gems</h3>
                    <p className="text-sm text-gray-500">Off-the-beaten-path experiences and lesser-known local spots</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent snap-x snap-mandatory scroll-smooth">
                {hiddenGems.map((exp) => (
                  <div key={exp.id} className="flex-shrink-0 w-80 snap-start bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 group">
                    <div className="h-48 overflow-hidden relative">
                      <div 
                        className="w-full h-full transition-transform duration-500 group-hover:scale-110 bg-cover bg-center" 
                        style={{ backgroundImage: `url('${exp.image}')` }} 
                      />
                      <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                        {exp.category}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col justify-between h-[200px]">
                      <div>
                        <h4 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{exp.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                          {exp.description}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {exp.duration} mins</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {city.name}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                          <span className="font-bold text-primary text-xl">₹{exp.price.toLocaleString('en-IN')}</span>
                          <Link href={`/booking?experienceId=${exp.id}&cityId=${city.id}&price=${exp.price}`}>
                            <Button size="sm" className="rounded-xl px-4 py-2 text-xs font-semibold">Book Now</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Favorites */}
          {localFavorites.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                    <Heart className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Local Favorites</h3>
                    <p className="text-sm text-gray-500">Guide-recommended, highly-rated local tours and highlights</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent snap-x snap-mandatory scroll-smooth">
                {localFavorites.map((exp) => (
                  <div key={exp.id} className="flex-shrink-0 w-80 snap-start bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 group">
                    <div className="h-48 overflow-hidden relative">
                      <div 
                        className="w-full h-full transition-transform duration-500 group-hover:scale-110 bg-cover bg-center" 
                        style={{ backgroundImage: `url('${exp.image}')` }} 
                      />
                      <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                        {exp.category}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col justify-between h-[200px]">
                      <div>
                        <h4 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{exp.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                          {exp.description}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {exp.duration} mins</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {city.name}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                          <span className="font-bold text-primary text-xl">₹{exp.price.toLocaleString('en-IN')}</span>
                          <Link href={`/booking?experienceId=${exp.id}&cityId=${city.id}&price=${exp.price}`}>
                            <Button size="sm" className="rounded-xl px-4 py-2 text-xs font-semibold">Book Now</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {city.experiences.length === 0 && (
            <div className="py-16 text-center bg-gray-100 dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800 max-w-xl mx-auto">
              <Compass className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-bold mb-1">No custom experiences yet</h3>
              <p className="text-gray-500 text-sm px-6">We don't have specialized experiences here yet, but you can always hire a local student guide to co-create a perfect custom plan!</p>
            </div>
          )}
        </section>

      </div>

      <Footer />
    </main>
  );
}
