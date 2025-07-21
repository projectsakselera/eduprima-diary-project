export interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  difficulty: string;
  status: 'active' | 'coming-soon';
  category?: string;
}

// Function to check if a game page exists
const checkGameExists = async (gameId: string): Promise<boolean> => {
  try {
    // In a real app, you might check file system or API
    // For now, we'll check known implementations
    const existingGames = ['mood-journey', 'rhythm-breathing', 'word-builder'];
    return existingGames.includes(gameId);
  } catch {
    return false;
  }
};

// Available games configuration
export const getAvailableGames = async (): Promise<Game[]> => {
  const gameConfigs: Game[] = [
    {
      id: "mood-journey",
      title: "Mood Journey",
      description: "Navigate through your daily moods and collect self-care moments! Perfect for a 15-minute mindful break.",
      icon: "ph:smiley",
      duration: "15 min",
      difficulty: "Easy",
      status: "active",
      category: "mindfulness"
    },
    {
      id: "rhythm-breathing",
      title: "Rhythm Breathing",
      description: "Guided breathing exercises with visual cues. Perfect for anxiety relief and stress reduction with proven techniques.",
      icon: "ph:wind",
      duration: "5-20 min",
      difficulty: "All Levels",
      status: "active",
      category: "wellness"
    },
    {
      id: "memory-cards",
      title: "Memory Cards",
      description: "Challenge your memory with educational content cards.",
      icon: "ph:brain",
      duration: "10 min",
      difficulty: "Medium",
      status: "coming-soon",
      category: "cognitive"
    },
    {
      id: "word-builder",
      title: "Word Builder",
      description: "Build words from scrambled letters and expand your vocabulary with 100+ English words!",
      icon: "ph:pencil",
      duration: "3-12 min",
      difficulty: "Progressive",
      status: "active",
      category: "educational"
    },
  ];

  // Dynamically check which games actually exist
  const gamesWithStatus = await Promise.all(
    gameConfigs.map(async (game): Promise<Game> => {
      if (game.status === 'active') {
        const exists = await checkGameExists(game.id);
        return {
          ...game,
          status: exists ? ('active' as const) : ('coming-soon' as const)
        };
      }
      return game;
    })
  );

  return gamesWithStatus;
};

// Get specific game by ID
export const getGameById = async (id: string): Promise<Game | null> => {
  const games = await getAvailableGames();
  return games.find(game => game.id === id) || null;
};

// Get games by category
export const getGamesByCategory = async (category: string): Promise<Game[]> => {
  const games = await getAvailableGames();
  return games.filter(game => game.category === category);
};

// Get active games only
export const getActiveGames = async (): Promise<Game[]> => {
  const games = await getAvailableGames();
  return games.filter(game => game.status === 'active');
}; 