export interface NutritionData {
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
  sugar_g: number
  fiber_g: number
  sodium_mg: number
  calcium_mg: number
  iron_mg: number
}

export interface FoodAnalysisResult {
  food_name: string
  description: string
  confidence: "High" | "Medium" | "Low"
  nutrition: NutritionData
  ingredients: string[]
  health_insights: string[]
  dietary_tags: string[]
  serving_size: string
  preparation_method: string
  timestamp?: number
  image?: string
  error?: string
}

export async function analyzeFoodImage(imageData: string): Promise<FoodAnalysisResult> {
  const response = await fetch("/api/analyze-food", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: imageData }),
  })

  if (!response.ok) {
    throw new Error("Failed to analyze food")
  }

  return response.json()
}

export function formatNutritionValue(value: number, unit: string): string {
  return `${value}${unit}`
}

export function getNutritionColor(type: string, value: number): string {
  switch (type) {
    case "calories":
      if (value > 400) return "text-orange-500"
      if (value > 200) return "text-yellow-500"
      return "text-green-500"
    case "protein":
      if (value > 20) return "text-green-500"
      if (value > 10) return "text-yellow-500"
      return "text-orange-500"
    case "fat":
      if (value > 15) return "text-orange-500"
      if (value > 8) return "text-yellow-500"
      return "text-green-500"
    case "sugar":
      if (value > 15) return "text-red-500"
      if (value > 8) return "text-orange-500"
      return "text-green-500"
    case "sodium":
      if (value > 800) return "text-red-500"
      if (value > 400) return "text-orange-500"
      return "text-green-500"
    case "fiber":
      if (value > 5) return "text-green-500"
      if (value > 2) return "text-yellow-500"
      return "text-orange-500"
    default:
      return "text-foreground"
  }
}

export function getConfidenceColor(confidence: string): string {
  switch (confidence) {
    case "High":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "Medium":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    case "Low":
      return "bg-red-500/10 text-red-500 border-red-500/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}
