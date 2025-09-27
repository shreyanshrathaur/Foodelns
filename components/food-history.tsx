"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Trash2, Calendar, Zap, Camera } from "lucide-react"
import type { FoodAnalysisResult } from "@/lib/food-analyzer"

interface FoodHistoryProps {
  onBack: () => void
}

export function FoodHistory({ onBack }: FoodHistoryProps) {
  const [history, setHistory] = useState<(FoodAnalysisResult & { timestamp: number; image: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load history from localStorage
    try {
      const savedHistory = localStorage.getItem("foodHistory")
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        setHistory(parsedHistory)
      }
    } catch (error) {
      console.error("Failed to load history:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearHistory = () => {
    localStorage.removeItem("foodHistory")
    setHistory([])
  }

  const removeItem = (timestamp: number) => {
    const updatedHistory = history.filter((item) => item.timestamp !== timestamp)
    setHistory(updatedHistory)
    localStorage.setItem("foodHistory", JSON.stringify(updatedHistory))
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours)
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Analysis History</h1>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {isLoading ? (
          /* Loading State */
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          /* Empty State */
          <Card className="p-8 bg-card border-border/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">No Analysis History</h2>
              <p className="text-muted-foreground mb-6 text-pretty">
                Start analyzing your food to see your nutrition history here.
              </p>
              <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Camera className="w-5 h-5 mr-2" />
                Analyze Food
              </Button>
            </div>
          </Card>
        ) : (
          /* History List */
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Your Food History</h2>
                <p className="text-muted-foreground">
                  {history.length} analysis{history.length !== 1 ? "es" : ""} saved
                </p>
              </div>
            </div>

            {history.map((item) => (
              <Card key={item.timestamp} className="p-4 bg-card border-border/50 hover:border-border transition-colors">
                <div className="flex gap-4">
                  {/* Food Image Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={item.image || "/placeholder.svg?height=80&width=80&query=food"}
                      alt={item.food_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-card-foreground truncate">{item.food_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.timestamp)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.timestamp)}
                        className="text-muted-foreground hover:text-destructive p-1 h-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Quick Nutrition Summary */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="bg-muted/50 rounded px-2 py-1 text-center">
                        <div className="font-medium text-primary">{item.nutrition.calories}</div>
                        <div className="text-muted-foreground">cal</div>
                      </div>
                      <div className="bg-muted/50 rounded px-2 py-1 text-center">
                        <div className="font-medium text-green-500">{item.nutrition.protein_g}g</div>
                        <div className="text-muted-foreground">protein</div>
                      </div>
                      <div className="bg-muted/50 rounded px-2 py-1 text-center">
                        <div className="font-medium text-yellow-500">{item.nutrition.fat_g}g</div>
                        <div className="text-muted-foreground">fat</div>
                      </div>
                      <div className="bg-muted/50 rounded px-2 py-1 text-center">
                        <div className="font-medium text-blue-500">{item.nutrition.carbs_g}g</div>
                        <div className="text-muted-foreground">carbs</div>
                      </div>
                    </div>

                    {/* Health Tip Preview */}
                    {item.health_tip && (
                      <div className="mt-3 p-2 bg-primary/5 rounded-lg border-l-2 border-primary/20">
                        <div className="flex items-start gap-2">
                          <Zap className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.health_tip}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* Summary Stats */}
            {history.length > 1 && (
              <Card className="p-6 bg-card border-border/50 mt-8">
                <h3 className="text-lg font-semibold mb-4 text-card-foreground">Quick Stats</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(history.reduce((sum, item) => sum + item.nutrition.calories, 0) / history.length)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {Math.round(history.reduce((sum, item) => sum + item.nutrition.protein_g, 0) / history.length)}g
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{history.length}</div>
                    <div className="text-sm text-muted-foreground">Total Scans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(
                        (Date.now() - Math.min(...history.map((item) => item.timestamp))) / (1000 * 60 * 60 * 24),
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Days Tracking</div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
