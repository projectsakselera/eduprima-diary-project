export interface Vocabulary {
  word: string
  definition: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

export interface VocabularyConfig {
  totalWords: number
  categories: string[]
  difficulties: {
    easy: { minLevel: number; maxLevel: number; points: number }
    medium: { minLevel: number; maxLevel: number; points: number }
    hard: { minLevel: number; maxLevel: number; points: number }
  }
}

// Game configuration
export const gameConfig: VocabularyConfig = {
  totalWords: 100,
  categories: [
    'emotions', 'places', 'nature', 'colors', 'character', 'actions',
    'education', 'skills', 'relationships', 'science', 'abstract',
    'environment', 'achievement', 'values', 'communication'
  ],
  difficulties: {
    easy: { minLevel: 1, maxLevel: 3, points: 10 },
    medium: { minLevel: 4, maxLevel: 6, points: 20 },
    hard: { minLevel: 7, maxLevel: 10, points: 30 }
  }
}

// Vocabularies database
const vocabulariesDatabase: Vocabulary[] = [
  // Easy Words (40 words)
  { word: "HAPPY", definition: "Feeling joy or pleasure", difficulty: "easy", category: "emotions" },
  { word: "HOUSE", definition: "A building for people to live in", difficulty: "easy", category: "places" },
  { word: "WATER", definition: "Clear liquid that we drink", difficulty: "easy", category: "nature" },
  { word: "LIGHT", definition: "Brightness that lets us see", difficulty: "easy", category: "nature" },
  { word: "GREEN", definition: "Color of grass and leaves", difficulty: "easy", category: "colors" },
  { word: "SWEET", definition: "Having a sugary taste", difficulty: "easy", category: "nature" },
  { word: "QUIET", definition: "Making little or no noise", difficulty: "easy", category: "nature" },
  { word: "QUICK", definition: "Moving fast or rapid", difficulty: "easy", category: "actions" },
  { word: "SMILE", definition: "Happy expression on face", difficulty: "easy", category: "emotions" },
  { word: "DREAM", definition: "Images in mind while sleeping", difficulty: "easy", category: "abstract" },
  { word: "BRAVE", definition: "Showing courage", difficulty: "easy", category: "character" },
  { word: "CLEAN", definition: "Free from dirt", difficulty: "easy", category: "nature" },
  { word: "FRESH", definition: "Recently made or obtained", difficulty: "easy", category: "nature" },
  { word: "MAGIC", definition: "Supernatural power", difficulty: "easy", category: "abstract" },
  { word: "MUSIC", definition: "Sounds that are pleasant", difficulty: "easy", category: "abstract" },
  { word: "PEACE", definition: "State of calm and quiet", difficulty: "easy", category: "emotions" },
  { word: "POWER", definition: "Strength or energy", difficulty: "easy", category: "abstract" },
  { word: "STORY", definition: "Tale or narrative", difficulty: "easy", category: "abstract" },
  { word: "TRUST", definition: "Belief in reliability", difficulty: "easy", category: "emotions" },
  { word: "WORLD", definition: "The Earth and all people", difficulty: "easy", category: "places" },
  { word: "FRIEND", definition: "Person you like and trust", difficulty: "easy", category: "relationships" },
  { word: "FLOWER", definition: "Colorful part of a plant", difficulty: "easy", category: "nature" },
  { word: "ANIMAL", definition: "Living creature that moves", difficulty: "easy", category: "nature" },
  { word: "SCHOOL", definition: "Place for learning", difficulty: "easy", category: "places" },
  { word: "FAMILY", definition: "Parents, children, relatives", difficulty: "easy", category: "relationships" },
  { word: "GARDEN", definition: "Area for growing plants", difficulty: "easy", category: "places" },
  { word: "WINTER", definition: "Cold season of the year", difficulty: "easy", category: "nature" },
  { word: "SUMMER", definition: "Warm season of the year", difficulty: "easy", category: "nature" },
  { word: "SPRING", definition: "Season when flowers bloom", difficulty: "easy", category: "nature" },
  { word: "AUTUMN", definition: "Season when leaves fall", difficulty: "easy", category: "nature" },
  { word: "FOREST", definition: "Large area with many trees", difficulty: "easy", category: "nature" },
  { word: "OCEAN", definition: "Large body of salt water", difficulty: "easy", category: "nature" },
  { word: "CHANGE", definition: "To become different", difficulty: "easy", category: "actions" },
  { word: "CREATE", definition: "To make something new", difficulty: "easy", category: "actions" },
  { word: "SIMPLE", definition: "Easy to understand", difficulty: "easy", category: "character" },
  { word: "STRONG", definition: "Having great power", difficulty: "easy", category: "character" },
  { word: "SMART", definition: "Intelligent and clever", difficulty: "easy", category: "character" },
  { word: "KIND", definition: "Caring and helpful", difficulty: "easy", category: "character" },
  { word: "FAIR", definition: "Just and reasonable", difficulty: "easy", category: "character" },
  { word: "TRUE", definition: "In accordance with fact", difficulty: "easy", category: "values" },

  // Medium Words (40 words)
  { word: "KNOWLEDGE", definition: "Information and understanding", difficulty: "medium", category: "education" },
  { word: "BEAUTIFUL", definition: "Pleasing to look at", difficulty: "medium", category: "character" },
  { word: "IMPORTANT", definition: "Having great significance", difficulty: "medium", category: "values" },
  { word: "CREATIVE", definition: "Having original ideas", difficulty: "medium", category: "skills" },
  { word: "ADVENTURE", definition: "Exciting and risky journey", difficulty: "medium", category: "abstract" },
  { word: "CHALLENGE", definition: "Difficult task or problem", difficulty: "medium", category: "abstract" },
  { word: "DISCOVERY", definition: "Finding something new", difficulty: "medium", category: "science" },
  { word: "EDUCATION", definition: "Process of learning", difficulty: "medium", category: "education" },
  { word: "FRIENDSHIP", definition: "Relationship between friends", difficulty: "medium", category: "relationships" },
  { word: "GRATITUDE", definition: "Feeling of thankfulness", difficulty: "medium", category: "emotions" },
  { word: "HAPPINESS", definition: "State of being happy", difficulty: "medium", category: "emotions" },
  { word: "IMAGINATION", definition: "Ability to form mental images", difficulty: "medium", category: "skills" },
  { word: "JOURNEY", definition: "Act of traveling somewhere", difficulty: "medium", category: "actions" },
  { word: "KINDNESS", definition: "Quality of being kind", difficulty: "medium", category: "character" },
  { word: "LEADERSHIP", definition: "Action of leading a group", difficulty: "medium", category: "skills" },
  { word: "MEMORY", definition: "Ability to remember things", difficulty: "medium", category: "skills" },
  { word: "NATURE", definition: "Physical world around us", difficulty: "medium", category: "environment" },
  { word: "OPPORTUNITY", definition: "Chance for success", difficulty: "medium", category: "abstract" },
  { word: "PATIENCE", definition: "Ability to wait calmly", difficulty: "medium", category: "character" },
  { word: "QUESTION", definition: "Sentence seeking information", difficulty: "medium", category: "communication" },
  { word: "RESPECT", definition: "Feeling of admiration", difficulty: "medium", category: "values" },
  { word: "SUCCESS", definition: "Achievement of aims", difficulty: "medium", category: "achievement" },
  { word: "TEAMWORK", definition: "Working together as group", difficulty: "medium", category: "skills" },
  { word: "UNDERSTAND", definition: "Comprehend the meaning", difficulty: "medium", category: "skills" },
  { word: "VICTORY", definition: "Success in struggle", difficulty: "medium", category: "achievement" },
  { word: "WISDOM", definition: "Quality of good judgment", difficulty: "medium", category: "values" },
  { word: "EXCELLENCE", definition: "Quality of being outstanding", difficulty: "medium", category: "values" },
  { word: "HARMONY", definition: "Pleasant combination of elements", difficulty: "medium", category: "abstract" },
  { word: "INSPIRE", definition: "Fill with urge to do something", difficulty: "medium", category: "actions" },
  { word: "JUSTICE", definition: "Fair treatment according to law", difficulty: "medium", category: "values" },
  { word: "LIBERTY", definition: "Freedom from restrictions", difficulty: "medium", category: "values" },
  { word: "MIRACLE", definition: "Extraordinary event", difficulty: "medium", category: "abstract" },
  { word: "COURAGE", definition: "Bravery in facing danger", difficulty: "medium", category: "character" },
  { word: "BALANCE", definition: "State of equilibrium", difficulty: "medium", category: "abstract" },
  { word: "COMFORT", definition: "Physical ease and freedom", difficulty: "medium", category: "emotions" },
  { word: "CULTURE", definition: "Arts and customs of people", difficulty: "medium", category: "abstract" },
  { word: "FREEDOM", definition: "Power to act without constraint", difficulty: "medium", category: "values" },
  { word: "INSIGHT", definition: "Deep understanding", difficulty: "medium", category: "skills" },
  { word: "PASSION", definition: "Strong feeling of enthusiasm", difficulty: "medium", category: "emotions" },
  { word: "PURPOSE", definition: "Reason for existence", difficulty: "medium", category: "values" },

  // Hard Words (20 words)
  { word: "PERSEVERANCE", definition: "Continued effort despite difficulties", difficulty: "hard", category: "character" },
  { word: "SOPHISTICATED", definition: "Complex and refined", difficulty: "hard", category: "character" },
  { word: "EXTRAORDINARY", definition: "Very unusual or remarkable", difficulty: "hard", category: "character" },
  { word: "PHILOSOPHICAL", definition: "Relating to study of fundamental nature", difficulty: "hard", category: "education" },
  { word: "REVOLUTIONARY", definition: "Involving complete change", difficulty: "hard", category: "actions" },
  { word: "TRANSCENDENCE", definition: "Going beyond ordinary limits", difficulty: "hard", category: "abstract" },
  { word: "CONSCIOUSNESS", definition: "State of being aware", difficulty: "hard", category: "skills" },
  { word: "TRANSFORMATION", definition: "Thorough change of form", difficulty: "hard", category: "actions" },
  { word: "ENLIGHTENMENT", definition: "Spiritual awakening", difficulty: "hard", category: "values" },
  { word: "INCOMPREHENSIBLE", definition: "Impossible to understand", difficulty: "hard", category: "character" },
  { word: "INTERDISCIPLINARY", definition: "Combining multiple fields", difficulty: "hard", category: "education" },
  { word: "ENTREPRENEURSHIP", definition: "Activity of business creation", difficulty: "hard", category: "skills" },
  { word: "SUSTAINABILITY", definition: "Ability to maintain over time", difficulty: "hard", category: "environment" },
  { word: "AUTHENTICITY", definition: "Quality of being genuine", difficulty: "hard", category: "character" },
  { word: "HUMANITARIAN", definition: "Concerned with human welfare", difficulty: "hard", category: "values" },
  { word: "UNPRECEDENTED", definition: "Never done before", difficulty: "hard", category: "character" },
  { word: "MULTIDIMENSIONAL", definition: "Having several aspects", difficulty: "hard", category: "character" },
  { word: "CRYSTALLIZATION", definition: "Formation of crystal structure", difficulty: "hard", category: "science" },
  { word: "METAMORPHOSIS", definition: "Process of transformation", difficulty: "hard", category: "actions" },
  { word: "SERENDIPITOUS", definition: "Occurring by happy chance", difficulty: "hard", category: "abstract" }
]

// API Functions
export const getVocabulariesByDifficulty = async (difficulty: 'easy' | 'medium' | 'hard'): Promise<Vocabulary[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(vocabulariesDatabase.filter(v => v.difficulty === difficulty))
    }, 100)
  })
}

export const getVocabulariesByLevel = async (level: number): Promise<Vocabulary[]> => {
  const config = gameConfig.difficulties
  
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy'
  
  if (level >= config.medium.minLevel && level <= config.medium.maxLevel) {
    difficulty = 'medium'
  } else if (level >= config.hard.minLevel) {
    difficulty = 'hard'
  }

  return getVocabulariesByDifficulty(difficulty)
}

export const getVocabulariesByCategory = async (category: string): Promise<Vocabulary[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(vocabulariesDatabase.filter(v => v.category === category))
    }, 100)
  })
}

export const getAllVocabularies = async (): Promise<Vocabulary[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...vocabulariesDatabase])
    }, 100)
  })
}

export const getRandomVocabulary = async (level: number): Promise<Vocabulary> => {
  const vocabularies = await getVocabulariesByLevel(level)
  return vocabularies[Math.floor(Math.random() * vocabularies.length)]
}

export const getGameConfig = (): VocabularyConfig => {
  return { ...gameConfig }
}

// Statistics
export const getVocabularyStats = async () => {
  const all = await getAllVocabularies()
  const byDifficulty = {
    easy: all.filter(v => v.difficulty === 'easy').length,
    medium: all.filter(v => v.difficulty === 'medium').length,
    hard: all.filter(v => v.difficulty === 'hard').length
  }
  
  const byCategory = gameConfig.categories.reduce((acc, cat) => {
    acc[cat] = all.filter(v => v.category === cat).length
    return acc
  }, {} as Record<string, number>)

  return {
    total: all.length,
    byDifficulty,
    byCategory,
    categories: gameConfig.categories
  }
} 