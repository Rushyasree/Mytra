import { Button } from "@/components/ui/Button";
import { HeroSlideshow } from "@/components/ui/HeroSlideshow";
import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { ShieldCheck, Map, Users, Star, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { safeDatabaseQuery } from "@/lib/db-safe";
import Link from "next/link";
import { HeroSearch } from "@/components/ui/HeroSearch";

export const dynamic = "force-dynamic";

const testimonials = [
  {
    text: "Rahul took us through Chandni Chowk and we ate the best food of our lives. We never would have found those hidden spots on our own. Absolutely brilliant experience!",
    name: "Emma & Tom Wilson",
    from: "London, UK",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
  },
  {
    text: "Priya made Mumbai feel like home. She knew every shortcut, every great café, and even helped us bargain at the markets. Worth every rupee!",
    name: "Luca Ferrari",
    from: "Milan, Italy",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    rating: 5,
  },
  {
    text: "As a solo female traveler, I was a bit nervous. My guide Sneha was incredible — professional, funny, and made me feel completely safe the whole time.",
    name: "Sarah Chen",
    from: "Sydney, Australia",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
  },
];

import { SplashScreen } from "@/components/ui/SplashScreen";

export default async function Home() {
  const [cities, experiences, featuredGuides] = await safeDatabaseQuery(
    "home",
    () =>
      Promise.all([
        prisma.city.findMany({ take: 9 }),
        prisma.experience.findMany({ take: 4, include: { city: true } }),
        prisma.guideProfile.findMany({
          where: {
            status: "APPROVED",
            bio: { not: null },
            languages: { not: null },
            interests: { not: null },
            cityId: { not: null },
            pricePerHour: { gt: 0 },
          },
          take: 3,
          include: { user: true, city: true },
          orderBy: { rating: "desc" },
        }),
      ]),
    [[], [], []]
  );

  return (
    <main className="min-h-screen flex flex-col">
      <SplashScreen />
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/20 z-10" />
        <HeroSlideshow />

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto space-y-6">
          <span className="inline-block bg-primary/20 text-primary border border-primary/30 text-sm font-bold px-4 py-1.5 rounded-full backdrop-blur-sm">
            🇮🇳 India's #1 Local Connection Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
            Explore <span className="luxury-gradient">Real India</span><br />
            with a Local Friend
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
            Book verified student guides for authentic experiences, hidden gems, and real connections.
          </p>

          <HeroSearch />

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/guides">
              <Button size="lg" className="h-14 px-10 rounded-full text-lg shadow-xl shadow-primary/30">
                Browse All Guides
              </Button>
            </Link>
            <Link href="/become-guide">
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-lg bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white backdrop-blur-sm">
                Become a Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Regions ────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Explore by Region</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["North", "South", "East", "West", "Northeast"].map((region) => (
              <Link 
                key={region} 
                href={`/destinations?region=${region}`}
                className="group p-6 bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary hover:shadow-lg transition-all text-center"
              >
                <div className="text-sm font-bold group-hover:text-primary">{region} India</div>
                <div className="text-xs text-gray-500 mt-1">Discover hidden gems</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destinations ──────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Popular Destinations</h2>
              <p className="text-gray-500 dark:text-gray-400">Explore India's most vibrant cities with a local friend.</p>
            </div>
            <Link href="/destinations" className="hidden sm:flex items-center text-primary font-medium hover:underline">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cities.map((city) => (
              <Link href={`/city/${city.slug}`} key={city.id} className="group relative rounded-3xl overflow-hidden h-80 shadow-lg block">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${city.image}')` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-2xl font-bold text-white mb-1">{city.name}</h3>
                  <p className="text-gray-300 text-sm">{city.state}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Experiences ───────────────────────────────────── */}
      {experiences.length > 0 && (
        <section className="py-24 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Curated Local Experiences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-white dark:bg-black rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 transition-all group">
                  <div className="h-48 overflow-hidden">
                    <div className="w-full h-full transition-transform duration-500 group-hover:scale-110 bg-cover bg-center" style={{ backgroundImage: `url('${exp.image}')` }} />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">{exp.category}</span>
                    <h3 className="font-bold text-lg mt-1 mb-2 line-clamp-1">{exp.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{exp.description}</p>
                    <p className="mt-3 font-bold text-primary">₹{exp.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Guides ───────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Featured Guides</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Friendly, verified, and passionate about their cities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredGuides.map((guide) => (
              <div key={guide.id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="absolute top-4 right-4">
                  {guide.isVerified && <ShieldCheck className="w-6 h-6 text-accent" />}
                </div>
                <div className="flex flex-col items-center text-center">
                  <img src={guide.user.image || ""} alt={guide.user.name || ""} className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-white dark:border-gray-800 shadow-lg" />
                  <h3 className="text-xl font-bold">{guide.user.name}</h3>
                  <p className="text-sm text-primary font-medium mb-4">{guide.university}</p>
                  <div className="flex items-center gap-1 mb-4 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold text-gray-700 dark:text-gray-300">{guide.rating}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-6">{guide.bio}</p>
                  <Link href={`/guides/${guide.id}`} className="w-full">
                    <Button className="w-full rounded-full">View Profile</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/guides">
              <Button variant="outline" size="lg" className="rounded-full px-10">Browse All Guides <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">How Mytra Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Choose City", desc: "Select from 50+ Indian cities" },
              { step: "2", title: "Book Student Guide", desc: "Browse verified local student profiles" },
              { step: "3", title: "Add Extras", desc: "Include stays, food & transport" },
              { step: "4", title: "Explore Like a Local", desc: "Experience the real culture safely" },
            ].map((item, i) => (
              <div key={i} className="relative p-6 rounded-2xl bg-white dark:bg-black shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow group">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">What Travelers Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow flex flex-col">
                <div className="flex text-yellow-500 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-1 mb-6 text-base italic">"{t.text}"</p>
                <div className="flex items-center gap-4 border-t border-gray-100 dark:border-gray-800 pt-5">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.from}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10,000+", label: "Happy Travelers" },
            { value: "2,000+", label: "Verified Guides" },
            { value: "50+", label: "Indian Cities" },
            { value: "4.9 ★", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl md:text-5xl font-extrabold mb-2">{stat.value}</div>
              <div className="text-primary-foreground/70 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="py-24 bg-secondary text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Explore India?</h2>
          <p className="text-gray-400 text-lg mb-10">Join thousands of travelers discovering hidden India with verified local student guides.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/guides">
              <Button size="lg" className="h-14 px-10 rounded-full text-lg shadow-xl shadow-primary/30">Find Your Guide</Button>
            </Link>
            <Link href="/become-guide">
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-lg border-white/30 text-white hover:bg-white/10 hover:text-white bg-white/5">Become a Guide</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
