"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Camera, Upload, RotateCcw, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onBack: () => void
}

export function CameraCapture({ onCapture, onBack }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)

      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Camera access failed:", err)
      setError("Camera access denied. Please allow camera permissions or upload an image instead.")
    } finally {
      setIsLoading(false)
    }
  }, [facingMode, stream])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedImage(imageData)
    stopCamera()
  }, [stopCamera])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setCapturedImage(result)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleAnalyze = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }, [capturedImage, onCapture])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    setError(null)
    startCamera()
  }, [startCamera])

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }, [])

  // Auto-start camera on mount
  useState(() => {
    startCamera()
    return () => stopCamera()
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Capture Food</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {capturedImage ? (
          /* Preview captured image */
          <div className="space-y-6">
            <Card className="overflow-hidden bg-card border-border/50">
              <div className="aspect-[4/3] relative">
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured food"
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAnalyze}
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Zap className="w-5 h-5 mr-2" />
                Analyze Food
              </Button>
              <Button onClick={retakePhoto} variant="outline" size="lg" className="flex-1 bg-transparent">
                <RotateCcw className="w-5 h-5 mr-2" />
                Retake
              </Button>
            </div>
          </div>
        ) : (
          /* Camera interface */
          <div className="space-y-6">
            <Card className="overflow-hidden bg-card border-border/50">
              <div className="aspect-[4/3] relative bg-muted">
                {error ? (
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-pretty">{error}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={cn("w-full h-full object-cover", isLoading && "opacity-50")}
                    />
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Starting camera...</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>

            {!error && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={capturePhoto}
                  disabled={!stream || isLoading}
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Photo
                </Button>
                <Button onClick={switchCamera} disabled={!stream || isLoading} variant="outline" size="lg">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Flip Camera
                </Button>
              </div>
            )}

            {/* Upload alternative */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">or</span>
              </div>
            </div>

            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="lg" className="w-full">
              <Upload className="w-5 h-5 mr-2" />
              Upload from Gallery
            </Button>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  )
}
