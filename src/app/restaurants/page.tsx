import { Navbar } from "@/components/ui/Navbar";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/ui/Footer";
import { Star, MapPin, Clock } from "lucide-react";

const restaurants = [
  {
    id: "1",
    name: "Karim's",
    cuisine: "Mughlai • Non-Veg",
    city: "Delhi",
    price: "₹400 for two",
    rating: 4.8,
    reviews: 8200,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80",
    tags: ["Local Legend", "Street Food"],
    timing: "12pm – 11pm",
    badge: "Must Try",
  },
  {
    id: "2",
    name: "Peshawri – ITC",
    cuisine: "North Indian • Veg & Non-Veg",
    city: "Mumbai",
    price: "₹3,500 for two",
    rating: 4.9,
    reviews: 2100,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80",
    tags: ["Fine Dining", "Award Winning"],
    timing: "12:30pm – 11:30pm",
    badge: "Fine Dining",
  },
  {
    id: "3",
    name: "Soda Bottle Openerwala",
    cuisine: "Parsi • Veg-friendly",
    city: "Mumbai",
    price: "₹1,200 for two",
    rating: 4.6,
    reviews: 4300,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80",
    tags: ["Quirky Decor", "Brunch"],
    timing: "9am – 11pm",
    badge: "Trending",
  },
  {
    id: "4",
    name: "Paradise Biryani",
    cuisine: "Hyderabadi • Non-Veg",
    city: "Hyderabad",
    price: "₹700 for two",
    rating: 4.7,
    reviews: 12000,
    image: "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&q=80",
    tags: ["Iconic", "Biryani"],
    timing: "11am – 11pm",
    badge: "Iconic",
  },
  {
    id: "5",
    name: "Grasshopper",
    cuisine: "Multi-cuisine • Rooftop",
    city: "Jaipur",
    price: "₹2,000 for two",
    rating: 4.5,
    reviews: 980,
    image: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&q=80",
    tags: ["Rooftop", "Sunset Views"],
    timing: "7pm – 11pm",
    badge: "Rooftop Dining",
  },
  {
    id: "6",
    name: "Saravana Bhavan",
    cuisine: "South Indian • Pure Veg",
    city: "Chennai",
    price: "₹300 for two",
    rating: 4.7,
    reviews: 25000,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80",
    tags: ["Vegetarian", "Local Favourite"],
    timing: "6am – 11pm",
    badge: "Vegan Friendly",
  },
  {
    id: "7",
    name: "Blue Nile",
    cuisine: "Kerala Traditional • Seafood",
    city: "Kochi",
    price: "₹1,000 for two",
    rating: 4.5,
    reviews: 1200,
    image: "https://images.unsplash.com/photo-1593693397690-362af9666fc2?auto=format&fit=crop&q=80",
    tags: ["Seafood", "Authentic"],
    timing: "12pm – 10:30pm",
    badge: "Seafood Special",
  },
  {
    id: "8",
    name: "Kashi Chat Bhandar",
    cuisine: "Varanasi Street Food • Veg",
    city: "Varanasi",
    price: "₹150 for two",
    rating: 4.8,
    reviews: 5600,
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80",
    tags: ["Legendary", "Street Food"],
    timing: "4pm – 10pm",
    badge: "Street Legend",
  },
];

export default function RestaurantsPage() {
  return (
    <main className="min-h-screen flex flex-col pt-16 bg-gray-50 dark:bg-black">
      <Navbar />

      {/* Header */}
      <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Eat Where Locals Eat</h1>
          <p className="text-xl text-gray-500 max-w-2xl mb-8">Reserve tables at iconic restaurants, street food spots, and rooftop dining curated by your Mytra guide.</p>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {["All", "Street Food", "Fine Dining", "Rooftop", "Vegetarian", "Biryani", "South Indian", "Seafood"].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${filter === "All" ? "bg-primary text-white border-primary" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary"}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 flex-1">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((r) => (
              <div key={r.id} className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${r.image}')` }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow">{r.badge}</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-md text-xs font-bold text-gray-700 dark:text-gray-200 px-2 py-1 rounded-lg">
                    {r.city}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-400 font-medium">{r.cuisine}</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{r.rating}</span>
                      <span className="text-xs text-gray-400">({r.reviews.toLocaleString()})</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-xl mb-1">{r.name}</h3>

                  <div className="flex gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {r.timing}</span>
                    <span>{r.price}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {r.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300 font-medium">{tag}</span>
                    ))}
                  </div>

                  <Button className="w-full rounded-xl">Reserve a Table</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
