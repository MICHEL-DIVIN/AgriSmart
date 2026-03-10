"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getCropFr } from "@/lib/crops-fr";

interface CropData {
  recommended_crop: string;
}

interface TopCropsCardProps {
  data: CropData[];
}

export function TopCropsCard({ data }: TopCropsCardProps) {
  // Calculate top crops
  const cropCounts: { [key: string]: number } = {};
  data.forEach(item => {
    const crop = item.recommended_crop;
    cropCounts[crop] = (cropCounts[crop] || 0) + 1;
  });

  const total = data.length;
  const topCrops = Object.entries(cropCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((crop, index) => ({
      rank: index + 1,
      ...crop,
    }));

  return (
    <Card className="p-0 bg-card border-border">
      <CardHeader className="p-6">
        <CardTitle>Cultures principales</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        {topCrops.length === 0 ? (
          <p className="text-muted-foreground text-sm">No data yet</p>
        ) : (
          topCrops.map((crop, index) => (
            <div key={crop.rank}>
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-full text-xs bg-secondary text-muted-foreground">
                  #{crop.rank}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-sm">{getCropFr(crop.name)}</p>
                  <Progress value={crop.percentage * 2} className="h-1.5" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-sm">{crop.count}</p>
                  <p className="text-xs text-muted-foreground">{crop.percentage}%</p>
                </div>
              </div>
              {index < topCrops.length - 1 && <Separator className="bg-border" />}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
