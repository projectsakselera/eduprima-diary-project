import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Types
interface SearchQuery {
  freeText?: string;
  subjects?: string[];
  location?: {
    address?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  };
  priceRange?: [number, number];
  availability?: string[];
  teachingStyle?: string[];
  experience?: string;
  rating?: number;
}

interface UserPreferences {
  weights: {
    distance: number;
    price: number;
    experience: number;
    availability: number;
    subjects: number;
    rating: number;
  };
  defaultRadius: number;
  maxPrice: number;
  preferredTeachingStyle: string[];
}

interface TutorResult {
  id: string;
  nama_lengkap: string;
  email: string;
  foto_profil?: string;
  subjects: string[];
  tariff_per_jam: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  experience: string;
  rating: number;
  availability: string[];
  teaching_style: string[];
  distance?: number;
  matchScore?: number;
  matchBreakdown?: {
    distance: number;
    price: number;
    experience: number;
    availability: number;
    subjects: number;
    rating: number;
  };
}

// Smart keyword processing
const processKeywords = (text: string) => {
  const keywords = text.toLowerCase().split(/\s+/);
  
  const subjectMappings: Record<string, string[]> = {
    'matematika': ['Matematika', 'Aljabar', 'Kalkulus', 'Geometri', 'Statistika'],
    'math': ['Matematika', 'Aljabar', 'Kalkulus', 'Geometri', 'Statistika'],
    'fisika': ['Fisika', 'Mekanika', 'Termodinamika', 'Elektromagnetik'], 
    'physics': ['Fisika', 'Mekanika', 'Termodinamika', 'Elektromagnetik'],
    'kimia': ['Kimia', 'Kimia Organik', 'Kimia Anorganik'],
    'chemistry': ['Kimia', 'Kimia Organik', 'Kimia Anorganik'],
    'biologi': ['Biologi', 'Genetika', 'Ekologi'],
    'biology': ['Biologi', 'Genetika', 'Ekologi'],
    'bahasa': ['Bahasa Indonesia', 'Bahasa Inggris'],
    'english': ['Bahasa Inggris', 'TOEFL', 'IELTS'],
    'inggris': ['Bahasa Inggris', 'TOEFL', 'IELTS'],
    'ekonomi': ['Ekonomi', 'Akuntansi', 'Manajemen'],
    'economics': ['Ekonomi', 'Akuntansi', 'Manajemen'],
    'programming': ['Programming', 'Python', 'JavaScript', 'Web Development'],
    'coding': ['Programming', 'Python', 'JavaScript', 'Web Development'],
    'arab': ['Bahasa Arab', 'Tahsin', 'Tahfidz'],
    'arabic': ['Bahasa Arab', 'Tahsin', 'Tahfidz']
  };

  const locationMappings: Record<string, string[]> = {
    'jakarta': ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Timur', 'Jakarta Barat'],
    'bekasi': ['Bekasi Timur', 'Bekasi Barat', 'Bekasi Selatan', 'Bekasi Utara'],
    'tangerang': ['Tangerang', 'Tangerang Selatan'],
    'depok': ['Depok'],
    'bogor': ['Bogor']
  };

  const extracted = {
    subjects: [] as string[],
    locations: [] as string[],
    priceRange: null as [number, number] | null,
    originalText: text
  };

  // Extract subjects with better pattern recognition
  keywords.forEach(keyword => {
    // Direct subject match
    if (subjectMappings[keyword]) {
      extracted.subjects.push(...subjectMappings[keyword]);
    }
    
    // Check for "guru [subject]" pattern
    const guruIndex = keywords.indexOf('guru');
    if (guruIndex !== -1 && guruIndex < keywords.length - 1) {
      const nextWord = keywords[guruIndex + 1];
      if (subjectMappings[nextWord]) {
        extracted.subjects.push(...subjectMappings[nextWord]);
      }
    }
    
    // Partial matching for common subjects
    Object.keys(subjectMappings).forEach(key => {
      if (keyword.includes(key) || key.includes(keyword)) {
        extracted.subjects.push(...subjectMappings[key]);
      }
    });
  });

  // Extract locations
  keywords.forEach(keyword => {
    if (locationMappings[keyword]) {
      extracted.locations.push(...locationMappings[keyword]);
    }
  });

  // Extract price range (e.g., "150k-200k", "100000-150000")
  const priceMatch = text.match(/(\d+)k?\s*-\s*(\d+)k?/i);
  if (priceMatch) {
    const min = parseInt(priceMatch[1]) * (priceMatch[1].includes('k') ? 1000 : 1);
    const max = parseInt(priceMatch[2]) * (priceMatch[2].includes('k') ? 1000 : 1);
    extracted.priceRange = [min, max];
  }

  // Remove duplicates
  extracted.subjects = [...new Set(extracted.subjects)];
  extracted.locations = [...new Set(extracted.locations)];
  
  // Debug logging
  console.log('🔍 NLP Processing:', {
    originalText: text,
    keywords,
    extractedSubjects: extracted.subjects,
    extractedPriceRange: extracted.priceRange,
    extractedLocations: extracted.locations
  });

  return extracted;
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate match score based on user preferences
const calculateMatchScore = (tutor: any, query: SearchQuery, preferences: UserPreferences, userLocation?: {lat: number, lng: number}) => {
  const scores = {
    distance: 100,
    price: 100,
    experience: 70, // Default score
    availability: 80, // Default score
    subjects: 0,
    rating: tutor.rating || 70
  };

  // Distance score
  if (userLocation && tutor.titik_lokasi_lat && tutor.titik_lokasi_lng) {
    const distance = calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      tutor.titik_lokasi_lat, 
      tutor.titik_lokasi_lng
    );
    scores.distance = Math.max(0, 100 - (distance * 5)); // Decrease score by 5 points per km
  }

  // Price score (lower price = higher score)
  if (query.priceRange) {
    const [minPrice, maxPrice] = query.priceRange;
    const tutorPrice = tutor.tariff_per_jam;
    if (tutorPrice <= maxPrice) {
      scores.price = Math.max(0, 100 - ((tutorPrice - minPrice) / (maxPrice - minPrice)) * 50);
    } else {
      scores.price = Math.max(0, 100 - ((tutorPrice - maxPrice) / maxPrice) * 100);
    }
  }

  // Subject match score
  if (query.subjects && query.subjects.length > 0) {
    const tutorSubjects = [
      ...(tutor.mata_pelajaran_sd || []),
      ...(tutor.mata_pelajaran_smp || []),
      ...(tutor.mata_pelajaran_sma_ipa || []),
      ...(tutor.mata_pelajaran_sma_ips || []),
      ...(tutor.mata_pelajaran_universitas || [])
    ];
    
    const matchCount = query.subjects.filter(subject => 
      tutorSubjects.some(tutorSubject => 
        tutorSubject.toLowerCase().includes(subject.toLowerCase()) ||
        subject.toLowerCase().includes(tutorSubject.toLowerCase())
      )
    ).length;
    
    scores.subjects = (matchCount / query.subjects.length) * 100;
  } else {
    scores.subjects = 80; // Default if no specific subjects requested
  }

  // Calculate weighted composite score
  const { weights } = preferences;
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  
  const compositeScore = (
    (scores.distance * weights.distance) +
    (scores.price * weights.price) +
    (scores.experience * weights.experience) +
    (scores.availability * weights.availability) +
    (scores.subjects * weights.subjects) +
    (scores.rating * weights.rating)
  ) / totalWeight;

  return {
    compositeScore: Math.round(compositeScore),
    breakdown: scores
  };
};

// Mock tutor data for testing
const getMockTutors = () => [
  {
    id: '1',
    nama_lengkap: 'Dr. Sarah Matematika',
    email: 'sarah.math@eduprima.id',
    foto_profil: '/images/avatar/av-1.jpg',
    subjects: ['Matematika', 'Aljabar', 'Kalkulus', 'Statistika'],
    tariff_per_jam: 180000,
    location: { lat: -6.200000, lng: 106.816666, address: 'Jakarta Selatan' },
    experience: 'S2 Matematika ITB, 8+ tahun mengajar',
    rating: 95,
    availability: ['Senin', 'Rabu', 'Jumat'],
    teaching_style: ['Interactive', 'Problem-based'],
    titik_lokasi_lat: -6.200000,
    titik_lokasi_lng: 106.816666,
    alamat_titik_lokasi: 'Kemang, Jakarta Selatan'
  },
  {
    id: '2',
    nama_lengkap: 'Prof. Ahmad Fisika',
    email: 'ahmad.physics@eduprima.id',
    foto_profil: '/images/avatar/av-2.jpg',
    subjects: ['Fisika', 'Mekanika', 'Termodinamika'],
    tariff_per_jam: 200000,
    location: { lat: -6.175110, lng: 106.865036, address: 'Jakarta Timur' },
    experience: 'PhD Fisika UI, 12+ tahun mengajar',
    rating: 92,
    availability: ['Selasa', 'Kamis', 'Sabtu'],
    teaching_style: ['Conceptual', 'Hands-on'],
    titik_lokasi_lat: -6.175110,
    titik_lokasi_lng: 106.865036,
    alamat_titik_lokasi: 'Cawang, Jakarta Timur'
  },
  {
    id: '3',
    nama_lengkap: 'Ibu Siti Kimia',
    email: 'siti.chemistry@eduprima.id',
    foto_profil: '/images/avatar/av-3.jpg',
    subjects: ['Kimia', 'Kimia Organik', 'Kimia Anorganik'],
    tariff_per_jam: 150000,
    location: { lat: -6.228728, lng: 106.751537, address: 'Jakarta Barat' },
    experience: 'S1 Kimia UNPAD, 5+ tahun mengajar',
    rating: 88,
    availability: ['Senin', 'Selasa', 'Rabu'],
    teaching_style: ['Visual', 'Interactive'],
    titik_lokasi_lat: -6.228728,
    titik_lokasi_lng: 106.751537,
    alamat_titik_lokasi: 'Kebon Jeruk, Jakarta Barat'
  },
  {
    id: '4',
    nama_lengkap: 'Mr. John English',
    email: 'john.english@eduprima.id',
    foto_profil: '/images/avatar/av-4.jpg',
    subjects: ['Bahasa Inggris', 'TOEFL', 'IELTS', 'Conversation'],
    tariff_per_jam: 170000,
    location: { lat: -6.214651, lng: 106.845599, address: 'Jakarta Pusat' },
    experience: 'Native Speaker, TESOL Certified, 6+ tahun',
    rating: 90,
    availability: ['Senin', 'Rabu', 'Jumat', 'Sabtu'],
    teaching_style: ['Communicative', 'Interactive'],
    titik_lokasi_lat: -6.214651,
    titik_lokasi_lng: 106.845599,
    alamat_titik_lokasi: 'Menteng, Jakarta Pusat'
  },
  {
    id: '5',
    nama_lengkap: 'Pak Rudi Ekonomi',
    email: 'rudi.economics@eduprima.id',
    foto_profil: '/images/avatar/av-5.jpg',
    subjects: ['Ekonomi', 'Akuntansi', 'Manajemen'],
    tariff_per_jam: 140000,
    location: { lat: -6.364901, lng: 106.822777, address: 'Depok' },
    experience: 'S2 Ekonomi UI, 7+ tahun mengajar',
    rating: 87,
    availability: ['Selasa', 'Kamis', 'Minggu'],
    teaching_style: ['Case-study', 'Discussion'],
    titik_lokasi_lat: -6.364901,
    titik_lokasi_lng: 106.822777,
    alamat_titik_lokasi: 'Margonda, Depok'
  },
  {
    id: '6',
    nama_lengkap: 'Dr. Lisa Biologi',
    email: 'lisa.biology@eduprima.id',
    foto_profil: '/images/avatar/av-6.jpg',
    subjects: ['Biologi', 'Genetika', 'Ekologi'],
    tariff_per_jam: 165000,
    location: { lat: -6.241586, lng: 106.708542, address: 'Tangerang' },
    experience: 'PhD Biologi ITB, 9+ tahun mengajar',
    rating: 93,
    availability: ['Senin', 'Rabu', 'Jumat'],
    teaching_style: ['Laboratory', 'Visual'],
    titik_lokasi_lat: -6.241586,
    titik_lokasi_lng: 106.708542,
    alamat_titik_lokasi: 'Bintaro, Tangerang Selatan'
  },
  {
    id: '7',
    nama_lengkap: 'Ustadz Mahmud Arab',
    email: 'mahmud.arabic@eduprima.id',
    foto_profil: '/images/avatar/av-7.jpg',
    subjects: ['Bahasa Arab', 'Tahsin', 'Tahfidz'],
    tariff_per_jam: 120000,
    location: { lat: -6.234077, lng: 106.992416, address: 'Bekasi' },
    experience: 'Alumni Al-Azhar, 10+ tahun mengajar',
    rating: 91,
    availability: ['Setiap Hari'],
    teaching_style: ['Traditional', 'Memorization'],
    titik_lokasi_lat: -6.234077,
    titik_lokasi_lng: 106.992416,
    alamat_titik_lokasi: 'Bekasi Timur'
  },
  {
    id: '8',
    nama_lengkap: 'Ms. Jenny Programming',
    email: 'jenny.coding@eduprima.id',
    foto_profil: '/images/avatar/av-8.jpg',
    subjects: ['Programming', 'Python', 'JavaScript', 'Web Development'],
    tariff_per_jam: 220000,
    location: { lat: -6.2088, lng: 106.8456, address: 'Jakarta Pusat' },
    experience: 'Senior Developer, 5+ tahun mengajar coding',
    rating: 96,
    availability: ['Sabtu', 'Minggu'],
    teaching_style: ['Project-based', 'Hands-on'],
    titik_lokasi_lat: -6.2088,
    titik_lokasi_lng: 106.8456,
    alamat_titik_lokasi: 'Sudirman, Jakarta Pusat'
  }
];

// Main search function with mock data
async function searchTutors(query: SearchQuery, preferences: UserPreferences, userLocation?: {lat: number, lng: number}) {
  const startTime = Date.now();

  // Get mock tutors
  const mockTutors = getMockTutors();
  
  // Filter based on query
  let filteredTutors = mockTutors;

  // Filter by subjects if specified
  if (query.subjects && query.subjects.length > 0) {
    filteredTutors = filteredTutors.filter(tutor => 
      query.subjects!.some(querySubject => 
        tutor.subjects.some(tutorSubject => 
          tutorSubject.toLowerCase().includes(querySubject.toLowerCase()) ||
          querySubject.toLowerCase().includes(tutorSubject.toLowerCase())
        )
      )
    );
  }

  // Filter by price range if specified
  if (query.priceRange) {
    const [minPrice, maxPrice] = query.priceRange;
    filteredTutors = filteredTutors.filter(tutor => 
      tutor.tariff_per_jam >= minPrice && tutor.tariff_per_jam <= maxPrice
    );
  }

  // Process and score results
  const processedResults: TutorResult[] = filteredTutors
    .map((tutor: any) => {
      const { compositeScore, breakdown } = calculateMatchScore(tutor, query, preferences, userLocation);
      
      // Calculate distance if location available
      let distance: number | undefined;
      if (userLocation && tutor.titik_lokasi_lat && tutor.titik_lokasi_lng) {
        distance = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          tutor.titik_lokasi_lat, 
          tutor.titik_lokasi_lng
        );
      }

      return {
        id: tutor.id,
        nama_lengkap: tutor.nama_lengkap,
        email: tutor.email,
        foto_profil: tutor.foto_profil,
        subjects: tutor.subjects,
        tariff_per_jam: tutor.tariff_per_jam,
        location: {
          lat: tutor.titik_lokasi_lat,
          lng: tutor.titik_lokasi_lng,
          address: tutor.alamat_titik_lokasi
        },
        experience: tutor.experience,
        rating: tutor.rating,
        availability: tutor.availability,
        teaching_style: tutor.teaching_style,
        distance,
        matchScore: compositeScore,
        matchBreakdown: breakdown
      };
    })
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)) // Sort by match score
    .slice(0, 50); // Limit to top 50 results

  return {
    results: processedResults,
    searchStats: {
      totalResults: processedResults.length,
      searchTime: Date.now() - startTime
    }
  };
}

// API Route Handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, preferences, userLocation } = body;

    // Process free text if provided
    if (query.freeText) {
      const processed = processKeywords(query.freeText);
      if (processed.subjects.length > 0) {
        query.subjects = [...(query.subjects || []), ...processed.subjects];
      }
      if (processed.priceRange) {
        query.priceRange = processed.priceRange;
      }
    }

    const searchResults = await searchTutors(query, preferences, userLocation);
    
    return NextResponse.json({
      success: true,
      data: searchResults
    });

  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Smart Tutor Search API',
    endpoints: {
      POST: 'Search tutors with query and preferences',
    },
    example: {
      query: {
        freeText: 'guru matematika jakarta 150k-200k',
        subjects: ['Matematika'],
        priceRange: [150000, 200000]
      },
      preferences: {
        weights: {
          distance: 60,
          price: 70,
          experience: 80,
          availability: 60,
          subjects: 90,
          rating: 75
        }
      }
    }
  });
} 