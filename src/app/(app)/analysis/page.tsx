"use client";
import { useState } from 'react';
import { AnalysisForm } from '@/components/analysis/AnalysisForm';
import { AnalysisResult } from '@/components/analysis/AnalysisResult';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function NewAnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const handleAnalyze = async (data: any) => {
    if (loading) return;
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to run an analysis.',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Call ML prediction API
    let mlResult;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          N: data.nitrogen,
          P: data.phosphorus,
          K: data.potassium,
          temperature: data.temperature,
          humidity: data.humidity,
          ph: data.ph,
          rainfall: data.rainfall
        }),
      });

      if (!response.ok) {
        throw new Error('Prediction API error');
      }

      mlResult = await response.json();
    } catch (error) {
      console.error('Error calling prediction API:', error);
      setIsAnalyzing(false);
      toast({
        variant: 'destructive',
        title: 'Erreur de prédiction',
        description: error instanceof Error && error.message === 'Failed to fetch'
          ? 'Impossible de contacter le serveur de prédiction'
          : 'Erreur lors de la prédiction',
      });
      return;
    }

    const resultToSave = {
      user_id: user.id,
      n: data.nitrogen,
      p: data.phosphorus,
      k: data.potassium,
      temperature: data.temperature,
      humidity: data.humidity,
      ph: data.ph,
      rainfall: data.rainfall,
      recommended_crop: mlResult.recommended_crop,
      confidence: mlResult.confidence,
      alternatives: mlResult.alternatives ?? []
    };

    const supabase = createClient();
    const { error } = await supabase.from('analyses').insert(resultToSave);

    if (error) {
      console.error('Error saving analysis:', error);
      toast({
        variant: 'destructive',
        title: 'Database Error',
        description: 'Could not save the analysis result.',
      });
    }

    // Map resultToSave to match AnalysisResult component expectations
    setAnalysisResult({
      ...resultToSave,
      crop: resultToSave.recommended_crop, // Alias for display compatibility
    });
    setIsAnalyzing(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start animate-fade-in">
      <AnalysisForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
      <AnalysisResult result={analysisResult} />
    </div>
  );
}
