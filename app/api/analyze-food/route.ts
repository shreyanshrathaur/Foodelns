import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

async function analyzeFood(base64Image: string) {
  const prompt = `
  You are an expert nutritionist and food analyst. Analyze this food image in detail and return ONLY valid JSON with this exact structure:
  {
    "food_name": "Specific name of the food item(s) identified",
    "description": "Detailed description of what you see in the image, including cooking method, ingredients visible, portion size, and presentation",
    "confidence": "High/Medium/Low - your confidence in the identification",
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
    "ingredients": ["list", "of", "visible", "ingredients"],
    "health_insights": [
      "Detailed health benefit or concern",
      "Nutritional highlight",
      "Dietary consideration"
    ],
    "dietary_tags": ["vegetarian", "gluten-free", "high-protein", "etc"],
    "serving_size": "Estimated serving size description",
    "preparation_method": "How the food appears to be prepared"
  }
  
  Important: 
  - Analyze the actual food in the image carefully
  - Provide realistic nutrition estimates based on what you see
  - Be specific about ingredients and preparation methods visible
  - Return only the JSON object, no additional text or formatting
  - If you're unsure about something, indicate it in the confidence level
  `

  try {
    console.log("[v0] Starting Gemini API call...")

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set")
    }

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ])

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

    return {
      food_name: "Food Analysis Unavailable",
      description: "Unable to analyze the food image at this time. Please check your API configuration.",
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
      ingredients: ["Analysis unavailable"],
      health_insights: [
        "Food analysis is currently unavailable",
        "Please ensure your GEMINI_API_KEY is properly configured",
        "Try again in a few moments",
      ],
      dietary_tags: [],
      serving_size: "Unknown",
      preparation_method: "Unable to determine",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "")

    const analysis = await analyzeFood(base64Data)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to analyze food" }, { status: 500 })
  }
}
