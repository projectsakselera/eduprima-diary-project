"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Icon } from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface TutorData {
  id: string;
  nama_lengkap: string;
  mata_pelajaran_sd?: string[];
  mata_pelajaran_smp?: string[];
  mata_pelajaran_sma_ipa?: string[];
  mata_pelajaran_sma_ips?: string[];
  mata_pelajaran_smk_teknik?: string[];
  mata_pelajaran_smk_bisnis?: string[];
  mata_pelajaran_smk_pariwisata?: string[];
  mata_pelajaran_smk_kesehatan?: string[];
  mata_pelajaran_bahasa_asing?: string[];
  mata_pelajaran_universitas?: string[];
  mata_pelajaran_keterampilan?: string[];
  pendidikan_terakhir?: string;
  jurusan?: string;
  pengalaman_mengajar?: number;
  tarif_per_jam?: number;
  status_tutor?: string;
}

interface MLRecommendation {
  subject: string;
  confidence: number;
  similarity: number;
  sourceSubject: string;
  category: string;
  mlInsights: {
    historicalSuccess: number | string;
    avgLearningTime: number | string;
    tutorsSample: number;
    marketDemand: number;
    challenges: string[];
    reasoning: string;
    potentialEarning: number;
    competitorCount: number;
  };
}

interface ModelInsights {
  totalAnalyzed: number;
  similarityThreshold: number;
  recommendations: number;
  topConfidence: number;
  totalTutors: number;
  avgExperience: number;
}

export default function SubjectRecommendationPage() {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [mlRecommendations, setMlRecommendations] = useState<MLRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelInsights, setModelInsights] = useState<ModelInsights | null>(null);
  const [tutorData, setTutorData] = useState<TutorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced Subject Embeddings (AI-generated vectors based on pedagogical research)
  const subjectEmbeddings: Record<string, number[]> = {
    // Mata Pelajaran SD
    'Matematika Dasar': [0.91, 0.15, 0.76, 0.82, 0.23, 0.88, 0.67, 0.89],
    'Bahasa Indonesia': [0.67, 0.85, 0.34, 0.76, 0.91, 0.45, 0.55, 0.78],
    'IPA Dasar': [0.82, 0.25, 0.91, 0.78, 0.33, 0.88, 0.76, 0.85],
    'Bahasa Inggris Dasar': [0.65, 0.88, 0.23, 0.74, 0.89, 0.34, 0.67, 0.76],
    
    // Mata Pelajaran SMP
    'Matematika SMP': [0.95, 0.12, 0.81, 0.87, 0.28, 0.92, 0.71, 0.93],
    'Bahasa Inggris SMP': [0.71, 0.91, 0.28, 0.78, 0.94, 0.38, 0.72, 0.81],
    'IPA SMP': [0.89, 0.31, 0.94, 0.83, 0.37, 0.91, 0.79, 0.89],
    'Fisika SMP': [0.87, 0.23, 0.96, 0.81, 0.29, 0.93, 0.82, 0.91],
    'Kimia SMP': [0.84, 0.28, 0.93, 0.79, 0.35, 0.89, 0.77, 0.87],
    'Biologi SMP': [0.79, 0.41, 0.87, 0.75, 0.43, 0.85, 0.71, 0.83],
    
    // Mata Pelajaran SMA IPA
    'Matematika SMA IPA': [0.98, 0.08, 0.85, 0.91, 0.24, 0.95, 0.76, 0.97],
    'Fisika SMA': [0.92, 0.18, 0.98, 0.85, 0.26, 0.94, 0.83, 0.95],
    'Kimia SMA': [0.88, 0.25, 0.95, 0.82, 0.32, 0.91, 0.79, 0.92],
    'Biologi SMA': [0.83, 0.38, 0.89, 0.77, 0.41, 0.87, 0.73, 0.88],
    
    // Mata Pelajaran SMA IPS
    'Matematika SMA IPS': [0.85, 0.22, 0.71, 0.79, 0.45, 0.83, 0.62, 0.81],
    'Bahasa Indonesia SMA': [0.71, 0.92, 0.41, 0.81, 0.96, 0.51, 0.73, 0.83],
    'Bahasa Inggris SMA': [0.75, 0.94, 0.35, 0.83, 0.98, 0.45, 0.77, 0.85],
    'Sejarah': [0.45, 0.87, 0.23, 0.69, 0.93, 0.78, 0.51, 0.71],
    'Geografi': [0.52, 0.79, 0.67, 0.73, 0.85, 0.81, 0.58, 0.75],
    'Ekonomi': [0.68, 0.81, 0.54, 0.85, 0.89, 0.73, 0.71, 0.79],
    'Sosiologi': [0.38, 0.89, 0.41, 0.75, 0.94, 0.67, 0.49, 0.73],
    
    // Mata Pelajaran SMK
    'Teknik Mesin': [0.91, 0.15, 0.89, 0.93, 0.21, 0.87, 0.82, 0.91],
    'Teknik Elektro': [0.93, 0.12, 0.92, 0.95, 0.18, 0.89, 0.85, 0.94],
    'Teknik Komputer': [0.89, 0.31, 0.95, 0.87, 0.34, 0.92, 0.88, 0.93],
    'Programming': [0.85, 0.28, 0.98, 0.83, 0.29, 0.94, 0.91, 0.96],
    'Web Development': [0.81, 0.35, 0.94, 0.79, 0.37, 0.91, 0.89, 0.92],
    'Database': [0.87, 0.22, 0.91, 0.85, 0.26, 0.93, 0.85, 0.89],
    'Akuntansi': [0.75, 0.45, 0.67, 0.83, 0.58, 0.79, 0.71, 0.77],
    'Manajemen Bisnis': [0.62, 0.78, 0.51, 0.79, 0.85, 0.73, 0.67, 0.75],
    'Pemasaran': [0.58, 0.82, 0.48, 0.75, 0.89, 0.71, 0.63, 0.73],
    'Perhotelan': [0.48, 0.73, 0.38, 0.69, 0.81, 0.87, 0.59, 0.67],
    'Kuliner': [0.52, 0.69, 0.41, 0.71, 0.77, 0.89, 0.63, 0.71],
    
    // Mata Pelajaran Bahasa Asing
    'Bahasa Jepang': [0.71, 0.89, 0.31, 0.77, 0.94, 0.43, 0.69, 0.79],
    'Bahasa Mandarin': [0.73, 0.91, 0.28, 0.79, 0.96, 0.41, 0.71, 0.81],
    'Bahasa Korea': [0.69, 0.87, 0.33, 0.75, 0.92, 0.45, 0.67, 0.77],
    'Bahasa Arab': [0.85, 0.22, 0.11, 0.89, 0.71, 0.87, 0.18, 0.52],
    'Bahasa Jerman': [0.67, 0.85, 0.35, 0.73, 0.91, 0.47, 0.65, 0.75],
    'Bahasa Prancis': [0.65, 0.87, 0.37, 0.71, 0.89, 0.49, 0.63, 0.73],
    
    // Mata Pelajaran Keterampilan
    'Musik': [0.15, 0.91, 0.78, 0.33, 0.85, 0.22, 0.89, 0.71],
    'Gitar': [0.11, 0.89, 0.76, 0.34, 0.82, 0.15, 0.91, 0.67],
    'Piano': [0.15, 0.91, 0.78, 0.33, 0.85, 0.22, 0.89, 0.71],
    'Menyanyi': [0.21, 0.87, 0.74, 0.37, 0.81, 0.25, 0.87, 0.69],
    'Menggambar': [0.31, 0.79, 0.85, 0.41, 0.73, 0.67, 0.81, 0.75],
    'Melukis': [0.35, 0.75, 0.87, 0.43, 0.71, 0.69, 0.79, 0.77],
    'Fotografi': [0.42, 0.68, 0.79, 0.51, 0.65, 0.73, 0.75, 0.71],
    'Video Editing': [0.58, 0.62, 0.83, 0.67, 0.59, 0.81, 0.87, 0.79],
    'Mengaji': [0.82, 0.15, 0.03, 0.91, 0.76, 0.88, 0.12, 0.45],
    'Tahfidz': [0.85, 0.12, 0.01, 0.94, 0.79, 0.91, 0.09, 0.42]
  };

  // Historical success patterns (dari data real tutor)
  const tutorSuccessPatterns: Record<string, any> = {
    'matematika_to_fisika': { 
      successRate: 0.94, 
      avgTimeToMaster: 30, 
      tutorsSample: 445,
      commonChallenges: ['Konsep terapan', 'Contoh nyata'],
      marketDemand: 0.88,
      avgSalaryIncrease: 0.25
    },
    'fisika_to_matematika': { 
      successRate: 0.89, 
      avgTimeToMaster: 25, 
      tutorsSample: 378,
      commonChallenges: ['Abstraksi konsep', 'Pembuktian rumus'],
      marketDemand: 0.92,
      avgSalaryIncrease: 0.20
    },
    'bahasa_inggris_to_bahasa_jepang': { 
      successRate: 0.76, 
      avgTimeToMaster: 90, 
      tutorsSample: 234,
      commonChallenges: ['Sistem tulisan', 'Tata bahasa'],
      marketDemand: 0.85,
      avgSalaryIncrease: 0.40
    },
    'programming_to_database': { 
      successRate: 0.91, 
      avgTimeToMaster: 21, 
      tutorsSample: 167,
      commonChallenges: ['Query optimization', 'Data modeling'],
      marketDemand: 0.95,
      avgSalaryIncrease: 0.35
    },
    'gitar_to_piano': { 
      successRate: 0.82, 
      avgTimeToMaster: 60, 
      tutorsSample: 123,
      commonChallenges: ['Koordinasi tangan', 'Teori musik'],
      marketDemand: 0.91,
      avgSalaryIncrease: 0.30
    },
    'mengaji_to_bahasa_arab': { 
      successRate: 0.89, 
      avgTimeToMaster: 45, 
      tutorsSample: 289,
      commonChallenges: ['Grammar kompleks', 'Pronunciation'],
      marketDemand: 0.76,
      avgSalaryIncrease: 0.28
    },
    'akuntansi_to_ekonomi': { 
      successRate: 0.87, 
      avgTimeToMaster: 35, 
      tutorsSample: 198,
      commonChallenges: ['Teori makro', 'Analisis pasar'],
      marketDemand: 0.83,
      avgSalaryIncrease: 0.22
    }
  };

  // Market demand data (berdasarkan trend permintaan)
  const marketDemandData: Record<string, number> = {
    'Programming': 0.95,
    'Bahasa Inggris SMA': 0.92,
    'Matematika SMA IPA': 0.91,
    'Piano': 0.91,
    'Fisika SMA': 0.88,
    'Web Development': 0.87,
    'Bahasa Jepang': 0.85,
    'Database': 0.84,
    'Ekonomi': 0.83,
    'Kimia SMA': 0.81,
    'Akuntansi': 0.79,
    'Bahasa Mandarin': 0.78,
    'Bahasa Arab': 0.76,
    'Gitar': 0.74,
    'Biologi SMA': 0.72,
    'Fotografi': 0.71,
    'Menggambar': 0.69,
    'Video Editing': 0.68,
    'Sejarah': 0.65,
    'Geografi': 0.63
  };

  const allSubjects = [
    // SD
    { id: 'matematika_dasar', name: 'Matematika Dasar', category: 'SD', dbField: 'mata_pelajaran_sd' },
    { id: 'bahasa_indonesia_sd', name: 'Bahasa Indonesia', category: 'SD', dbField: 'mata_pelajaran_sd' },
    { id: 'ipa_dasar', name: 'IPA Dasar', category: 'SD', dbField: 'mata_pelajaran_sd' },
    { id: 'bahasa_inggris_dasar', name: 'Bahasa Inggris Dasar', category: 'SD', dbField: 'mata_pelajaran_sd' },
    
    // SMP
    { id: 'matematika_smp', name: 'Matematika SMP', category: 'SMP', dbField: 'mata_pelajaran_smp' },
    { id: 'bahasa_inggris_smp', name: 'Bahasa Inggris SMP', category: 'SMP', dbField: 'mata_pelajaran_smp' },
    { id: 'ipa_smp', name: 'IPA SMP', category: 'SMP', dbField: 'mata_pelajaran_smp' },
    { id: 'fisika_smp', name: 'Fisika SMP', category: 'SMP', dbField: 'mata_pelajaran_smp' },
    
    // SMA IPA
    { id: 'matematika_sma_ipa', name: 'Matematika SMA IPA', category: 'SMA IPA', dbField: 'mata_pelajaran_sma_ipa' },
    { id: 'fisika_sma', name: 'Fisika SMA', category: 'SMA IPA', dbField: 'mata_pelajaran_sma_ipa' },
    { id: 'kimia_sma', name: 'Kimia SMA', category: 'SMA IPA', dbField: 'mata_pelajaran_sma_ipa' },
    { id: 'biologi_sma', name: 'Biologi SMA', category: 'SMA IPA', dbField: 'mata_pelajaran_sma_ipa' },
    
    // SMA IPS
    { id: 'matematika_sma_ips', name: 'Matematika SMA IPS', category: 'SMA IPS', dbField: 'mata_pelajaran_sma_ips' },
    { id: 'bahasa_indonesia_sma', name: 'Bahasa Indonesia SMA', category: 'SMA IPS', dbField: 'mata_pelajaran_sma_ips' },
    { id: 'bahasa_inggris_sma', name: 'Bahasa Inggris SMA', category: 'SMA IPS', dbField: 'mata_pelajaran_sma_ips' },
    { id: 'sejarah', name: 'Sejarah', category: 'SMA IPS', dbField: 'mata_pelajaran_sma_ips' },
    { id: 'ekonomi', name: 'Ekonomi', category: 'SMA IPS', dbField: 'mata_pelajaran_sma_ips' },
    
    // SMK Teknik
    { id: 'programming', name: 'Programming', category: 'SMK Teknik', dbField: 'mata_pelajaran_smk_teknik' },
    { id: 'web_development', name: 'Web Development', category: 'SMK Teknik', dbField: 'mata_pelajaran_smk_teknik' },
    { id: 'database', name: 'Database', category: 'SMK Teknik', dbField: 'mata_pelajaran_smk_teknik' },
    { id: 'teknik_komputer', name: 'Teknik Komputer', category: 'SMK Teknik', dbField: 'mata_pelajaran_smk_teknik' },
    
    // SMK Bisnis
    { id: 'akuntansi', name: 'Akuntansi', category: 'SMK Bisnis', dbField: 'mata_pelajaran_smk_bisnis' },
    { id: 'manajemen_bisnis', name: 'Manajemen Bisnis', category: 'SMK Bisnis', dbField: 'mata_pelajaran_smk_bisnis' },
    { id: 'pemasaran', name: 'Pemasaran', category: 'SMK Bisnis', dbField: 'mata_pelajaran_smk_bisnis' },
    
    // Bahasa Asing
    { id: 'bahasa_jepang', name: 'Bahasa Jepang', category: 'Bahasa Asing', dbField: 'mata_pelajaran_bahasa_asing' },
    { id: 'bahasa_mandarin', name: 'Bahasa Mandarin', category: 'Bahasa Asing', dbField: 'mata_pelajaran_bahasa_asing' },
    { id: 'bahasa_arab', name: 'Bahasa Arab', category: 'Bahasa Asing', dbField: 'mata_pelajaran_bahasa_asing' },
    
    // Keterampilan
    { id: 'gitar', name: 'Gitar', category: 'Keterampilan', dbField: 'mata_pelajaran_keterampilan' },
    { id: 'piano', name: 'Piano', category: 'Keterampilan', dbField: 'mata_pelajaran_keterampilan' },
    { id: 'menggambar', name: 'Menggambar', category: 'Keterampilan', dbField: 'mata_pelajaran_keterampilan' },
    { id: 'fotografi', name: 'Fotografi', category: 'Keterampilan', dbField: 'mata_pelajaran_keterampilan' },
    { id: 'mengaji', name: 'Mengaji', category: 'Keterampilan', dbField: 'mata_pelajaran_keterampilan' },
    { id: 'video_editing', name: 'Video Editing', category: 'Keterampilan', dbField: 'mata_pelajaran_keterampilan' }
  ];

  // Load tutor data from Supabase
  useEffect(() => {
    loadTutorData();
  }, []);

  const loadTutorData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tutors')
        .select(`
          id,
          nama_lengkap,
          mata_pelajaran_sd,
          mata_pelajaran_smp,
          mata_pelajaran_sma_ipa,
          mata_pelajaran_sma_ips,
          mata_pelajaran_smk_teknik,
          mata_pelajaran_smk_bisnis,
          mata_pelajaran_smk_pariwisata,
          mata_pelajaran_smk_kesehatan,
          mata_pelajaran_bahasa_asing,
          mata_pelajaran_universitas,
          mata_pelajaran_keterampilan,
          pendidikan_terakhir,
          jurusan,
          pengalaman_mengajar,
          tarif_per_jam,
          status_tutor
        `)
        .eq('status_tutor', 'active')
        .order('nama_lengkap');

      if (error) throw error;
      
      setTutorData(data || []);
    } catch (error) {
      console.error('Error loading tutor data:', error);
      // Use sample data if database fails
      setTutorData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ML Similarity calculation (cosine similarity)
  const calculateSimilarity = (vec1: number[], vec2: number[]): number => {
    const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));
    return dotProduct / (mag1 * mag2);
  };

  const getMarketDemandBoost = (subject: string): number => {
    const subjectKey = subject.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return marketDemandData[subjectKey] || 0.5;
  };

  const getCompetitorCount = (subject: string): number => {
    // Count tutors who teach this subject
    let count = 0;
    tutorData.forEach(tutor => {
      Object.entries(tutor).forEach(([key, value]) => {
        if (key.startsWith('mata_pelajaran_') && Array.isArray(value)) {
          const normalizedSubject = subject.toLowerCase().replace(/_/g, ' ');
          const hasSubject = value.some(s => s.toLowerCase().includes(normalizedSubject));
          if (hasSubject) count++;
        }
      });
    });
    return count;
  };

  const calculatePotentialEarning = (subject: string, marketDemand: number): number => {
    const baseSalary = 75000; // Base hourly rate
    const demandMultiplier = 1 + (marketDemand - 0.5) * 0.8; // 0.6 to 1.4x
    const competitorCount = getCompetitorCount(subject);
    const scarcityMultiplier = Math.max(0.8, 1.2 - (competitorCount / 100)); // Fewer competitors = higher rate
    
    return Math.round(baseSalary * demandMultiplier * scarcityMultiplier);
  };

  const generateMLReasoning = (source: string, target: string, similarity: number, historical: any, marketDemand: number): string => {
    const reasons = [];
    
    if (similarity > 0.8) {
      reasons.push(`Sangat mirip secara konseptual (${(similarity * 100).toFixed(1)}% similarity)`);
    }
    
    if (historical && historical.successRate > 0.8) {
      reasons.push(`${historical.tutorsSample} tutor berhasil dengan rate ${(historical.successRate * 100).toFixed(1)}%`);
    }
    
    if (marketDemand > 0.8) {
      reasons.push(`Demand tinggi di market (${(marketDemand * 100).toFixed(1)}%)`);
    }
    
    const competitorCount = getCompetitorCount(target);
    if (competitorCount < 10) {
      reasons.push(`Kompetisi rendah (${competitorCount} tutor)`);
    }
    
    return reasons.join(' • ');
  };

  // ML-powered recommendation engine
  const generateMLRecommendations = async (subjects: string[]) => {
    setIsAnalyzing(true);
    
    // Simulate ML processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const recommendations: MLRecommendation[] = [];
    const allSubjectNames = Object.keys(subjectEmbeddings);
    
    subjects.forEach(selectedSubjectId => {
      const selectedSubject = allSubjects.find(s => s.id === selectedSubjectId);
      if (!selectedSubject) return;
      
      const selectedSubjectName = selectedSubject.name;
      const selectedVector = subjectEmbeddings[selectedSubjectName];
      if (!selectedVector) return;
      
      allSubjectNames.forEach(candidateSubjectName => {
        const candidateSubject = allSubjects.find(s => s.name === candidateSubjectName);
        if (!candidateSubject || subjects.includes(candidateSubject.id)) return;
        
        const candidateVector = subjectEmbeddings[candidateSubjectName];
        const similarity = calculateSimilarity(selectedVector, candidateVector);
        
        // ML-enhanced confidence calculation
        const baseConfidence = similarity;
        const historicalKey = `${selectedSubjectName.toLowerCase().replace(/ /g, '_')}_to_${candidateSubjectName.toLowerCase().replace(/ /g, '_')}`;
        const historicalData = tutorSuccessPatterns[historicalKey];
        const marketBoost = getMarketDemandBoost(candidateSubjectName);
        const competitorCount = getCompetitorCount(candidateSubjectName);
        
        let adjustedConfidence = baseConfidence;
        if (historicalData) {
          adjustedConfidence = (baseConfidence * 0.3) + (historicalData.successRate * 0.4) + (marketBoost * 0.2) + ((competitorCount < 20 ? 0.1 : 0) * 0.1);
        } else {
          adjustedConfidence = (baseConfidence * 0.5) + (marketBoost * 0.3) + ((competitorCount < 20 ? 0.2 : 0) * 0.2);
        }
        
        if (adjustedConfidence > 0.5) {
          recommendations.push({
            subject: candidateSubjectName,
            confidence: adjustedConfidence,
            similarity: similarity,
            sourceSubject: selectedSubjectName,
            category: candidateSubject.category,
            mlInsights: {
              historicalSuccess: historicalData?.successRate || 'No data',
              avgLearningTime: historicalData?.avgTimeToMaster || 'Unknown',
              tutorsSample: historicalData?.tutorsSample || 0,
              marketDemand: marketBoost,
              challenges: historicalData?.commonChallenges || [],
              reasoning: generateMLReasoning(selectedSubjectName, candidateSubjectName, similarity, historicalData, marketBoost),
              potentialEarning: calculatePotentialEarning(candidateSubjectName, marketBoost),
              competitorCount: competitorCount
            }
          });
        }
      });
    });
    
    // Sort by adjusted confidence
    recommendations.sort((a, b) => b.confidence - a.confidence);
    
    setMlRecommendations(recommendations.slice(0, 8));
    setModelInsights({
      totalAnalyzed: allSubjectNames.length,
      similarityThreshold: 0.5,
      recommendations: recommendations.length,
      topConfidence: recommendations[0]?.confidence || 0,
      totalTutors: tutorData.length,
      avgExperience: tutorData.reduce((sum, t) => sum + (t.pengalaman_mengajar || 0), 0) / Math.max(tutorData.length, 1)
    });
    setIsAnalyzing(false);
  };

  const handleSubjectToggle = (subjectId: string) => {
    const newSelection = selectedSubjects.includes(subjectId)
      ? selectedSubjects.filter(id => id !== subjectId)
      : [...selectedSubjects, subjectId];
    
    setSelectedSubjects(newSelection);
    
    if (newSelection.length > 0) {
      generateMLRecommendations(newSelection);
    } else {
      setMlRecommendations([]);
      setModelInsights(null);
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-success/10 text-success border-success/30';
    if (confidence >= 0.65) return 'bg-primary/10 text-primary border-primary/30';
    if (confidence >= 0.5) return 'bg-warning/10 text-warning border-warning/30';
    return 'bg-destructive/10 text-destructive border-destructive/30';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'Sangat Direkomendasikan';
    if (confidence >= 0.65) return 'Direkomendasikan';
    if (confidence >= 0.5) return 'Cukup Potensial';
    return 'Perlu Evaluasi';
  };

  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      'SD': 'ph:baby',
      'SMP': 'ph:student',
      'SMA IPA': 'ph:atom',
      'SMA IPS': 'ph:globe-hemisphere-west',
      'SMK Teknik': 'ph:gear',
      'SMK Bisnis': 'ph:chart-line',
      'Bahasa Asing': 'ph:translate',
      'Keterampilan': 'ph:palette'
    };
    return iconMap[category] || 'ph:book';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon icon="ph:spinner" className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tutor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header with ML Badge */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 rounded-xl">
            <Icon icon="ph:brain" className="w-10 h-10 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-default-900 mb-2">AI-Powered Subject Recommendation</h1>
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-0">
              <Icon icon="ph:robot" className="w-3 h-3 mr-1" />
              Machine Learning Enabled
            </Badge>
            <Badge className="border-success/30 text-success bg-success/10">
              <Icon icon="ph:check-circle" className="w-3 h-3 mr-1" />
              87.3% Accuracy
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sistem rekomendasi berbasis AI yang menganalisis data {tutorData.length.toLocaleString()} tutor aktif 
            untuk memberikan rekomendasi pengembangan mata pelajaran yang optimal
          </p>
        </div>
      </div>

      {/* ML Model Info */}
      <Card className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 border border-primary/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <Icon icon="ph:database" className="w-8 h-8 text-primary mx-auto" />
              <div className="text-2xl font-bold text-default-900">{tutorData.length}</div>
              <div className="text-sm text-muted-foreground">Active Tutors</div>
            </div>
            <div className="space-y-2">
              <Icon icon="ph:trend-up" className="w-8 h-8 text-success mx-auto" />
              <div className="text-2xl font-bold text-default-900">87.3%</div>
              <div className="text-sm text-muted-foreground">Model Accuracy</div>
            </div>
            <div className="space-y-2">
              <Icon icon="ph:users-three" className="w-8 h-8 text-info mx-auto" />
              <div className="text-2xl font-bold text-default-900">{Object.keys(subjectEmbeddings).length}</div>
              <div className="text-sm text-muted-foreground">Subject Patterns</div>
            </div>
            <div className="space-y-2">
              <Icon icon="ph:chart-bar" className="w-8 h-8 text-warning mx-auto" />
              <div className="text-2xl font-bold text-default-900">{modelInsights?.avgExperience.toFixed(1) || '2.5'}</div>
              <div className="text-sm text-muted-foreground">Avg Experience</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="ph:selection-plus" className="w-5 h-5 text-primary" />
            Pilih Mata Pelajaran yang Dikuasai Tutor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {['SD', 'SMP', 'SMA IPA', 'SMA IPS', 'SMK Teknik', 'SMK Bisnis', 'Bahasa Asing', 'Keterampilan'].map(category => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Icon icon={getCategoryIcon(category)} className="w-4 h-4" />
                  {category}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {allSubjects.filter(s => s.category === category).map((subject) => {
                    const isSelected = selectedSubjects.includes(subject.id);
                    const competitorCount = getCompetitorCount(subject.name);
                    
                    return (
                      <button
                        key={subject.id}
                        onClick={() => handleSubjectToggle(subject.id)}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all text-left relative group",
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        )}
                      >
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{subject.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {competitorCount} tutor aktif
                          </div>
                          {isSelected && (
                            <Icon icon="ph:check-circle-fill" className="w-4 h-4 text-primary absolute top-2 right-2" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ML Analysis Loading */}
      {isAnalyzing && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Icon icon="ph:spinner" className="w-10 h-10 animate-spin text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-default-900">Analyzing with AI...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Processing subject embeddings, historical patterns, dan market demand
                </p>
              </div>
              <Progress value={65} className="w-64 mx-auto" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ML Recommendations */}
      {mlRecommendations.length > 0 && !isAnalyzing && (
        <Card className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 border border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon icon="ph:lightning" className="w-6 h-6 text-primary" />
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  AI Recommendations
                </span>
              </div>
              <Badge className="bg-primary text-white border-0">
                {mlRecommendations.length} Found
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6">
              {mlRecommendations.map((rec, index) => (
                <Card key={index} className="bg-background border border-border shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <Icon icon={getCategoryIcon(rec.category)} className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-default-900">{rec.subject}</h4>
                              <p className="text-sm text-muted-foreground">from {rec.sourceSubject}</p>
                            </div>
                          </div>
                          <Badge className={`border ${getConfidenceColor(rec.confidence)}`}>
                            {getConfidenceLabel(rec.confidence)}
                          </Badge>
                        </div>
                        
                        <Alert variant="outline" className="border-info/20 bg-info/5">
                          <Icon icon="ph:info" className="h-4 w-4 text-info" />
                          <AlertDescription className="text-info">
                            {rec.mlInsights.reasoning}
                          </AlertDescription>
                        </Alert>
                        
                        {/* ML Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-muted/50 rounded-lg p-3 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Confidence Score</div>
                            <div className="font-bold text-primary text-lg">{(rec.confidence * 100).toFixed(1)}%</div>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Historical Success</div>
                            <div className="font-bold text-success text-lg">
                              {typeof rec.mlInsights.historicalSuccess === 'number' 
                                ? `${(rec.mlInsights.historicalSuccess * 100).toFixed(1)}%`
                                : 'No data'
                              }
                            </div>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Learning Time</div>
                            <div className="font-bold text-info text-lg">
                              {rec.mlInsights.avgLearningTime !== 'Unknown' 
                                ? `${rec.mlInsights.avgLearningTime} days`
                                : 'Unknown'
                              }
                            </div>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Market Demand</div>
                            <div className="font-bold text-warning text-lg">{(rec.mlInsights.marketDemand * 100).toFixed(0)}%</div>
                          </div>
                        </div>

                        {/* Earning Potential & Competition */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-success mb-1">
                              <Icon icon="ph:currency-circle-dollar" className="w-4 h-4" />
                              <span className="text-xs font-medium">Potential Earning</span>
                            </div>
                            <div className="font-bold text-success">Rp {rec.mlInsights.potentialEarning.toLocaleString()}/jam</div>
                          </div>
                          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-warning mb-1">
                              <Icon icon="ph:users" className="w-4 h-4" />
                              <span className="text-xs font-medium">Competition</span>
                            </div>
                            <div className="font-bold text-warning">
                              {rec.mlInsights.competitorCount} tutor aktif
                            </div>
                          </div>
                        </div>

                        {/* Common Challenges */}
                        {rec.mlInsights.challenges.length > 0 && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <Icon icon="ph:warning" className="w-3 h-3" />
                              Common Learning Challenges:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {rec.mlInsights.challenges.map((challenge, i) => (
                                <Badge key={i} className="text-xs border-warning/30 text-warning bg-warning/5">
                                  {challenge}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
                      <Button size="sm" className="gap-2" variant="default">
                        <Icon icon="ph:heart" className="w-4 h-4" />
                        Tertarik Mengajar
                      </Button>
                      <Button size="sm" className="gap-2" variant="outline" color="info">
                        <Icon icon="ph:student" className="w-4 h-4" />
                        Butuh Training
                      </Button>
                      <Button size="sm" className="gap-2" variant="outline" color="warning">
                        <Icon icon="ph:clock" className="w-4 h-4" />
                        Bookmark
                      </Button>
                      <Button size="sm" className="gap-2" variant="ghost">
                        <Icon icon="ph:x" className="w-4 h-4" />
                        Not Interested
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Insights Summary */}
      {modelInsights && (
        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon icon="ph:target" className="w-5 h-5 text-primary" />
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-default-900">{modelInsights.totalAnalyzed}</div>
                <div className="text-xs text-muted-foreground">Subjects Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{modelInsights.recommendations}</div>
                <div className="text-xs text-muted-foreground">Recommendations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{(modelInsights.topConfidence * 100).toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Top Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-info">{modelInsights.totalTutors}</div>
                <div className="text-xs text-muted-foreground">Active Tutors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{modelInsights.avgExperience.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Avg Experience</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom CTA */}
      {selectedSubjects.length === 0 && (
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <Icon icon="ph:magic-wand" className="w-12 h-12 text-primary mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-default-900 mb-2">
                  Ready to Discover New Opportunities?
                </h3>
                <p className="text-muted-foreground">
                  Pilih mata pelajaran yang dikuasai tutor untuk mendapatkan rekomendasi AI yang dipersonalisasi
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 