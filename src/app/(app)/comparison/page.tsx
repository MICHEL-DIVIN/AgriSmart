"use client";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ComparisonCard } from "@/components/comparison/ComparisonCard";
import { ComparisonRadarChart } from "@/components/comparison/ComparisonRadarChart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { crops, cropComparisonData, radarChartData } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getCropFr } from "@/lib/crops-fr";

export default function ComparisonPage() {
  const { user, loading } = useAuth();
  const [crop1, setCrop1] = useState("rice");
  const [crop2, setCrop2] = useState("maize");
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  
  useEffect(() => {
    const fetchLastAnalysis = async () => {
      if (loading || !user) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('analyses')
          .select('n, p, k, temperature, humidity, ph, rainfall')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          setLastAnalysis(data);
        }
      } catch (error) {
        console.error('Error fetching last analysis:', error);
      } finally {
        setLoadingAnalysis(false);
      }
    };

    fetchLastAnalysis();
  }, [user, loading]);

  // @ts-ignore
  const data1 = cropComparisonData[crop1];
   // @ts-ignore
  const data2 = cropComparisonData[crop2];

  const recommendation = data1.compatibility > data2.compatibility ? crop1 : crop2;

  // Build radar chart data with current soil values
  const currentRadarData = lastAnalysis ? [
    { subject: 'N', rice: 90, maize: 80, current: lastAnalysis.n },
    { subject: 'P', rice: 50, maize: 45, current: lastAnalysis.p },
    { subject: 'K', rice: 45, maize: 40, current: lastAnalysis.k },
    { subject: 'Temp', rice: 25, maize: 24, current: lastAnalysis.temperature },
    { subject: 'Humidity', rice: 78, maize: 70, current: lastAnalysis.humidity },
    { subject: 'pH', rice: 6.5, maize: 7, current: lastAnalysis.ph },
    { subject: 'Rainfall', rice: 250, maize: 100, current: lastAnalysis.rainfall },
  ] : radarChartData;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardContent className="p-6">
          <label className="text-sm font-medium text-muted-foreground">Sélectionner les cultures à comparer</label>
          <div className="mt-2 flex items-center gap-4">
            <Select defaultValue={crop1} onValueChange={setCrop1}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une culture" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop.value} value={crop.value}>
                    {crop.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="px-3 py-1 text-sm border-border">VS</Badge>
            <Select defaultValue={crop2} onValueChange={setCrop2}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une culture" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop.value} value={crop.value}>
                    {crop.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4">
            {loadingAnalysis ? (
              <p className="font-code text-xs text-muted-foreground">Chargement...</p>
            ) : lastAnalysis ? (
              <p className="font-code text-xs text-muted-foreground">
                Sol actuel : N={lastAnalysis.n} · P={lastAnalysis.p} · K={lastAnalysis.k} · T={lastAnalysis.temperature}°C · H={lastAnalysis.humidity}% · pH={lastAnalysis.ph} · R={lastAnalysis.rainfall}mm
              </p>
            ) : (
              <p className="font-code text-xs text-muted-foreground">
                Aucune donnée de sol, effectuez d'abord une analyse
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ComparisonCard
          cropName={crop1}
          compatibility={data1.compatibility}
          conditions={data1.conditions}
          color="#16a34a"
        />
        <div className="xl:col-span-1">
          <ComparisonRadarChart data={currentRadarData} />
        </div>
        <ComparisonCard
          cropName={crop2}
          compatibility={data2.compatibility}
          conditions={data2.conditions}
          color="#3b82f6"
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Verdict de recommandation</h3>
          <p className="mt-2 text-lg text-foreground">
            <span className="font-bold capitalize">{recommendation}</span> est plus compatible avec vos conditions de sol actuelles.
          </p>
          <div className="mt-4 space-y-3">
             <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <span className="capitalize font-medium">{getCropFr(crop1)}</span>
                <Progress value={data1.compatibility} className="h-2 [&>div]:bg-[#16a34a]" />
             </div>
             <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <span className="capitalize font-medium">{getCropFr(crop2)}</span>
                <Progress value={data2.compatibility} className="h-2 [&>div]:bg-[#3b82f6]" />
             </div>
          </div>
          <Button className="mt-6">Comparer</Button>
        </CardContent>
      </Card>
    </div>
  );
}
