"use client";

import { useState, useEffect } from 'react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RecentAnalyses } from '@/components/dashboard/RecentAnalyses';
import { CropDistribution } from '@/components/dashboard/CropDistribution';
import { NutrientCard } from '@/components/dashboard/NutrientCard';
import { FlaskConical, Wheat, TrendingUp, Droplets } from 'lucide-react';
import type { ElementType } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { getCropFr } from '@/lib/crops-fr';

const icons: { [key: string]: ElementType } = {
  FlaskConical,
  Wheat,
  TrendingUp,
  Droplets,
};

interface AnalysisItem {
  id: string;
  created_at: string;
  recommended_crop: string;
  confidence: number;
}

interface CropData {
  recommended_crop: string;
}

interface AvgData {
  confidence: number;
  ph: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [nutrientData, setNutrientData] = useState<any>(null);
  const [recentData, setRecentData] = useState<AnalysisItem[]>([]);
  const [cropData, setCropData] = useState<CropData[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (loading || !user) {
        setDashboardLoading(false);
        return;
      }

      const supabase = createClient();

      try {
        const [
          totalCount,
          allCrops,
          avgData,
          recentDataResult
        ] = await Promise.all([
          supabase
            .from('analyses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('analyses')
            .select('recommended_crop')
            .eq('user_id', user.id)
            .limit(1000),
          supabase
            .from('analyses')
            .select('confidence, ph, n, p, k')
            .eq('user_id', user.id)
            .limit(1000),
          supabase
            .from('analyses')
            .select('id, created_at, recommended_crop, confidence')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        // Calculate KPIs
        const totalAnalyses = totalCount.count ?? 0;
        
        // Find top crop
        const cropCounts: { [key: string]: number } = {};
        allCrops.data?.forEach(item => {
          const crop = item.recommended_crop;
          cropCounts[crop] = (cropCounts[crop] || 0) + 1;
        });
        const topCrop = Object.entries(cropCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const topCropPercentage = totalAnalyses > 0 
          ? Math.round((cropCounts[topCrop] || 0) / totalAnalyses * 100) 
          : 0;

        // Calculate averages
        const confidences = avgData.data?.map(d => d.confidence) || [];
        const phs = avgData.data?.map(d => d.ph) || [];
        const avgConfidence = confidences.length > 0
          ? confidences.reduce((a, b) => a + b, 0) / confidences.length
          : 0;
        const avgPh = phs.length > 0
          ? phs.reduce((a, b) => a + b, 0) / phs.length
          : 0;

        // Calculate nutrient averages
        const ns = avgData.data?.map(d => d.n).filter(n => n != null) || [];
        const ps = avgData.data?.map(d => d.p).filter(p => p != null) || [];
        const ks = avgData.data?.map(d => d.k).filter(k => k != null) || [];
        const avgN = ns.length > 0 ? ns.reduce((a, b) => a + b, 0) / ns.length : 85;
        const avgP = ps.length > 0 ? ps.reduce((a, b) => a + b, 0) / ps.length : 42;
        const avgK = ks.length > 0 ? ks.reduce((a, b) => a + b, 0) / ks.length : 210;

        // Build KPI data
        const kpis = [
          {
            title: "Total analyses",
            value: totalAnalyses.toString(),
            icon: "FlaskConical",
            subLabel: "+12 ce mois",
            subLabelColor: "text-primary",
          },
          {
            title: "Culture la plus prédite",
            value: getCropFr(topCrop),
            icon: "Wheat",
            subLabel: `${topCropPercentage}% de toutes les analyses`,
          },
          {
            title: "Confiance moyenne",
            value: `${avgConfidence.toFixed(1)}%`,
            icon: "TrendingUp",
            subLabel: "30 derniers jours",
          },
          {
            title: "pH moyen du sol",
            value: avgPh.toFixed(1),
            icon: "Droplets",
            subLabel: "Plage optimale",
          },
        ];

        setKpiData(kpis);
        setNutrientData({
          nitrogen: {
            value: Math.round(avgN),
            optimal: "60 – 100",
            max: 140,
            unit: "mg/kg",
            status: avgN >= 60 && avgN <= 100 ? "Optimal" : avgN < 60 ? "Low" : "High",
          },
          phosphorus: {
            value: Math.round(avgP),
            optimal: "30 – 60",
            max: 100,
            unit: "mg/kg",
            status: avgP >= 30 && avgP <= 60 ? "Optimal" : avgP < 30 ? "Low" : "High",
          },
          potassium: {
            value: Math.round(avgK),
            optimal: "150 – 250",
            max: 300,
            unit: "mg/kg",
            status: avgK >= 150 && avgK <= 250 ? "Optimal" : avgK < 150 ? "Low" : "High",
          },
        });
        setRecentData(recentDataResult.data || []);
        setCropData(allCrops.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, loading]);

  if (loading || dashboardLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-secondary animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {kpiData.length > 0 && (
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((item) => (
              <KpiCard
                key={item.title}
                title={item.title}
                value={item.value}
                subLabel={item.subLabel}
                Icon={icons[item.icon]}
                subLabelColor={item.subLabelColor}
              />
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentAnalyses data={recentData} />
        </div>
        <CropDistribution data={cropData} />
      </section>

      {nutrientData && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <NutrientCard title="Nitrogen Levels (N)" data={nutrientData.nitrogen} />
          <NutrientCard title="Phosphorus Levels (P)" data={nutrientData.phosphorus} />
          <NutrientCard title="Potassium Levels (K)" data={nutrientData.potassium} />
        </section>
      )}
    </div>
  );
}
