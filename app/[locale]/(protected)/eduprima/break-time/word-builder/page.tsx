"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { Link } from "@/components/navigation"
import { cn } from "@/lib/utils"
import { 
  type Vocabulary, 
  type VocabularyConfig,
  getRandomVocabulary, 
  getGameConfig,
  getVocabularyStats
} from "./vocabularies-data"

interface GameStats {
  score: number
  streak: number
  timeLeft: number
  level: number
}

export default function WordBuilderGame() {
  const [gameState, setGameState] = useState<"start" | "playing" | "finished">("start")
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null)
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([])
  const [guessedWord, setGuessedWord] = useState<string[]>([])
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    streak: 0,
    timeLeft: 180, // 3 minutes
    level: 1
  })
  const [hint, setHint] = useState(false)
  const [gameConfig, setGameConfig] = useState<VocabularyConfig | null>(null)

  // Load game config on mount
  useEffect(() => {
    const config = getGameConfig()
    setGameConfig(config)
  }, [])

  // Game logic
  const shuffleArray = (array: string[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const getRandomWordForLevel = useCallback(async (level: number): Promise<Vocabulary> => {
    return await getRandomVocabulary(level)
  }, [])

  const startNewRound = useCallback(async () => {
    const word = await getRandomWordForLevel(stats.level)
    setCurrentWord(word)
    setShuffledLetters(shuffleArray(word.word.split('')))
    setGuessedWord([])
    setHint(false)
  }, [getRandomWordForLevel, stats.level])

  const addLetter = (letter: string, index: number) => {
    if (guessedWord.length < currentWord!.word.length) {
      setGuessedWord(prev => [...prev, letter])
      setShuffledLetters(prev => prev.filter((_, i) => i !== index))
    }
  }

  const removeLetter = (index: number) => {
    const letter = guessedWord[index]
    setGuessedWord(prev => prev.filter((_, i) => i !== index))
    setShuffledLetters(prev => [...prev, letter])
  }

  const checkAnswer = () => {
    const guess = guessedWord.join('')
    if (guess === currentWord!.word && gameConfig) {
      // Correct answer
      const points = gameConfig.difficulties[currentWord!.difficulty].points
      setStats(prev => ({
        ...prev,
        score: prev.score + points + (prev.streak * 5),
        streak: prev.streak + 1
      }))
      
      // Level up every 5 correct answers
      if ((stats.score + points) > stats.level * 50) {
        setStats(prev => ({ ...prev, level: prev.level + 1 }))
      }
      
      setTimeout(() => {
        startNewRound()
      }, 1500)
    } else {
      // Wrong answer - reset letters
      setStats(prev => ({ ...prev, streak: 0 }))
      setShuffledLetters(shuffleArray(currentWord!.word.split('')))
      setGuessedWord([])
    }
  }

  const skipWord = () => {
    setStats(prev => ({ ...prev, streak: 0 }))
    startNewRound()
  }

  // Timer
  useEffect(() => {
    if (gameState === "playing" && stats.timeLeft > 0) {
      const timer = setTimeout(() => {
        setStats(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
      }, 1000)
      return () => clearTimeout(timer)
    } else if (stats.timeLeft === 0) {
      setGameState("finished")
    }
  }, [gameState, stats.timeLeft])

  const startGame = () => {
    setGameState("playing")
    setStats({
      score: 0,
      streak: 0,
      timeLeft: 180,
      level: 1
    })
    // Start first round after state is set
    setTimeout(() => {
      startNewRound()
    }, 100)
  }

  const resetGame = () => {
    setGameState("start")
    setCurrentWord(null)
    setShuffledLetters([])
    setGuessedWord([])
  }

  const isWordComplete = guessedWord.length === (currentWord?.word.length || 0)
  const isWordCorrect = currentWord && guessedWord.join('') === currentWord.word

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <Icon icon="ph:pencil" className="h-12 w-12 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-default-900 mb-2">Word Builder</h1>
          <p className="text-muted-foreground text-lg">
            Build words from scrambled letters and expand your vocabulary!
          </p>
        </div>
      </div>

      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          {/* Start Screen */}
          {gameState === "start" && (
            <div className="text-center space-y-6 py-8">
              <div className="text-6xl animate-pulse">📝</div>
              <div>
                <h2 className="text-3xl font-bold text-primary mb-4">Ready to Build Words?</h2>
                <p className="text-muted-foreground mb-6">
                  Unscramble letters to form words and learn their meanings!
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-sm">
                <div className="bg-success/10 p-3 rounded-lg">
                  <div className="text-success font-bold">Easy</div>
                  <div className="text-xs text-muted-foreground">Level 1-3</div>
                </div>
                <div className="bg-warning/10 p-3 rounded-lg">
                  <div className="text-warning font-bold">Medium</div>
                  <div className="text-xs text-muted-foreground">Level 4-6</div>
                </div>
                <div className="bg-destructive/10 p-3 rounded-lg">
                  <div className="text-destructive font-bold">Hard</div>
                  <div className="text-xs text-muted-foreground">Level 7+</div>
                </div>
              </div>

              <Button onClick={startGame} size="lg" className="px-8 py-3">
                <Icon icon="ph:play" className="h-5 w-5 mr-2" />
                Start Building Words
              </Button>
            </div>
          )}

          {/* Playing Screen */}
          {gameState === "playing" && currentWord && (
            <div className="space-y-6">
              {/* Game Stats */}
              <div className="flex justify-between items-center bg-default-50 rounded-lg p-4">
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.score}</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">{stats.level}</div>
                    <div className="text-xs text-muted-foreground">Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{stats.streak}</div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className={cn(
                    "text-2xl font-bold",
                    stats.timeLeft <= 30 ? "text-destructive animate-pulse" : "text-default-900"
                  )}>
                    {Math.floor(stats.timeLeft / 60)}:{(stats.timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-muted-foreground">Time Left</div>
                </div>
              </div>

              {/* Word Area */}
              <div className="text-center space-y-4">
                <div className="text-sm text-muted-foreground">
                  Build the word ({currentWord.word.length} letters)
                </div>
                
                {/* Guess Area */}
                <div className="flex justify-center gap-2 min-h-[60px] items-center">
                  {Array.from({ length: currentWord.word.length }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-12 h-12 border-2 rounded-lg flex items-center justify-center text-xl font-bold cursor-pointer transition-all",
                        guessedWord[i] 
                          ? "bg-primary/10 border-primary text-primary hover:bg-primary/20" 
                          : "border-dashed border-default-300 bg-default-50"
                      )}
                      onClick={() => guessedWord[i] && removeLetter(i)}
                    >
                      {guessedWord[i] || ''}
                    </div>
                  ))}
                </div>

                {/* Available Letters */}
                <div className="flex justify-center gap-2 flex-wrap">
                  {shuffledLetters.map((letter, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="w-10 h-10 text-lg font-bold hover:bg-primary hover:text-white"
                      onClick={() => addLetter(letter, i)}
                    >
                      {letter}
                    </Button>
                  ))}
                </div>

                {/* Definition (with hint) */}
                {hint && (
                  <Card className="max-w-md mx-auto bg-info/5 border-info/20">
                    <CardContent className="p-4">
                      <div className="text-sm text-info-foreground">
                        <strong>Hint:</strong> {currentWord.definition}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setHint(true)}
                  variant="outline"
                  size="sm"
                  disabled={hint}
                >
                  <Icon icon="ph:lightbulb" className="h-4 w-4 mr-2" />
                  Hint
                </Button>
                <Button
                  onClick={checkAnswer}
                  disabled={!isWordComplete}
                  className={cn(
                    isWordComplete && isWordCorrect && "bg-success hover:bg-success/90"
                  )}
                >
                  <Icon icon="ph:check" className="h-4 w-4 mr-2" />
                  Check Word
                </Button>
                <Button
                  onClick={skipWord}
                  variant="outline"
                  size="sm"
                >
                  <Icon icon="ph:skip-forward" className="h-4 w-4 mr-2" />
                  Skip
                </Button>
              </div>
            </div>
          )}

          {/* Finished Screen */}
          {gameState === "finished" && (
            <div className="text-center space-y-6 py-8">
              <div className="text-6xl">🎯</div>
              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">Game Complete!</h2>
                <div className="space-y-2">
                  <p className="text-xl font-semibold">Final Score: {stats.score}</p>
                  <p className="text-lg">Level Reached: {stats.level}</p>
                  <p className="text-muted-foreground">
                    {stats.score >= 200 ? "🏆 Vocabulary Master!" :
                     stats.score >= 100 ? "🌟 Great Word Builder!" :
                     stats.score >= 50 ? "💪 Good Progress!" :
                     "📚 Keep Learning!"}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={startGame} className="px-6">
                  <Icon icon="ph:arrow-clockwise" className="h-4 w-4 mr-2" />
                  Play Again
                </Button>
                <Link href="/eduprima/break-time">
                  <Button variant="outline" className="px-6">
                    <Icon icon="ph:house" className="h-4 w-4 mr-2" />
                    Back to Games
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back Button */}
      {gameState === "start" && (
        <div className="text-center">
          <Link href="/eduprima/break-time">
            <Button variant="outline">
              <Icon icon="ph:arrow-left" className="h-4 w-4 mr-2" />
              Back to Break Time
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
} 