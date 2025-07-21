"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import Link from "next/link"

interface MoodCard {
  id: number
  emoji: string
  name: string
  points: number
  type: "good" | "bad"
  x: number
  y: number
  lifespan: number
  maxLifespan: number
}

export default function MoodJourneyGame() {
  const [gameState, setGameState] = useState<"start" | "playing" | "finished">("start")
  const [score, setScore] = useState(0)
  const [moodLevel, setMoodLevel] = useState(70)
  const [timeLeft, setTimeLeft] = useState(30)
  const [cards, setCards] = useState<MoodCard[]>([])
  const [combo, setCombo] = useState(0)
  const [lastHit, setLastHit] = useState<"good" | "bad" | null>(null)
  
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const cardIdRef = useRef(0)
  const spawnTimerRef = useRef<NodeJS.Timeout>()

  // Card types dengan emoji dan efek
  const cardTypes = {
    good: [
      { emoji: "😊", name: "Joy", points: 10 },
      { emoji: "🧘", name: "Peace", points: 15 },
      { emoji: "💪", name: "Energy", points: 12 },
      { emoji: "🌸", name: "Calm", points: 8 },
      { emoji: "⭐", name: "Hope", points: 18 },
      { emoji: "🎯", name: "Focus", points: 20 },
      { emoji: "💝", name: "Love", points: 25 },
      { emoji: "🌈", name: "Wonder", points: 22 },
      { emoji: "☕", name: "Relax", points: 14 },
      { emoji: "📚", name: "Learn", points: 16 },
    ],
    bad: [
      { emoji: "😰", name: "Stress", points: -15 },
      { emoji: "😞", name: "Sadness", points: -10 },
      { emoji: "😡", name: "Anger", points: -12 },
      { emoji: "💭", name: "Overthink", points: -8 },
      { emoji: "📱", name: "Distraction", points: -14 },
      { emoji: "🌩️", name: "Chaos", points: -20 },
      { emoji: "⚡", name: "Burnout", points: -18 },
      { emoji: "🔥", name: "Pressure", points: -16 },
    ]
  }

  const spawnCard = useCallback(() => {
    if (gameState !== "playing" || !gameAreaRef.current) return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const isGoodCard = Math.random() > 0.25 // 75% good cards, 25% bad cards

    const cardTypeList = isGoodCard ? cardTypes.good : cardTypes.bad
    const randomType = cardTypeList[Math.floor(Math.random() * cardTypeList.length)]

    const newCard: MoodCard = {
      id: cardIdRef.current++,
      ...randomType,
      type: isGoodCard ? "good" : "bad",
      x: Math.random() * (rect.width - 120) + 60, // Leave margin for card size
      y: Math.random() * (rect.height - 120) + 60,
      lifespan: isGoodCard ? 3000 : 2500, // Bad cards disappear slightly faster
      maxLifespan: isGoodCard ? 3000 : 2500,
    }

    setCards(prev => [...prev, newCard])
  }, [gameState])

  const clickCard = (cardId: number) => {
    setCards(prev => {
      const card = prev.find(c => c.id === cardId)
      if (!card) return prev

      // Update score and mood
      setScore(s => Math.max(0, s + card.points))
      setMoodLevel(m => Math.max(0, Math.min(100, m + (card.points / 2))))

      // Combo system
      if (card.type === "good") {
        if (lastHit === "good") {
          setCombo(c => c + 1)
        } else {
          setCombo(1)
        }
        setLastHit("good")
      } else {
        setCombo(0)
        setLastHit("bad")
      }

      return prev.filter(c => c.id !== cardId)
    })
  }

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setMoodLevel(70)
    setTimeLeft(30)
    setCards([])
    setCombo(0)
    setLastHit(null)
    cardIdRef.current = 0
  }

  // Game timer
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setGameState("finished")
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current)
    }
  }, [gameState, timeLeft])

  // Card spawning system
  useEffect(() => {
    if (gameState === "playing") {
      // Initial spawn
      setTimeout(spawnCard, 500)
      
      // Regular spawning - gets faster as game progresses
      const baseInterval = 1200
      const spawnInterval = Math.max(600, baseInterval - (30 - timeLeft) * 20)
      
      spawnTimerRef.current = setInterval(spawnCard, spawnInterval)
    }

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current)
    }
  }, [gameState, timeLeft, spawnCard])

  // Card lifespan management
  useEffect(() => {
    if (gameState === "playing") {
      const lifespanTimer = setInterval(() => {
        setCards(prev => 
          prev.map(card => ({ ...card, lifespan: card.lifespan - 100 }))
            .filter(card => card.lifespan > 0)
        )
      }, 100)
      
      return () => clearInterval(lifespanTimer)
    }
  }, [gameState])

  const getLifespanPercentage = (card: MoodCard) => {
    return (card.lifespan / card.maxLifespan) * 100
  }

  const getMoodBarColor = () => {
    if (moodLevel >= 80) return "bg-success"
    if (moodLevel >= 60) return "bg-primary"
    if (moodLevel >= 40) return "bg-warning"
    return "bg-destructive"
  }

  const getFinishMessage = () => {
    if (score >= 200) return "🏆 Master Self-Care! Kamu incredible!"
    if (score >= 150) return "🌟 Luar biasa! Mood management expert!"
    if (score >= 100) return "😊 Great job! Kamu handle stress dengan baik!"
    if (score >= 50) return "💪 Tidak buruk! Keep practicing!"
    if (score >= 0) return "🌈 Every small step counts. Coba lagi!"
    return "💝 Bad day? Tomorrow is a new chance!"
  }

  const getComboText = () => {
    if (combo >= 5) return "🔥 ON FIRE!"
    if (combo >= 3) return "⚡ COMBO!"
    return ""
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">Mood Journey ⚡</h1>
        <p className="text-muted-foreground">
          Catch the good vibes, avoid the bad ones!
        </p>
      </div>

      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          {/* Game Area */}
          <div 
            ref={gameAreaRef}
            className="relative min-h-[500px] bg-gradient-to-br from-primary/10 via-success/5 to-warning/10 rounded-lg border-2 border-dashed border-default-200 overflow-hidden"
          >
            
            {/* Game Stats */}
            {gameState === "playing" && (
              <>
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-default-200">
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Icon icon="ph:star" className="h-4 w-4 text-warning" />
                        <span>Score: {score}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon icon="ph:timer" className="h-4 w-4 text-destructive" />
                        <span className={timeLeft <= 10 ? "text-destructive font-bold animate-pulse" : ""}>
                          {timeLeft}s
                        </span>
                      </div>
                      {combo > 0 && (
                        <div className="flex items-center gap-2 text-warning font-bold">
                          <Icon icon="ph:lightning" className="h-4 w-4" />
                          <span>{combo}x {getComboText()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mood Indicator */}
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-default-200">
                    <div className="text-sm font-medium mb-2">Mood</div>
                    <div className="w-20 h-2 bg-default-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${getMoodBarColor()}`}
                        style={{ width: `${moodLevel}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Cards */}
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className={`
                      absolute cursor-pointer transition-all duration-200 hover:scale-110
                      ${card.type === "good" 
                        ? "hover:shadow-lg hover:shadow-success/30" 
                        : "hover:shadow-lg hover:shadow-destructive/30"
                      }
                    `}
                    style={{
                      left: `${card.x}px`,
                      top: `${card.y}px`,
                      transform: `scale(${0.8 + (getLifespanPercentage(card) / 100) * 0.4})`,
                      opacity: Math.max(0.3, getLifespanPercentage(card) / 100)
                    }}
                    onClick={() => clickCard(card.id)}
                  >
                    <div className={`
                      relative w-20 h-20 flex flex-col items-center justify-center
                      bg-white/90 backdrop-blur-sm border-2 rounded-xl shadow-lg
                      ${card.type === "good" 
                        ? "border-success/40 bg-success/5" 
                        : "border-destructive/40 bg-destructive/5 animate-pulse"
                      }
                    `}>
                      {/* Lifespan indicator */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-default-200 rounded-t-xl overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-100 ${
                            card.type === "good" ? "bg-success" : "bg-destructive"
                          }`}
                          style={{ width: `${getLifespanPercentage(card)}%` }}
                        />
                      </div>
                      
                      <div className="text-2xl mb-1 animate-bounce">
                        {card.emoji}
                      </div>
                      <div className={`text-xs font-bold ${
                        card.type === "good" ? "text-success" : "text-destructive"
                      }`}>
                        {card.points > 0 ? "+" : ""}{card.points}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Start Screen */}
            {gameState === "start" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="space-y-6 max-w-md">
                  <div className="text-6xl animate-bounce">⚡</div>
                  <div>
                    <h2 className="text-3xl font-bold text-primary mb-2">Dynamic Mood Journey</h2>
                    <p className="text-muted-foreground">
                      Cards akan muncul dan hilang secara acak. Klik yang baik, hindari yang buruk!
                    </p>
                  </div>
                  
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 space-y-2">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>✨ Klik good mood cards untuk poin positif</div>
                        <div>⚠️ Hindari bad mood cards (mengurangi skor)</div>
                        <div>🔥 Chain good cards untuk combo bonus!</div>
                        <div>⏰ Cards hilang otomatis jika tidak diklik</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button onClick={startGame} className="px-8 py-3">
                    <Icon icon="ph:play" className="h-4 w-4 mr-2" />
                    Start Dynamic Journey
                  </Button>
                </div>
              </div>
            )}

            {/* Finished Screen */}
            {gameState === "finished" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="space-y-6 max-w-md">
                  <div className="text-5xl animate-bounce">
                    {score >= 150 ? "🏆" : score >= 100 ? "🌟" : score >= 50 ? "😊" : "💪"}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-primary mb-4">Journey Complete!</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-success/10 border-success/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-success">{score}</div>
                        <div className="text-sm text-muted-foreground">final score</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/10 border-primary/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{Math.round(moodLevel)}%</div>
                        <div className="text-sm text-muted-foreground">mood level</div>
                      </CardContent>
                    </Card>
                  </div>

                  {combo > 2 && (
                    <Card className="bg-warning/10 border-warning/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-lg font-bold text-warning">Best Combo: {combo}x! 🔥</div>
                        <div className="text-sm text-muted-foreground">Excellent focus!</div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-default-50 border-default-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">{getFinishMessage()}</p>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Button onClick={startGame} className="w-full">
                      <Icon icon="ph:arrow-clockwise" className="h-4 w-4 mr-2" />
                      Play Again
                    </Button>
                    <Link href="/eduprima/break-time" className="block w-full">
                      <Button variant="outline" className="w-full">
                        <Icon icon="ph:house" className="h-4 w-4 mr-2" />
                        Back to Break Time
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Game Info */}
      <Card className="bg-info/5 border-info/20">
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            <div className="font-medium mb-2">⚡ Dynamic Mood Journey ⚡</div>
            <div>Fast-paced self-care game dengan card system yang dinamis dan challenging! 🎮</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 