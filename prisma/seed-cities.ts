import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const cities = [
  // Tier 1 - Metros
  { name: "Delhi", slug: "delhi", state: "Delhi", category: "metro", region: "North", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80", description: "The capital city, a blend of history and modernity." },
  { name: "Mumbai", slug: "mumbai", state: "Maharashtra", category: "metro", region: "West", image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&q=80", description: "The financial capital and city of dreams." },
  { name: "Bengaluru", slug: "bengaluru", state: "Karnataka", category: "metro", region: "South", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80", description: "The Silicon Valley of India." },
  { name: "Hyderabad", slug: "hyderabad", state: "Telangana", category: "metro", region: "South", image: "https://images.unsplash.com/photo-1615469038354-bebc7a996e8d?auto=format&fit=crop&q=80", description: "City of pearls and biryani." },
  { name: "Chennai", slug: "chennai", state: "Tamil Nadu", category: "metro", region: "South", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80", description: "Gateway to South India." },
  { name: "Kolkata", slug: "kolkata", state: "West Bengal", category: "metro", region: "East", image: "https://images.unsplash.com/photo-1558431382-bb7b38c49051?auto=format&fit=crop&q=80", description: "The city of joy and cultural capital." },

  // Tier 2 & Tourist
  { name: "Jaipur", slug: "jaipur", state: "Rajasthan", category: "city", region: "North", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80", description: "The Pink City, famous for palaces and forts." },
  { name: "Varanasi", slug: "varanasi", state: "Uttar Pradesh", category: "tourist", region: "North", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80", description: "One of the oldest living cities in the world." },
  { name: "Udaipur", slug: "udaipur", state: "Rajasthan", category: "tourist", region: "North", image: "https://images.unsplash.com/photo-1515518555214-386866f80922?auto=format&fit=crop&q=80", description: "The City of Lakes." },
  { name: "Kochi", slug: "kochi", state: "Kerala", category: "city", region: "South", image: "https://images.unsplash.com/photo-1593693397690-362af9666fc2?auto=format&fit=crop&q=80", description: "The Queen of the Arabian Sea." },
  { name: "Rishikesh", slug: "rishikesh", state: "Uttarakhand", category: "tourist", region: "North", image: "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?auto=format&fit=crop&q=80", description: "Yoga Capital of the World." },
  { name: "Manali", slug: "manali", state: "Himachal Pradesh", category: "tourist", region: "North", image: "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&q=80", description: "High-altitude Himalayan resort town." },
  { name: "Goa", slug: "goa", state: "Goa", category: "tourist", region: "West", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80", description: "Famous for its beaches and nightlife." },
  { name: "Hampi", slug: "hampi", state: "Karnataka", category: "tourist", region: "South", image: "https://images.unsplash.com/photo-1600100397608-f0907409249d?auto=format&fit=crop&q=80", description: "UNESCO World Heritage site with ancient ruins." },
  { name: "Guwahati", slug: "guwahati", state: "Assam", category: "city", region: "Northeast", image: "https://images.unsplash.com/photo-1626600989392-f018e31f0b0c?auto=format&fit=crop&q=80", description: "Gateway to Northeast India." },
  { name: "Leh", slug: "leh", state: "Ladakh", category: "tourist", region: "North", image: "https://images.unsplash.com/photo-1527333656061-ca7ada6dd8ae?auto=format&fit=crop&q=80", description: "Stunning mountain landscapes and monasteries." },
  { name: "Munnar", slug: "munnar", state: "Kerala", category: "tourist", region: "South", image: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&q=80", description: "Famous for tea plantations and rolling hills." },
];

async function main() {
  console.log("Seeding cities...");
  for (const city of cities) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: city,
      create: city,
    });
  }
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
