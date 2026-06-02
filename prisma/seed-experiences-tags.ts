import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const experiencesData = [
  // Delhi
  {
    title: 'Secret Sufi Music Night at Nizamuddin',
    description: 'Listen to mystical Qawwali music inside the narrow lanes of Nizamuddin Basti, away from the tourists.',
    price: 1500,
    duration: 120,
    category: 'Spirituality',
    cityName: 'Delhi',
    tag: 'hidden',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80',
  },
  {
    title: 'Old Delhi Street Food Walk',
    description: 'Taste the best parathas, chaat, and jalebis in the narrow alleys of Chandni Chowk.',
    price: 2500,
    duration: 180,
    category: 'Food',
    cityName: 'Delhi',
    tag: 'trending',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&q=80',
  },
  {
    title: 'Lodi Gardens Heritage & Photography Tour',
    description: 'Walk through the historical tomb complexes and lush lawns recommended by local historians.',
    price: 1200,
    duration: 120,
    category: 'Heritage',
    cityName: 'Delhi',
    tag: 'favorite',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80',
  },

  // Mumbai
  {
    title: 'Khotachiwadi Heritage Hamlet Tour',
    description: 'Explore the 18th-century Portuguese-style wooden cottages tucked away in East Indian enclave.',
    price: 1400,
    duration: 90,
    category: 'Heritage',
    cityName: 'Mumbai',
    tag: 'hidden',
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&q=80',
  },
  {
    title: 'Marine Drive Late Night Chai & Stories',
    description: 'Walk the Queen\'s Necklace at midnight, experiencing Mumbai\'s active nightlife like a local.',
    price: 800,
    duration: 120,
    category: 'Nightlife',
    cityName: 'Mumbai',
    tag: 'trending',
    image: 'https://images.unsplash.com/photo-1522206090980-4c8e5fa4e0b0?auto=format&fit=crop&q=80',
  },
  {
    title: 'Colonial Bombay Heritage Walk',
    description: 'Explore the gothic architecture and fascinating history of South Mumbai.',
    price: 2000,
    duration: 120,
    category: 'Heritage',
    cityName: 'Mumbai',
    tag: 'favorite',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80',
  },

  // Jaipur
  {
    title: 'Panna Meena ka Kund Stepwell Secrets',
    description: 'Visit the stunning 16th-century symmetrical geometric stepwell and nearby hidden ruins.',
    price: 1100,
    duration: 90,
    category: 'Heritage',
    cityName: 'Jaipur',
    tag: 'hidden',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80',
  },
  {
    title: 'Nahargarh Fort Sunset Trek & Drinks',
    description: 'Trek up to the fort edge to catch a panoramic sunset view of the entire Pink City.',
    price: 1600,
    duration: 150,
    category: 'Adventure',
    cityName: 'Jaipur',
    tag: 'trending',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80',
  },
  {
    title: 'Johari Bazaar Local Artisan Tour',
    description: 'Go behind the scenes with gemstone cutters, block printers, and enamel jewelry artists.',
    price: 1800,
    duration: 180,
    category: 'Shopping',
    cityName: 'Jaipur',
    tag: 'favorite',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80',
  },

  // Hyderabad
  {
    title: 'Paigah Tombs Intricate Stucco Walk',
    description: 'Discover the gorgeous lime-stucco tombs of Hyderabad\'s royalty, completely off the beaten path.',
    price: 1200,
    duration: 120,
    category: 'Heritage',
    cityName: 'Hyderabad',
    tag: 'hidden',
    image: 'https://images.unsplash.com/photo-1615469038354-bebc7a996e8d?auto=format&fit=crop&q=80',
  },
  {
    title: 'Charminar Night Market Foodie Tour',
    description: 'Experience the bustling night markets and authentic Irani Chai and Biryani.',
    price: 1800,
    duration: 150,
    category: 'Nightlife',
    cityName: 'Hyderabad',
    tag: 'trending',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80',
  },
  {
    title: 'Secret Lake Kayaking & Evening Coffee',
    description: 'Kayak in Durgam Cheruvu lake followed by locally brewed coffee at a lakeside café.',
    price: 1500,
    duration: 120,
    category: 'Adventure',
    cityName: 'Hyderabad',
    tag: 'favorite',
    image: 'https://images.unsplash.com/photo-1596760405809-780247492462?auto=format&fit=crop&q=80',
  },

  // Varanasi
  {
    title: 'Lolark Kund Ancient Sun Temple Walk',
    description: 'Visit one of the oldest sacred water reservoirs in Varanasi, hidden deep within local neighborhoods.',
    price: 1000,
    duration: 90,
    category: 'Spirituality',
    cityName: 'Varanasi',
    tag: 'hidden',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80',
  },
  {
    title: 'Sunrise Boat Ride & Subah-e-Banaras',
    description: 'A spiritual journey through the sacred ghats of Varanasi during the magical morning light.',
    price: 1200,
    duration: 90,
    category: 'Spirituality',
    cityName: 'Varanasi',
    tag: 'trending',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80',
  },
  {
    title: 'Kachori Lane & Rabri Food Tasting',
    description: 'Start your morning with local student guides hunting for the absolute best street breakfast.',
    price: 900,
    duration: 120,
    category: 'Food',
    cityName: 'Varanasi',
    tag: 'favorite',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&q=80',
  }
];

async function main() {
  console.log('Seeding and updating tagged experiences...');

  // Delete existing experiences to avoid duplication or constraint errors
  await prisma.experience.deleteMany({});
  console.log('Cleared existing experiences.');

  for (const exp of experiencesData) {
    const city = await prisma.city.findFirst({
      where: { name: exp.cityName }
    });

    if (!city) {
      console.log(`City ${exp.cityName} not found, skipping experience ${exp.title}`);
      continue;
    }

    await prisma.experience.create({
      data: {
        title: exp.title,
        description: exp.description,
        price: exp.price,
        duration: exp.duration,
        category: exp.category,
        image: exp.image,
        tag: exp.tag,
        cityId: city.id
      }
    });
  }

  console.log('Successfully seeded tagged experiences!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
