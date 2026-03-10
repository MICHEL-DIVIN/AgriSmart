"use client";

import { useState, useEffect } from "react";
import { AnalysesTable } from "@/components/admin/analyses/AnalysesTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getCropFr } from "@/lib/crops-fr";

export default function AdminAnalysesPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    avgConfidence: 0,
    topCrop: 'N/A',
    totalUsers: 0
  });
  const [uniqueCrops, setUniqueCrops] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (authLoading || !user) return;

      try {
        const supabase = createClient();
        setLoading(true);

        const [totalAn, allConf, allCropsP, totalUs, cropsData] = await Promise.all([
          supabase
            .from('analyses')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('analyses')
            .select('confidence')
            .limit(10000),
          supabase
            .from('analyses')
            .select('recommended_crop')
            .limit(10000),
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('analyses')
            .select('recommended_crop')
            .limit(10000)
        ]);

        // Calculate average confidence
        const confidences = allConf.data?.map(d => d.confidence) || [];
        const avgConf = confidences.length > 0
          ? confidences.reduce((a, b) => a + b, 0) / confidences.length
          : 0;

        // Find top crop
        const cropCounts: { [key: string]: number } = {};
        allCropsP.data?.forEach(item => {
          const crop = item.recommended_crop;
          cropCounts[crop] = (cropCounts[crop] || 0) + 1;
        });
        const topCrop = Object.entries(cropCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        // Get unique crops for filter
        const crops = cropsData.data?.map(a => a.recommended_crop) || [];
        const unique = [...new Set(crops)].sort();

        setStats({
          totalAnalyses: totalAn.count || 0,
          avgConfidence: avgConf,
          topCrop: topCrop,
          totalUsers: totalUs.count || 0
        });
        setUniqueCrops(unique);
      } catch (error) {
        console.error('Error fetching admin analyses stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Toutes les analyses</h2>
          <Badge variant="secondary" className="bg-secondary py-1 px-3 rounded-lg text-sm">Chargement...</Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Toutes les analyses</h2>
          <Badge variant="secondary" className="bg-secondary py-1 px-3 rounded-lg text-sm">
            {stats.totalAnalyses.toLocaleString()} total
          </Badge>
        </div>
        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
           <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par culture, utilisateur..."
                className="pl-9 bg-card border-border"
              />
          </div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-between">
                Toutes les cultures <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Toutes les cultures</DropdownMenuItem>
              {uniqueCrops.map((crop) => (
                <DropdownMenuItem key={crop}>{getCropFr(crop)}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-between">
                Toutes les périodes <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Toutes les périodes</DropdownMenuItem>
              <DropdownMenuItem>90 derniers jours</DropdownMenuItem>
              <DropdownMenuItem>30 derniers jours</DropdownMenuItem>
              <DropdownMenuItem>7 derniers jours</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
            <Button variant="secondary">
                Exporter CSV
            </Button>
        </div>
      </div>
      
       <div className="flex items-center gap-4 flex-wrap">
        <Badge variant="secondary" className="bg-secondary py-2 px-4 rounded-xl text-sm">
          {stats.totalAnalyses.toLocaleString()} Total
        </Badge>
        <Badge variant="secondary" className="bg-secondary py-2 px-4 rounded-xl text-sm">
          {stats.avgConfidence.toFixed(1)}% Confiance moyenne
        </Badge>
        <Badge variant="secondary" className="bg-secondary py-2 px-4 rounded-xl text-sm">
          {getCropFr(stats.topCrop)} Plus prédite
        </Badge>
        <Badge variant="secondary" className="bg-secondary py-2 px-4 rounded-xl text-sm">
          {stats.totalUsers} Utilisateurs actifs
        </Badge>
      </div>

      <AnalysesTable />
    </div>
  );
}
