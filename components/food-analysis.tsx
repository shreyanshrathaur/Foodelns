"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Camera, Lightbulb, Zap, Info, ChefHat, Target } from "lucide-react"
import {
  type FoodAnalysisResult,
  formatNutritionValue,
  getNutritionColor,
  getConfidenceColor,
} from "@/lib/food-analyzer"

interface FoodAnalysisProps {
  data: FoodAnalysisResult | null
  isLoading: boolean
  onBack: () => void
  onNewScan: () => void
}

export function FoodAnalysis({ data, isLoading, onBack, onNewScan }: FoodAnalysisProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Analysis Results</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {isLoading ? (
          /* Loading State */
          <div className="space-y-6">
            <Card className="p-8 bg-card border-border/50">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h2 className="text-xl font-semibold mb-2 text-card-foreground">Analyzing your food...</h2>
                <p className="text-muted-foreground">
                  Our AI is identifying ingredients and calculating nutrition information.
                </p>
              </div>
            </Card>
          </div>
        ) : data ? (
          /* Results */
          <div className="space-y-6">
            {/* Food Name Card */}
            <Card className="p-6 bg-card border-border/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-card-foreground">{data.food_name}</h2>
                    <p className="text-sm text-muted-foreground">AI-powered analysis</p>
                  </div>
                </div>
                <Badge variant="outline" className={getConfidenceColor(data.confidence)}>
                  {data.confidence} Confidence
                </Badge>
              </div>

              {data.description && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
                </div>
              )}
            </Card>

            {(data.ingredients?.length > 0 || data.preparation_method || data.serving_size) && (
              <Card className="p-6 bg-card border-border/50">
                <h3 className="text-lg font-semibold mb-4 text-card-foreground flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Food Details
                </h3>

                <div className="space-y-4">
                  {data.ingredients?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Visible Ingredients</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.ingredients.map((ingredient, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.preparation_method && (
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Preparation:</span>
                      <span className="text-sm text-foreground">{data.preparation_method}</span>
                    </div>
                  )}

                  {data.serving_size && (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Serving Size:</span>
                      <span className="text-sm text-foreground">{data.serving_size}</span>
                    </div>
                  )}

                  {data.dietary_tags?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Dietary Information</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.dietary_tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-green-500/10 text-green-600 border-green-500/20"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Nutrition Information */}
            <Card className="p-6 bg-card border-border/50">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Nutrition Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary mb-1">{data.nutrition.calories}</div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className={`text-2xl font-bold mb-1 ${getNutritionColor("protein", data.nutrition.protein_g)}`}>
                    {formatNutritionValue(data.nutrition.protein_g, "g")}
                  </div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className={`text-2xl font-bold mb-1 ${getNutritionColor("fat", data.nutrition.fat_g)}`}>
                    {formatNutritionValue(data.nutrition.fat_g, "g")}
                  </div>
                  <div className="text-sm text-muted-foreground">Fat</div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {formatNutritionValue(data.nutrition.carbs_g, "g")}
                  </div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className={`text-2xl font-bold mb-1 ${getNutritionColor("sugar", data.nutrition.sugar_g)}`}>
                    {formatNutritionValue(data.nutrition.sugar_g, "g")}
                  </div>
                  <div className="text-sm text-muted-foreground">Sugar</div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className={`text-2xl font-bold mb-1 ${getNutritionColor("fiber", data.nutrition.fiber_g)}`}>
                    {formatNutritionValue(data.nutrition.fiber_g, "g")}
                  </div>
                  <div className="text-sm text-muted-foreground">Fiber</div>
                </div>
              </div>

              {(data.nutrition.sodium_mg > 0 || data.nutrition.calcium_mg > 0 || data.nutrition.iron_mg > 0) && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Additional Nutrients</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {data.nutrition.sodium_mg > 0 && (
                      <div className="text-center">
                        <div
                          className={`text-lg font-semibold ${getNutritionColor("sodium", data.nutrition.sodium_mg)}`}
                        >
                          {data.nutrition.sodium_mg}mg
                        </div>
                        <div className="text-xs text-muted-foreground">Sodium</div>
                      </div>
                    )}
                    {data.nutrition.calcium_mg > 0 && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-foreground">{data.nutrition.calcium_mg}mg</div>
                        <div className="text-xs text-muted-foreground">Calcium</div>
                      </div>
                    )}
                    {data.nutrition.iron_mg > 0 && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-foreground">{data.nutrition.iron_mg}mg</div>
                        <div className="text-xs text-muted-foreground">Iron</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {data.health_insights?.length > 0 && (
              <Card className="p-6 bg-card border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Lightbulb className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-3 text-card-foreground">Health Insights</h3>
                    <div className="space-y-3">
                      {data.health_insights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <p className="text-muted-foreground text-sm leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Macronutrient Breakdown */}
            <Card className="p-6 bg-card border-border/50">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Macronutrient Breakdown</h3>

              <div className="space-y-3">
                {/* Protein Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Protein</span>
                    <span className="text-foreground font-medium">{data.nutrition.protein_g}g</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((data.nutrition.protein_g / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Fat Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Fat</span>
                    <span className="text-foreground font-medium">{data.nutrition.fat_g}g</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((data.nutrition.fat_g / 30) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Carbs Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Carbohydrates</span>
                    <span className="text-foreground font-medium">{data.nutrition.carbs_g}g</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((data.nutrition.carbs_g / 60) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {data.error && (
              <Card className="p-4 bg-destructive/5 border-destructive/20">
                <div className="flex items-center gap-2 text-destructive">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-medium">Analysis Note:</span>
                </div>
                <p className="text-sm text-destructive/80 mt-1">{data.error}</p>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onNewScan}
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Camera className="w-5 h-5 mr-2" />
                Analyze Another
              </Button>
              <Button onClick={onBack} variant="outline" size="lg" className="flex-1 bg-transparent">
                Back to Home
              </Button>
            </div>
          </div>
        ) : (
          /* Error State */
          <Card className="p-8 bg-card border-border/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">Analysis Failed</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't analyze your food image. Please try again with a clearer photo.
              </p>
              <Button onClick={onNewScan} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Camera className="w-5 h-5 mr-2" />
                Try Again
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
