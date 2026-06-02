import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { GuideExplorer } from "@/components/guides/GuideExplorer";

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <main className="min-h-screen flex flex-col pt-16 bg-gray-50/50 dark:bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-secondary dark:text-white">
            Find Your <span className="text-primary italic">Local Friend</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Explore India with verified student guides who know the hidden gems, culture, and stories of their city.
          </p>
        </div>
      </section>

      {/* Explorer Section */}
      <section className="flex-1">
        <GuideExplorer initialQuery={q} />
      </section>

      <Footer />
    </main>
  );
}
