import { Navbar } from "@/components/ui/Navbar";
import { Button } from "@/components/ui/Button";
import { PrismaClient } from "@prisma/client";
import { ShieldCheck, Star, MapPin, Calendar, MessageCircle, Navigation, Clock, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { BookingCard } from "@/components/booking/BookingCard";

const prisma = new PrismaClient();

export default async function GuideProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const guide = await prisma.guideProfile.findUnique({
    where: { id: resolvedParams.id },
    include: { user: true, city: true }
  });

  if (!guide) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col pt-16 bg-gray-50 dark:bg-black">
      <Navbar />
      
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${guide.city?.image}')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 w-full -mt-32 relative z-10 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <img 
                  src={guide.user.image || ''} 
                  alt={guide.user.name || ''} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold">{guide.user.name}</h1>
                    {guide.isVerified && (
                      <div className="flex items-center gap-1 text-sm font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">
                        <ShieldCheck className="w-4 h-4" /> Verified Guide
                      </div>
                    )}
                  </div>
                  <p className="text-primary font-medium text-lg mb-2">{guide.university}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {guide.city?.name}</span>
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-current" /> {guide.rating} (42 reviews)</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Joined 2024</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-8">
                <h2 className="text-xl font-bold mb-4">About Me</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {guide.bio}
                </p>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {guide.languages?.split(',').map(lang => (
                    <span key={lang} className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-sm font-medium">
                      {lang.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Specialties Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-6">What I can help you with</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Hidden local food spots",
                  "Historical and cultural context",
                  "Language translation & haggling",
                  "Safe navigation through chaotic streets",
                  "Finding budget-friendly stays",
                  "Local public transport mastery"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
             <BookingCard guide={guide} />
             
             <div className="mt-8 bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <Button variant="outline" className="w-full h-12 text-sm rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest">
                  <MessageCircle className="w-4 h-4" /> Message {guide.user.name?.split(' ')[0]}
                </Button>
                
                <div className="mt-6 bg-gray-50 dark:bg-black p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                    <Navigation className="w-3 h-3 text-primary" /> Meetup Location
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {guide.user.name} usually meets travelers near the central station or main city square.
                  </p>
                </div>
             </div>
          </div>
          
        </div>
      </div>
      
    </main>
  );
}
