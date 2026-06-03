import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit } from "@/lib/security";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  const rateLimited = checkRateLimit(req, "ai-itinerary", 8, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { city, days, budget, interests, travelerType } = await req.json();

    // 1. Validation
    if (!city || !days || !budget) {
      return NextResponse.json({ error: "City, days, and budget are required" }, { status: 400 });
    }

    // 2. Fetch Real Data from Database
    const cityData = await prisma.city.findFirst({
      where: { name: { contains: city } },
      include: {
        experiences: {
          take: 8 // Limit to avoid token overflow and keep AI focused
        },
        guides: {
          where: {
            status: "APPROVED",
            bio: { not: null },
            languages: { not: null },
            interests: { not: null },
            cityId: { not: null },
            pricePerHour: { gt: 0 },
          },
          include: { user: true },
          take: 5
        }
      }
    });

    if (!cityData) {
      return NextResponse.json({ error: "City not found in our database" }, { status: 404 });
    }

    // 3. Construct the AI Prompt
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Generate a structured travel itinerary for ${cityData.name} based on the following user preferences:
- Duration: ${days} days
- Budget: ₹${budget}
- Interests: ${interests || "General sightseeing"}
- Traveler Type: ${travelerType || "Generic"}

Available Real Data (ONLY use these for suggestions where possible):
EXPERIENCES:
${cityData.experiences.map(e => `- ${e.title} (Price: ₹${e.price}, Category: ${e.category})`).join("\n")}

GUIDES:
${cityData.guides.map(g => `- ${g.user.name} (Price: ₹${g.pricePerHour}/hr, Rating: ${g.rating}, University: ${g.university})`).join("\n")}

STRICT INSTRUCTIONS:
1. Return ONLY valid JSON.
2. Do NOT include any explanations, markdown formatting (like \`\`\`json), or extra text.
3. Use the provided experiences and guides where they fit the budget and interests.
4. Hallucinate only minor details (like specific local food spots or generic walking routes) if database data is insufficient, but prioritize real experiences.
5. The output must strictly follow this JSON schema:
{
  "days": [
    {
      "day": number,
      "plan": "detailed description of the day's activities",
      "places": ["string names of places/experiences"],
      "guideSuggestions": ["names of suggested guides from the list"],
      "estimatedCost": number
    }
  ],
  "totalEstimatedCost": number
}
    `.trim();

    let itineraryData;
    let usedAi = false;

    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        throw new Error("Gemini API key not configured");
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up response (remove markdown code blocks if any)
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      itineraryData = JSON.parse(text);
      usedAi = true;
    } catch (aiError) {
      console.error("Gemini AI Error or Parse Error:", aiError);
      // 4. Fallback System
      itineraryData = generateFallbackItinerary(cityData, days, budget);
    }

    return NextResponse.json({
      ...itineraryData,
      isAiGenerated: usedAi,
      city: cityData.name
    });

  } catch (error) {
    console.error("Itinerary API Error:", error);
    return NextResponse.json({ error: "Failed to generate itinerary" }, { status: 500 });
  }
}

function generateFallbackItinerary(cityData: any, days: number, budget: number) {
  const itinerary: any[] = [];
  const experiences = cityData.experiences;
  const itemsPerDay = 2;
  
  // Simple sorting: Top rated/pricey first for Day 1, etc.
  const sortedExps = [...experiences].sort((a, b) => b.price - a.price);

  for (let i = 0; i < days; i++) {
    const dayExps = sortedExps.slice(i * itemsPerDay, (i + 1) * itemsPerDay);
    if (dayExps.length === 0 && i > 0) break; // Stop if no more experiences

    const dayCost = dayExps.reduce((sum: number, e: any) => sum + e.price, 0);
    
    itinerary.push({
      day: i + 1,
      plan: `Explore ${cityData.name} by visiting ${dayExps.map((e: any) => e.title).join(" and ")}.`,
      places: dayExps.map((e: any) => e.title),
      guideSuggestions: cityData.guides.slice(0, 2).map((g: any) => g.user.name),
      estimatedCost: dayCost
    });
  }

  return {
    days: itinerary,
    totalEstimatedCost: itinerary.reduce((sum, d) => sum + d.estimatedCost, 0)
  };
}
