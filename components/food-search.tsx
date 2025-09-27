"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Search, Sparkles, Loader2 } from "lucide-react"

interface FoodSearchProps {
  onSearch: (foodName: string) => void
  onBack: () => void
  isSearching?: boolean
}

export function FoodSearch({ onSearch, onBack, isSearching = false }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("recentFoodSearches") || "[]")
      } catch {
        return []
      }
    }
    return []
  })

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    // Add to recent searches
    const updatedSearches = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 10)
    setRecentSearches(updatedSearches)
    localStorage.setItem("recentFoodSearches", JSON.stringify(updatedSearches))

    onSearch(searchQuery.trim())
  }

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query)
    onSearch(query)
  }

  const popularSearches = [
    "Apple",
    "Banana",
    "Chicken breast",
    "Salmon",
    "Broccoli",
    "Rice",
    "Avocado",
    "Greek yogurt",
    "Almonds",
    "Sweet potato",
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Search Food</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for any food item (e.g., grilled chicken, chocolate cake, green salad...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 pr-4 py-3 text-lg border-border/50 focus:border-primary"
              disabled={isSearching}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg font-medium"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Get Nutrition Info
              </>
            )}
          </Button>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="max-w-2xl mx-auto mb-8">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleRecentSearch(search)}
                  className="text-sm"
                  disabled={isSearching}
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Searches */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Popular Searches</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {popularSearches.map((food, index) => (
              <Card
                key={index}
                className="p-4 cursor-pointer hover:bg-accent transition-colors border-border/50"
                onClick={() => handleRecentSearch(food)}
              >
                <div className="text-center">
                  <div className="text-sm font-medium text-card-foreground">{food}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="max-w-2xl mx-auto mt-12 p-6 bg-card/50 rounded-2xl border border-border/50">
          <h3 className="text-lg font-semibold mb-3 text-card-foreground">How it works</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span>Type any food name or dish (e.g., "grilled salmon", "chocolate chip cookies")</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span>Get detailed nutrition information powered by AI</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span>Receive personalized health insights and recommendations</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
