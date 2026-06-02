import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { city, days, budget, interests } = await req.json();

    if (!city || !days) {
      return NextResponse.json({ error: "City and days are required" }, { status: 400 });
    }

    // 1. Fetch City
    const cityData = await prisma.city.findFirst({
      where: { name: { contains: city } },
      include: {
        experiences: true,
        guides: {
          where: { status: "APPROVED" },
          include: { user: true },
          take: 3
        }
      }
    });

    if (!cityData) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    // 2. Filter Experiences based on interests
    let filteredExperiences = cityData.experiences;
    if (interests && interests.length > 0) {
      filteredExperiences = cityData.experiences.filter(exp => 
        interests.some((interest: string) => exp.category.toLowerCase().includes(interest.toLowerCase()))
      );
    }

    // If no interest match, fallback to all city experiences
    if (filteredExperiences.length === 0) {
      filteredExperiences = cityData.experiences;
    }

    // 3. Simple Budget Logic (Price-based filtering)
    if (budget === "budget") {
      filteredExperiences = filteredExperiences.filter(exp => exp.price < 2000);
    } else if (budget === "mid") {
      filteredExperiences = filteredExperiences.filter(exp => exp.price >= 2000 && exp.price < 8000);
    } else if (budget === "luxury") {
      filteredExperiences = filteredExperiences.filter(exp => exp.price >= 8000);
    }

    // If budget filtering returns nothing, use all filtered experiences
    if (filteredExperiences.length === 0) {
      filteredExperiences = cityData.experiences;
    }

    // 4. Generate Day-wise structure
    const itinerary = [];
    const itemsPerDay = 3;
    
    for (let i = 0; i < days; i++) {
      const dayItems = filteredExperiences.slice(i * itemsPerDay, (i + 1) * itemsPerDay);
      
      // If we run out of unique experiences, recycle them or stop
      if (dayItems.length > 0) {
        itinerary.push({
          day: i + 1,
          title: `Discover ${cityData.name} - Day ${i + 1}`,
          items: dayItems.map((exp, idx) => ({
            time: idx === 0 ? "10:00 AM" : idx === 1 ? "2:00 PM" : "6:00 PM",
            activity: exp.title,
            note: exp.category,
            price: exp.price,
            image: exp.image
          }))
        });
      }
    }

    return NextResponse.json({
      itinerary,
      guides: cityData.guides,
      city: cityData.name,
      estimatedTotal: itinerary.reduce((sum, day) => sum + day.items.reduce((dSum, item) => dSum + item.price, 0), 0)
    });

  } catch (error) {
    console.error("Itinerary Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
