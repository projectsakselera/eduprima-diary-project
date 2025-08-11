/**
 * Extended Fuzzy Matcher
 * Handles location, subjects, banks, and category name matching with similarity scoring for import validation
 */

// Levenshtein Distance Algorithm
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Calculate similarity percentage (0-100)
export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const clean1 = str1.toLowerCase().trim();
  const clean2 = str2.toLowerCase().trim();
  
  if (clean1 === clean2) return 100;
  
  const maxLen = Math.max(clean1.length, clean2.length);
  const distance = levenshteinDistance(clean1, clean2);
  
  return Math.round(((maxLen - distance) / maxLen) * 100);
}

// Advanced matching with multiple strategies
export function advancedSimilarity(input: string, target: string): number {
  const clean1 = input.toLowerCase().trim();
  const clean2 = target.toLowerCase().trim();
  
  // Strategy 1: Exact match
  if (clean1 === clean2) return 100;
  
  // Strategy 1.5: Common prefix/suffix patterns (NEW)
  const prefixSuffixScore = checkCommonPatterns(clean1, clean2);
  if (prefixSuffixScore > 0) {
    // If we have a good pattern match, boost the score
    return Math.max(prefixSuffixScore, advancedSimilarityCore(clean1, clean2));
  }
  
  return advancedSimilarityCore(clean1, clean2);
}

// Check for common prefix/suffix patterns
function checkCommonPatterns(input: string, target: string): number {
  // Common bank prefixes/suffixes
  const bankPrefixes = ['bank ', 'pt bank ', 'pt. bank '];
  const bankSuffixes = [' indonesia', ' tbk', ' persero'];
  
  // Common location prefixes/suffixes  
  const locationPrefixes = ['kota ', 'kabupaten ', 'kab ', 'kec ', 'kel '];
  const locationSuffixes = [' utara', ' selatan', ' timur', ' barat', ' tengah'];
  
  let bestScore = 0;
  
  // Check if target has common prefix and input is the core name
  for (const prefix of [...bankPrefixes, ...locationPrefixes]) {
    if (target.startsWith(prefix)) {
      const targetCore = target.substring(prefix.length);
      if (input === targetCore) {
        bestScore = Math.max(bestScore, 95); // Very high score for exact core match
      } else {
        const coreScore = calculateSimilarity(input, targetCore);
        if (coreScore > 80) {
          bestScore = Math.max(bestScore, Math.min(90, coreScore + 10)); // Boost core similarity
        }
      }
    }
  }
  
  // Check if target has common suffix and input is the core name
  for (const suffix of [...bankSuffixes, ...locationSuffixes]) {
    if (target.endsWith(suffix)) {
      const targetCore = target.substring(0, target.length - suffix.length).trim();
      if (input === targetCore) {
        bestScore = Math.max(bestScore, 95); // Very high score for exact core match
      } else {
        const coreScore = calculateSimilarity(input, targetCore);
        if (coreScore > 80) {
          bestScore = Math.max(bestScore, Math.min(90, coreScore + 10)); // Boost core similarity
        }
      }
    }
  }
  
  // Check reverse: if input has prefix/suffix and target is core
  for (const prefix of [...bankPrefixes, ...locationPrefixes]) {
    if (input.startsWith(prefix)) {
      const inputCore = input.substring(prefix.length);
      if (inputCore === target) {
        bestScore = Math.max(bestScore, 95);
      } else {
        const coreScore = calculateSimilarity(inputCore, target);
        if (coreScore > 80) {
          bestScore = Math.max(bestScore, Math.min(90, coreScore + 10));
        }
      }
    }
  }
  
  return bestScore;
}

// Core advanced similarity logic (original implementation)
function advancedSimilarityCore(clean1: string, clean2: string): number {
  
  // Strategy 2: Contains check (for abbreviations and partial matches)
  let containsScore = 0;
  if (clean2.includes(clean1) || clean1.includes(clean2)) {
    const shorterLen = Math.min(clean1.length, clean2.length);
    const longerLen = Math.max(clean1.length, clean2.length);
    
    // Better scoring for partial matches
    if (shorterLen >= 4) { // At least 4 characters for meaningful match
      containsScore = Math.round((shorterLen / longerLen) * 90); // Max 90% for partial match
    } else if (shorterLen >= 2) { // 2-3 characters
      containsScore = Math.round((shorterLen / longerLen) * 75); // Lower score for very short matches
    }
  }
  
  // Strategy 3: Word-based matching
  const words1 = clean1.split(/\s+/);
  const words2 = clean2.split(/\s+/);
  
  let wordMatches = 0;
  let perfectWordMatches = 0;
  
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2) {
        wordMatches++;
        perfectWordMatches++;
        break;
      } else if (calculateSimilarity(word1, word2) > 80) {
        wordMatches++;
        break;
      }
    }
  }
  
  // Special case: if input is single word and matches any word in target perfectly
  let wordSimilarity = 0;
  if (words1.length === 1 && perfectWordMatches > 0) {
    // Single word input that matches perfectly in multi-word target gets high score
    wordSimilarity = 80; // High score for single word matches
  } else if (perfectWordMatches > 0) {
    // If any word matches perfectly, give higher base score
    wordSimilarity = (wordMatches / Math.max(words1.length, words2.length)) * 85;
    // Bonus for perfect word matches
    wordSimilarity += (perfectWordMatches / Math.max(words1.length, words2.length)) * 10;
  } else {
    wordSimilarity = (wordMatches / Math.max(words1.length, words2.length)) * 75;
  }
  
  // Strategy 4: Character-based similarity
  const charSimilarity = calculateSimilarity(clean1, clean2);
  
  // Return the highest score from all strategies
  return Math.max(containsScore, wordSimilarity, charSimilarity);
}

// Extended aliases for all database fields
export const FIELD_ALIASES: Record<string, Record<string, string>> = {
  provinces: {
    'diy': 'daerah istimewa yogyakarta',
    'dki': 'dki jakarta',
    'jabar': 'jawa barat',
    'jateng': 'jawa tengah', 
    'jatim': 'jawa timur',
    'sumut': 'sumatera utara',
    'sumbar': 'sumatera barat',
    'sumsel': 'sumatera selatan',
    'kalbar': 'kalimantan barat',
    'kaltim': 'kalimantan timur',
    'kalsel': 'kalimantan selatan',
    'sulteng': 'sulawesi tengah',
    'sulsel': 'sulawesi selatan',
    'sulut': 'sulawesi utara',
  },
  cities: {
    'jogja': 'yogyakarta',
    'yogya': 'yogyakarta',
    'bdg': 'bandung',
    'sby': 'surabaya',
    'jkt': 'jakarta',
    'bekasi': 'kota bekasi',
    'depok': 'kota depok',
    'tangerang': 'kota tangerang',
    'bogor': 'kota bogor',
    'medan': 'kota medan',
    'palembang': 'kota palembang',
    'makassar': 'kota makassar',
    'denpasar': 'kota denpasar',
    'balikpapan': 'kota balikpapan',
    'malang': 'kota malang',
    'solo': 'kota surakarta',
    'semarang': 'kota semarang',
    'pekanbaru': 'kota pekanbaru',
    'banjarmasin': 'kota banjarmasin',
    'manado': 'kota manado',
  },
  
  // Subject/Program aliases (common abbreviations)
  subjects: {
    'mtk': 'matematika',
    'math': 'matematika',
    'mat': 'matematika',
    'fisika': 'fisika',
    'fis': 'fisika',
    'kimia': 'kimia',
    'kim': 'kimia',
    'biologi': 'biologi',
    'bio': 'biologi',
    'bahasa indonesia': 'bahasa indonesia',
    'bind': 'bahasa indonesia',
    'b.indonesia': 'bahasa indonesia',
    'bahasa inggris': 'bahasa inggris',
    'bing': 'bahasa inggris',
    'b.inggris': 'bahasa inggris',
    'english': 'bahasa inggris',
    'ekonomi': 'ekonomi',
    'eko': 'ekonomi',
    'akuntansi': 'akuntansi',
    'sejarah': 'sejarah',
    'geografi': 'geografi',
    'geo': 'geografi',
    'pkn': 'pendidikan kewarganegaraan',
    'ppkn': 'pendidikan kewarganegaraan',
    'sosiologi': 'sosiologi',
    'seni budaya': 'seni budaya',
    'sbk': 'seni budaya',
    'pjok': 'pendidikan jasmani',
    'penjas': 'pendidikan jasmani',
    'ipa': 'ilmu pengetahuan alam',
    'ips': 'ilmu pengetahuan sosial',
    'tik': 'teknologi informasi dan komunikasi',
    'komputer': 'teknologi informasi dan komunikasi',
  },
  
  // Bank aliases (common abbreviations)
  banks: {
    'bca': 'bank central asia',
    'bri': 'bank rakyat indonesia',
    'bni': 'bank negara indonesia',
    'mandiri': 'bank mandiri',
    'btn': 'bank tabungan negara',
    'bsi': 'bank syariah indonesia',
    'danamon': 'bank danamon',
    'cimb': 'cimb niaga',
    'permata': 'bank permata',
    'ocbc': 'ocbc nisp',
    'uob': 'united overseas bank',
    'hsbc': 'hongkong and shanghai banking corporation',
    'maybank': 'maybank indonesia',
    'panin': 'panin bank',
    'mega': 'bank mega',
    'bukopin': 'bank bukopin',
    'bjb': 'bank jabar banten',
    'jateng': 'bank jawa tengah',
    'jatim': 'bank jawa timur',
    'sumut': 'bank sumatera utara',
    'kalbar': 'bank kalimantan barat',
    'kaltim': 'bank kalimantan timur',
    'sulselbar': 'bank sulselbar',
  },
  
  // Category aliases
  categories: {
    'sd': 'sekolah dasar',
    'smp': 'sekolah menengah pertama',
    'sma': 'sekolah menengah atas',
    'smk': 'sekolah menengah kejuruan',
    'tk': 'taman kanak-kanak',
    'kuliah': 'universitas',
    'univ': 'universitas',
    'perguruan tinggi': 'universitas',
    'paud': 'pendidikan anak usia dini',
    'sb': 'sekolah berkebutuhan khusus',
    'sbk': 'sekolah berkebutuhan khusus',
  }
};

// Generic fuzzy matching interface for all field types
export interface FieldMatch {
  id: string;
  name: string;
  local_name?: string | null;
  alternate_name?: string | null; // For subjects, banks, etc.
  similarity: number;
  matchType: 'exact' | 'alias' | 'fuzzy' | 'partial';
  metadata?: Record<string, any>; // Additional field-specific data
}

// Backward compatibility
export type LocationMatch = FieldMatch;

// Generic field matching function
export function findBestFieldMatches(
  searchTerm: string,
  data: Array<{id: string, name: string, local_name?: string | null, alternate_name?: string | null}>,
  type: 'provinces' | 'cities' | 'subjects' | 'banks' | 'categories' = 'cities'
): FieldMatch[] {
  // === NULL/UNDEFINED SAFETY ===
  if (!searchTerm || typeof searchTerm !== 'string') {
    console.warn(`⚠️ Invalid searchTerm for ${type}:`, searchTerm);
    return [];
  }
  
  if (!data || !Array.isArray(data)) {
    console.warn(`⚠️ Invalid data array for ${type}:`, data);
    return [];
  }
  
  const cleanSearch = searchTerm.toLowerCase().trim();
  if (!cleanSearch) {
    console.warn(`⚠️ Empty search term after cleaning for ${type}`);
    return [];
  }
  
  const matches: FieldMatch[] = [];
  
  for (const item of data) {
    // === ITEM SAFETY CHECKS ===
    if (!item || !item.name || typeof item.name !== 'string') {
      console.warn(`⚠️ Invalid item in ${type} data:`, item);
      continue;
    }
    
    const itemName = item.name.toLowerCase();
    const localName = item.local_name?.toLowerCase() || '';
    const alternateName = item.alternate_name?.toLowerCase() || '';
    
    let bestScore = 0;
    let matchType: FieldMatch['matchType'] = 'fuzzy';
    
    // 1. Exact match (check all name variations)
    if (cleanSearch === itemName || cleanSearch === localName || cleanSearch === alternateName) {
      bestScore = 100;
      matchType = 'exact';
    }
    // 2. Alias match
    else if (FIELD_ALIASES[type] && FIELD_ALIASES[type][cleanSearch]) {
      const aliasTarget = FIELD_ALIASES[type][cleanSearch];
      if (itemName.includes(aliasTarget) || aliasTarget.includes(itemName) ||
          localName.includes(aliasTarget) || aliasTarget.includes(localName) ||
          alternateName.includes(aliasTarget) || aliasTarget.includes(alternateName)) {
        bestScore = 95;
        matchType = 'alias';
      }
    }
    // 3. Advanced similarity (check all name variations)
    else {
      const nameScore = advancedSimilarity(cleanSearch, itemName);
      const localScore = localName ? advancedSimilarity(cleanSearch, localName) : 0;
      const alternateScore = alternateName ? advancedSimilarity(cleanSearch, alternateName) : 0;
      bestScore = Math.max(nameScore, localScore, alternateScore);
      
      if (bestScore > 70) {
        matchType = bestScore > 85 ? 'partial' : 'fuzzy';
      }
    }
    
    if (bestScore > 50) { // More lenient threshold for partial matches
      matches.push({
        id: item.id,
        name: item.name,
        local_name: item.local_name,
        alternate_name: item.alternate_name,
        similarity: bestScore,
        matchType
      });
    }
  }
  
  // Sort by similarity score (highest first)
  return matches.sort((a, b) => b.similarity - a.similarity);
}

// Backward compatibility function for locations
export function findBestLocationMatches(
  searchTerm: string,
  locations: Array<{id: string, name: string, local_name?: string | null}>,
  type: 'provinces' | 'cities' = 'cities'
): LocationMatch[] {
  return findBestFieldMatches(searchTerm, locations, type);
}

// Specialized functions for different field types
export function findBestSubjectMatches(
  searchTerm: string,
  subjects: Array<{id: string, name: string, local_name?: string | null, alternate_name?: string | null}>
): FieldMatch[] {
  return findBestFieldMatches(searchTerm, subjects, 'subjects');
}

export function findBestBankMatches(
  searchTerm: string,
  banks: Array<{id: string, name: string, local_name?: string | null, alternate_name?: string | null}>
): FieldMatch[] {
  return findBestFieldMatches(searchTerm, banks, 'banks');
}

export function findBestCategoryMatches(
  searchTerm: string,
  categories: Array<{id: string, name: string, local_name?: string | null, alternate_name?: string | null}>
): FieldMatch[] {
  return findBestFieldMatches(searchTerm, categories, 'categories');
}

// Quick test function
export function testLocationMatching() {
  const testCases = [
    { input: 'jogja', target: 'Yogyakarta' },
    { input: 'bdg', target: 'Bandung' },
    { input: 'jakarta', target: 'DKI Jakarta' },
    { input: 'sby', target: 'Surabaya' },
    { input: 'semarang', target: 'Kota Semarang' },
  ];
  
  console.log('🧪 Testing Location Fuzzy Matching:');
  testCases.forEach(({ input, target }) => {
    const similarity = advancedSimilarity(input, target);
    console.log(`"${input}" → "${target}": ${similarity}%`);
  });
}