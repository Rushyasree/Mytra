import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')
  
  // Create cities
  const citiesData = [
    { name: 'Delhi', slug: 'delhi', state: 'Delhi NCR', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80' },
    { name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra', image: 'https://images.unsplash.com/photo-1522206090980-4c8e5fa4e0b0?auto=format&fit=crop&q=80' },
    { name: 'Jaipur', slug: 'jaipur', state: 'Rajasthan', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80' },
    { name: 'Hyderabad', slug: 'hyderabad', state: 'Telangana', image: 'https://images.unsplash.com/photo-1615469038354-bebc7a996e8d?auto=format&fit=crop&q=80' },
    { name: 'Kochi', slug: 'kochi', state: 'Kerala', image: 'https://images.unsplash.com/photo-1593693397690-362af9666fc2?auto=format&fit=crop&q=80' },
    { name: 'Chennai', slug: 'chennai', state: 'Tamil Nadu', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80' },
    { name: 'Varanasi', slug: 'varanasi', state: 'Uttar Pradesh', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80' },
    { name: 'Tirupati', slug: 'tirupati', state: 'Andhra Pradesh', image: 'https://images.unsplash.com/photo-1580192980104-2049d569772a?auto=format&fit=crop&q=80' },
    { name: 'Pondicherry', slug: 'pondicherry', state: 'Puducherry', image: 'https://images.unsplash.com/photo-1580502283993-9799279185a3?auto=format&fit=crop&q=80' },
    { name: 'Bengaluru', slug: 'bengaluru', state: 'Karnataka', image: 'https://images.unsplash.com/photo-1596760405809-780247492462?auto=format&fit=crop&q=80' },
  ];

  const createdCities = await Promise.all(
    citiesData.map(c => prisma.city.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    }))
  );

  console.log(`Created ${createdCities.length} cities`);

  // Create users & guides
  const guidesData = [
    {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      profile: {
        university: 'Delhi University',
        languages: 'English, Hindi, Punjabi',
        bio: 'Born and raised in Delhi. I love showing people the hidden street food spots of Old Delhi.',
        pricePerHour: 1250,
        rating: 4.9,
        cityName: 'Delhi'
      }
    },
    {
      name: 'Priya Patel',
      email: 'priya@example.com',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      profile: {
        university: 'Mumbai University',
        languages: 'English, Hindi, Marathi, Gujarati',
        bio: 'History student with a passion for Mumbai\'s colonial architecture and modern art scene.',
        pricePerHour: 1500,
        rating: 4.8,
        cityName: 'Mumbai'
      }
    },
    {
      name: 'Ananya Reddy',
      email: 'ananya@example.com',
      image: 'https://randomuser.me/api/portraits/women/65.jpg',
      profile: {
        university: 'Osmania University',
        languages: 'English, Telugu, Hindi',
        bio: 'Software engineer by day, foodie by heart. Let me show you the real Hyderabadi Biryani and the Charminar night life.',
        pricePerHour: 1100,
        rating: 4.7,
        cityName: 'Hyderabad'
      }
    },
    {
      name: 'Karthik Nair',
      email: 'karthik@example.com',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      profile: {
        university: 'Cochin University',
        languages: 'English, Malayalam, Tamil',
        bio: 'Architecture student. I can take you through the Chinese fishing nets and the vibrant street art of Fort Kochi.',
        pricePerHour: 950,
        rating: 4.6,
        cityName: 'Kochi'
      }
    },
    {
      name: 'Shivansh Mishra',
      email: 'shiv@example.com',
      image: 'https://randomuser.me/api/portraits/men/52.jpg',
      profile: {
        university: 'BHU Varanasi',
        languages: 'English, Hindi, Sanskrit',
        bio: 'PhD student in Sanskrit. I can explain the spiritual significance of every ghat and lead you to the best evening Aarti views.',
        pricePerHour: 800,
        rating: 4.9,
        cityName: 'Varanasi'
      }
    }
  ];

  for (const g of guidesData) {
    await prisma.user.upsert({
      where: { email: g.email },
      update: {},
      create: {
        name: g.name,
        email: g.email,
        role: 'GUIDE',
        image: g.image,
        guideProfile: {
          create: {
            university: g.profile.university,
            languages: g.profile.languages,
            bio: g.profile.bio,
            pricePerHour: g.profile.pricePerHour,
            rating: g.profile.rating,
            isVerified: true,
            status: 'APPROVED',
            cityId: createdCities.find(c => c.name === g.profile.cityName)?.id,
          }
        }
      }
    });
  }

  console.log('Created expanded dummy guides');

  // Create Experiences
  await prisma.experience.createMany({
    data: [
      {
        title: 'Old Delhi Street Food Walk',
        description: 'Taste the best parathas, chaat, and jalebis in the narrow alleys of Chandni Chowk.',
        price: 2500,
        duration: 180,
        category: 'Food',
        cityId: createdCities.find(c => c.name === 'Delhi')!.id,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&q=80',
      },
      {
        title: 'Colonial Bombay Heritage Walk',
        description: 'Explore the gothic architecture and fascinating history of South Mumbai.',
        price: 2000,
        duration: 120,
        category: 'Heritage',
        cityId: createdCities.find(c => c.name === 'Mumbai')!.id,
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80',
      },
      {
        title: 'Charminar Night Market Foodie Tour',
        description: 'Experience the bustling night markets and authentic Irani Chai and Biryani.',
        price: 1800,
        duration: 150,
        category: 'Nightlife',
        cityId: createdCities.find(c => c.name === 'Hyderabad')!.id,
        image: 'https://images.unsplash.com/photo-1615469038354-bebc7a996e8d?auto=format&fit=crop&q=80',
      },
      {
        title: 'Fort Kochi Art & Architecture Walk',
        description: 'Explore the fusion of Portuguese, Dutch, and British history through Fort Kochi\'s streets.',
        price: 1500,
        duration: 120,
        category: 'Heritage',
        cityId: createdCities.find(c => c.name === 'Kochi')!.id,
        image: 'https://images.unsplash.com/photo-1593693397690-362af9666fc2?auto=format&fit=crop&q=80',
      },
      {
        title: 'Sunrise Boat Ride on Ganges',
        description: 'A spiritual journey through the sacred ghats of Varanasi during the magical morning light.',
        price: 1200,
        duration: 90,
        category: 'Spirituality',
        cityId: createdCities.find(c => c.name === 'Varanasi')!.id,
        image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80',
      }
    ],
  });

  console.log('Created dummy experiences');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
