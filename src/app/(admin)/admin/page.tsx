"use client";

import { useState, useEffect } from 'react';
import { AdminKpiCard } from "@/components/admin/overview/AdminKpiCard";
import { AnalysesTimeChart } from "@/components/admin/overview/AnalysesTimeChart";
import { CropCategoryChart } from "@/components/admin/overview/CropCategoryChart";
import { NewUsersChart } from "@/components/admin/overview/NewUsersChart";
import { TopCropsCard } from "@/components/admin/overview/TopCropsCard";
import { FlaskConical, TrendingUp, Users, Wheat } from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const icons = {
  Users,
  FlaskConical,
  Wheat,
  TrendingUp
}

export default function AdminOverviewPage() {
  const { user, loading } = useAuth();
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [analysesData, setAnalysesData] = useState<any[]>([]);
  const [cropsData, setCropsData] = useState<any[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (loading || !user) return;

      const supabase = createClient();

      try {
        const [
          totalUsers,
          totalAnalyses,
          allCropsAdmin,
          avgConfAdmin,
          recentAnalyses
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('analyses')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('analyses')
            .select('recommended_crop')
            .limit(10000),
          supabase
            .from('analyses')
            .select('confidence')
            .limit(10000),
          supabase
            .from('analyses')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(1000)
        ]);

        // Calculate top crop
        const cropCounts: { [key: string]: number } = {};
        allCropsAdmin.data?.forEach(item => {
          const crop = item.recommended_crop;
          cropCounts[crop] = (cropCounts[crop] || 0) + 1;
        });
        const topCropAdmin = Object.entries(cropCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const topCropPercentage = totalAnalyses.count && totalAnalyses.count > 0
          ? Math.round((cropCounts[topCropAdmin] || 0) / totalAnalyses.count * 100)
          : 0;

        // Calculate global average confidence
        const confidences = avgConfAdmin.data?.map(d => d.confidence) || [];
        const globalAvgConf = confidences.length > 0
          ? confidences.reduce((a, b) => a + b, 0) / confidences.length
          : 0;

        // Build KPI data
        const kpis = [
          {
            label: "Total utilisateurs",
            value: (totalUsers.count ?? 0).toString(),
            subValue: "+8 cette semaine",
            icon: "Users",
          },
          {
            label: "Total analyses",
            value: (totalAnalyses.count ?? 0).toLocaleString(),
            subValue: "+143 cette semaine",
            icon: "FlaskConical",
          },
          {
            label: "Culture principale",
            value: topCropAdmin,
            subValue: `${topCropPercentage}% de toutes les analyses`,
            icon: "Wheat",
          },
          {
            label: "Confiance moyenne",
            value: `${globalAvgConf.toFixed(1)}%`,
            subValue: "Tous utilisateurs confondus",
            icon: "TrendingUp",
          },
        ];

        setKpiData(kpis);
        setAnalysesData(recentAnalyses.data || []);
        setCropsData(allCropsAdmin.data || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchAdminData();
  }, [user, loading]);

  if (loading || dashboardLoading) {
    return (
      <div className="space-y-8">
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-secondary animate-pulse rounded-lg" />
          ))}
        </section>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {kpiData.map((data) => (
          <AdminKpiCard
            key={data.label}
            {...data}
            Icon={icons[data.icon as keyof typeof icons]}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalysesTimeChart data={analysesData} />
        </div>
        <TopCropsCard data={cropsData} />
      </section>
      
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NewUsersChart />
        <CropCategoryChart data={cropsData} />
      </section>
    </div>
  );
}
