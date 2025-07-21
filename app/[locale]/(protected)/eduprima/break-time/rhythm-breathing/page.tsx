"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { Link } from "@/components/navigation"

interface BreathingPattern {
  name: string
  pattern: number[] // [inhale, hold, exhale, hold]
  description: string
}

export default function RhythmBreathingGame() {
  const [isActive, setIsActive] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null)
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale")
  const [timeLeft, setTimeLeft] = useState(0)
  const [cycle, setCycle] = useState(0)

  const timerRef = useRef<NodeJS.Timeout>()

  const patterns: BreathingPattern[] = [
    {
      name: "4-7-8 (Relaxation)",
      pattern: [4, 7, 8, 0],
      description: "Great for anxiety and sleep"
    },
    {
      name: "Box Breathing",
      pattern: [4, 4, 4, 4], 
      description: "Focus and concentration"
    },
    {
      name: "Simple 4-6",
      pattern: [4, 0, 6, 0],
      description: "Easy starter pattern"
    }
  ]

  const phaseNames = {
    inhale: "Breathe In",
    hold1: "Hold",
    exhale: "Breathe Out", 
    hold2: "Hold"
  }

  const phaseColors = {
    inhale: "bg-blue-400",
    hold1: "bg-purple-400",
    exhale: "bg-green-400",
    hold2: "bg-gray-400"
  }

  const startBreathing = (pattern: BreathingPattern) => {
    setSelectedPattern(pattern)
    setIsActive(true)
    setCurrentPhase("inhale")
    setTimeLeft(pattern.pattern[0])
    setCycle(0)
  }

  const stopBreathing = () => {
    setIsActive(false)
    setSelectedPattern(null)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const getCircleSize = () => {
    switch (currentPhase) {
      case "inhale": return "w-32 h-32"
      case "hold1": return "w-32 h-32"
      case "exhale": return "w-20 h-20"
      case "hold2": return "w-20 h-20"
    }
  }

  useEffect(() => {
    if (isActive && selectedPattern && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (isActive && selectedPattern && timeLeft === 0) {
      // Move to next phase
      const phases: (keyof typeof phaseNames)[] = ["inhale", "hold1", "exhale", "hold2"]
      const currentIndex = phases.indexOf(currentPhase)
      const nextIndex = (currentIndex + 1) % phases.length
      
      if (nextIndex === 0) {
        setCycle(prev => prev + 1)
      }
      
      const nextPhase = phases[nextIndex]
      const nextDuration = selectedPattern.pattern[nextIndex]
      
      // Skip phases with 0 duration
      if (nextDuration === 0) {
        const afterNextIndex = (nextIndex + 1) % phases.length
        const afterNextPhase = phases[afterNextIndex]
        const afterNextDuration = selectedPattern.pattern[afterNextIndex]
        
        setCurrentPhase(afterNextPhase)
        setTimeLeft(afterNextDuration)
        
        if (afterNextIndex === 0) {
          setCycle(prev => prev + 1)
        }
      } else {
        setCurrentPhase(nextPhase)
        setTimeLeft(nextDuration)
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isActive, selectedPattern, timeLeft, currentPhase])

  if (isActive && selectedPattern) {
    return (
      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">Rhythm Breathing</h1>
          <p className="text-muted-foreground">{selectedPattern.name}</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-8">
              
              {/* Breathing Circle */}
              <div className="flex items-center justify-center h-40">
                <div 
                  className={`
                    ${getCircleSize()} ${phaseColors[currentPhase]}
                    rounded-full flex items-center justify-center text-white font-bold
                    transition-all duration-1000 ease-in-out shadow-lg
                  `}
                >
                  <div className="text-center">
                    <div className="text-lg">{phaseNames[currentPhase]}</div>
                    <div className="text-2xl">{timeLeft}</div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">
                  Cycle: {cycle + 1}
                </div>
                <div className="text-xs text-muted-foreground">
                  Pattern: {selectedPattern.pattern.join("-")}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-4">
                <Button onClick={stopBreathing} variant="outline">
                  <Icon icon="ph:stop" className="h-4 w-4 mr-2" />
                  Stop
                </Button>
                <Link href="/eduprima/break-time">
                  <Button variant="outline">
                    <Icon icon="ph:house" className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-blue-700">
              Follow the circle and breathe naturally through your nose. 
              Let your belly rise and fall gently.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">Rhythm Breathing</h1>
        <p className="text-muted-foreground">
          Simple guided breathing exercises for relaxation
        </p>
      </div>

      <div className="space-y-4">
        {patterns.map((pattern, index) => (
          <Card 
            key={index}
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
            onClick={() => startBreathing(pattern)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{pattern.name}</h3>
                  <p className="text-muted-foreground text-sm">{pattern.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pattern: {pattern.pattern.join("-")} seconds
                  </p>
                </div>
                <div className="flex items-center">
                  <Icon icon="ph:play-circle" className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simple Info */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="font-medium text-green-800 mb-2">Benefits of Breathing Exercise</div>
            <div className="text-sm text-green-700">
              Reduces stress • Improves focus • Better sleep • Lowers anxiety
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link href="/eduprima/break-time">
          <Button variant="outline">
            <Icon icon="ph:arrow-left" className="h-4 w-4 mr-2" />
            Back to Break Time
          </Button>
        </Link>
      </div>
    </div>
  )
} 