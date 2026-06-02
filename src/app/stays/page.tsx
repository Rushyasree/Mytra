import { Navbar } from "@/components/ui/Navbar";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/ui/Footer";
import { Star, MapPin, ShieldCheck } from "lucide-react";

const stays = [
  {
    id: "1",
    name: "The Imperial Heritage Hotel",
    type: "Luxury Hotel",
    city: "Delhi",
    price: 8500,
    rating: 4.9,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80",
    tags: ["Wifi", "Breakfast", "Pool"],
    distance: "2.1 km from Connaught Place",
    badge: "Top Rated",
  },
  {
    id: "2",
    name: "Zostel Delhi",
    type: "Hostel",
    city: "Delhi",
    price: 800,
    rating: 4.6,
    reviews: 1200,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80",
    tags: ["Wifi", "Common Kitchen", "Lockers"],
    distance: "0.5 km from Paharganj Metro",
    badge: "Budget Pick",
  },
  {
    id: "3",
    name: "Haveli on the Lake",
    type: "Heritage Stay",
    city: "Jaipur",
    price: 5200,
    rating: 4.8,
    reviews: 190,
    image: "https://images.unsplash.com/photo-1577147114804-71d7a8b22c84?auto=format&fit=crop&q=80",
    tags: ["Rooftop View", "Breakfast", "Heritage"],
    distance: "1.2 km from Hawa Mahal",
    badge: "Heritage",
  },
  {
    id: "4",
    name: "Backwater Bliss Houseboat",
    type: "Airbnb-style Home",
    city: "Kerala",
    price: 7000,
    rating: 5.0,
    reviews: 88,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80",
    tags: ["Houseboat", "All Meals", "Scenic Views"],
    distance: "Alleppey Backwaters",
    badge: "Unique Stay",
  },
  {
    id: "5",
    name: "Goa Beach Cottage",
    type: "Budget Room",
    city: "Goa",
    price: 1800,
    rating: 4.4,
    reviews: 530,
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80",
    tags: ["Beach Access", "AC", "Wifi"],
    distance: "30m from Baga Beach",
    badge: "Beach Front",
  },
  {
    id: "6",
    name: "W Mumbai",
    type: "Luxury Resort",
    city: "Mumbai",
    price: 22000,
    rating: 4.9,
    reviews: 441,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80",
    tags: ["Spa", "Pool", "5-Star"],
    distance: "Nariman Point seafront",
    badge: "Luxury",
  },
  {
    id: "7",
    name: "BrijRama Palace",
    type: "Heritage Hotel",
    city: "Varanasi",
    price: 18000,
    rating: 4.9,
    reviews: 215,
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80",
    tags: ["Ganges View", "Heritage", "Luxury"],
    distance: "Directly on Darbhanga Ghat",
    badge: "Ultra Luxury",
  },
  {
    id: "8",
    name: "Kochi Homestay",
    type: "Airbnb-style Home",
    city: "Kochi",
    price: 2500,
    rating: 4.7,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1593693397690-362af9666fc2?auto=format&fit=crop&q=80",
    tags: ["Local Family", "Fort Kochi", "AC"],
    distance: "0.2 km from Chinese Fishing Nets",
    badge: "Cozy Home",
  },
];

export default function StaysPage() {
  return (
    <main className="min-h-screen flex flex-col pt-16 bg-gray-50 dark:bg-black">
      <Navbar />

      {/* Header */}
      <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Perfect Stay</h1>
          <p className="text-xl text-gray-500 max-w-2xl mb-8">Hotels, hostels, heritage havelis, houseboats — curated and verified for Indian travelers.</p>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {["All", "Hotels", "Hostels", "Heritage Stays", "Airbnb-style", "Budget", "Luxury"].map((filter) => (
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

      {/* Stays Grid */}
      <section className="py-12 flex-1">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stays.map((stay) => (
              <div key={stay.id} className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all group">
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${stay.image}')` }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow">{stay.badge}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{stay.type}</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{stay.rating}</span>
                      <span className="text-xs text-gray-400">({stay.reviews})</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-1">{stay.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5" /> {stay.distance}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {stay.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-2xl font-extrabold">₹{stay.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-500"> / night</span>
                    </div>
                    <Button size="sm" className="rounded-xl">Reserve</Button>
                  </div>
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
