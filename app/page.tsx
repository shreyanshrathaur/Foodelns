"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, Sparkles, History, Zap, AlertCircle, ExternalLink } from "lucide-react"
import { CameraCapture } from "@/components/camera-capture"
import { FoodAnalysis } from "@/components/food-analysis"
import { FoodHistory } from "@/components/food-history"

export default function FoodLensApp() {
  const [currentView, setCurrentView] = useState<"home" | "camera" | "analysis" | "history">("home")
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false)

  useEffect(() => {
    // Check if we've shown the API key alert before
    const hasShownAlert = localStorage.getItem("hasShownApiKeyAlert")
    if (!hasShownAlert) {
      setShowApiKeyAlert(true)
      localStorage.setItem("hasShownApiKeyAlert", "true")
    }
  }, [])

  const handleImageCapture = async (imageData: string) => {
    setIsAnalyzing(true)
    setCurrentView("analysis")

    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      })

      const result = await response.json()
      setAnalysisData(result)

      if (result.error && result.error.includes("GEMINI_API_KEY")) {
        setShowApiKeyAlert(true)
      }

      try {
        const history = JSON.parse(localStorage.getItem("foodHistory") || "[]")
        history.unshift({ ...result, timestamp: Date.now(), image: imageData })
        localStorage.setItem("foodHistory", JSON.stringify(history.slice(0, 20)))
      } catch (storageError) {
        console.error("Failed to save to history:", storageError)
      }
    } catch (error) {
      console.error("Analysis failed:", error)
      setAnalysisData(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (currentView === "camera") {
    return <CameraCapture onCapture={handleImageCapture} onBack={() => setCurrentView("home")} />
  }

  if (currentView === "analysis") {
    return (
      <FoodAnalysis
        data={analysisData}
        isLoading={isAnalyzing}
        onBack={() => setCurrentView("home")}
        onNewScan={() => setCurrentView("camera")}
      />
    )
  }

  if (currentView === "history") {
    return <FoodHistory onBack={() => setCurrentView("home")} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">FoodLens</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView("history")}
            className="text-muted-foreground hover:text-foreground"
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        {showApiKeyAlert && (
          <Alert className="mb-8 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <strong className="font-medium">Setup Required:</strong> To use AI food analysis, add your{" "}
                  <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded text-xs">GEMINI_API_KEY</code> in
                  Project Settings → Environment Variables.
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("https://ai.google.dev/", "_blank")}
                    className="text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-900"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Get API Key
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKeyAlert(false)}
                    className="text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Nutrition Analysis
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            FoodLens – AI Food Detector
          </h1>

          <p className="text-xl text-muted-foreground text-pretty mb-8 leading-relaxed">
            Instantly analyze your food with advanced AI. Get detailed nutrition information, health insights, and
            personalized recommendations with just a photo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => setCurrentView("camera")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-medium"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Analyzing
            </Button>
            <Button variant="outline" size="lg" onClick={() => setCurrentView("history")} className="px-8 py-3 text-lg">
              <History className="w-5 h-5 mr-2" />
              View History
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 bg-card border-border/50 hover:border-border transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-card-foreground">Smart Detection</h3>
            <p className="text-muted-foreground text-pretty">
              Advanced AI recognizes food items instantly from photos with high accuracy and detailed analysis.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border/50 hover:border-border transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-card-foreground">Nutrition Insights</h3>
            <p className="text-muted-foreground text-pretty">
              Get comprehensive nutrition data including calories, macros, and personalized health tips.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border/50 hover:border-border transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <History className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-card-foreground">Track Progress</h3>
            <p className="text-muted-foreground text-pretty">
              Keep a history of analyzed foods and track your nutrition patterns over time.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-card/50 rounded-2xl border border-border/50">
          <h2 className="text-2xl font-bold mb-4 text-card-foreground">Ready to analyze your food?</h2>
          <p className="text-muted-foreground mb-6 text-pretty">
            Take a photo or upload an image to get started with AI-powered nutrition analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => setCurrentView("camera")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </Button>
            <Button variant="outline" size="lg" onClick={() => setCurrentView("camera")}>
              <Upload className="w-5 h-5 mr-2" />
              Upload Image
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
