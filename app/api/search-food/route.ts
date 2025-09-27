import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

async function searchFood(foodName: string) {
  const prompt = `
  You are an expert nutritionist and food analyst. Analyze the food item "${foodName}" and return ONLY valid JSON with this exact structure:
  {
    "food_name": "Specific name of the food item",
    "description": "Detailed description of the food, including typical preparation methods, common ingredients, and nutritional characteristics",
    "confidence": "High/Medium/Low - your confidence in the nutritional data",
    "nutrition": {
      "calories": 250,
      "protein_g": 15,
      "fat_g": 8,
      "carbs_g": 30,
      "sugar_g": 5,
      "fiber_g": 3,
      "sodium_mg": 400,
      "calcium_mg": 100,
      "iron_mg": 2
    },
    "ingredients": ["list", "of", "typical", "ingredients"],
    "health_insights": [
      "Detailed health benefit or concern",
      "Nutritional highlight",
      "Dietary consideration"
    ],
    "dietary_tags": ["vegetarian", "gluten-free", "high-protein", "etc"],
    "serving_size": "Standard serving size description (e.g., '1 medium apple', '100g cooked')",
    "preparation_method": "Common preparation methods for this food"
  }
  
  Important: 
  - Provide accurate nutrition data for a standard serving of "${foodName}"
  - Be specific about typical ingredients and preparation methods
  - Include relevant dietary tags and health insights
  - Return only the JSON object, no additional text or formatting
  - If the food name is unclear, make reasonable assumptions and indicate in confidence level
  - Base nutrition values on commonly available versions of this food
  `

  try {
    console.log(`[v0] Starting Gemini API call for food search: ${foodName}`)

    if (!process.env.GEMINI_API_KEY) {
      console.error("[v0] GEMINI_API_KEY not found in environment variables")
      throw new Error(
        "GEMINI_API_KEY environment variable is not set. Please add your Gemini API key in Project Settings > Environment Variables.",
      )
    }

    console.log("[v0] GEMINI_API_KEY found, proceeding with API call...")

    const result = await model.generateContent([prompt])

    console.log("[v0] Gemini API response received")
    const responseText = result.response.text()
    console.log("[v0] Response text:", responseText.substring(0, 200) + "...")

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response")
    }

    const parsedResult = JSON.parse(jsonMatch[0])
    console.log("[v0] Successfully parsed JSON response")
    return parsedResult
  } catch (error) {
    console.error("[v0] Gemini API error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const isApiKeyError = errorMessage.includes("GEMINI_API_KEY")

    return {
      food_name: isApiKeyError ? "API Key Required" : `${foodName} - Analysis Unavailable`,
      description: isApiKeyError
        ? "To use food search, please add your GEMINI_API_KEY in Project Settings > Environment Variables. You can get a free API key from Google AI Studio (ai.google.dev)."
        : `Unable to analyze "${foodName}" at this time. Please try again.`,
      confidence: "Low",
      nutrition: {
        calories: 0,
        protein_g: 0,
        fat_g: 0,
        carbs_g: 0,
        sugar_g: 0,
        fiber_g: 0,
        sodium_mg: 0,
        calcium_mg: 0,
        iron_mg: 0,
      },
      ingredients: [isApiKeyError ? "API key required" : "Analysis unavailable"],
      health_insights: [
        isApiKeyError ? "Add your GEMINI_API_KEY to enable food search" : "Food search is currently unavailable",
        isApiKeyError
          ? "Get a free API key from Google AI Studio (ai.google.dev)"
          : "Please ensure your API key is properly configured",
        "Try again after adding the API key",
      ],
      dietary_tags: [],
      serving_size: "Unknown",
      preparation_method: "Unable to determine",
      error: errorMessage,
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { foodName } = await request.json()

    if (!foodName || typeof foodName !== "string") {
      return NextResponse.json({ error: "No food name provided" }, { status: 400 })
    }

    const analysis = await searchFood(foodName.trim())

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to search food" }, { status: 500 })
  }
}
