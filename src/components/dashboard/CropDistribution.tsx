"use client"

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCropFr } from "@/lib/crops-fr"

interface CropData {
  recommended_crop: string;
}

interface CropDistributionProps {
  data: CropData[];
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-2 shadow-sm">
        <p className="font-bold text-foreground">{`${payload[0].name}: ${payload[0].value}%`}</p>
      </div>
    );
  }

  return null;
};

const CustomLegend = ({ data }: { data: { name: string; value: number; fill: string }[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-4">
      {data.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill }}></span>
          <span className="text-sm text-muted-foreground">{entry.name}</span>
          <span className="text-sm font-semibold text-foreground">{`${entry.value}%`}</span>
        </div>
      ))}
    </div>
  );
};

export function CropDistribution({ data }: CropDistributionProps) {
  // Calculate distribution
  const cropCounts: { [key: string]: number } = {};
  data.forEach(item => {
    const crop = item.recommended_crop;
    cropCounts[crop] = (cropCounts[crop] || 0) + 1;
  });

  const total = data.length;
  const distribution = Object.entries(cropCounts)
    .map(([name, count], index) => ({
      name,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 crops

  // Add "Other" if there are more than 5 crops
  if (Object.keys(cropCounts).length > 5) {
    const otherCount = Object.entries(cropCounts)
      .slice(5)
      .reduce((sum, [, count]) => sum + count, 0);
    distribution.push({
      name: 'Autres',
      value: total > 0 ? Math.round((otherCount / total) * 100) : 0,
      fill: CHART_COLORS[4],
    });
  }

  return (
    <Card className="p-0">
      <CardHeader className="p-6">
        <CardTitle>Répartition des cultures</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {data.length === 0 ? (
          <div className="h-[180px] flex items-center justify-center">
            <p className="text-muted-foreground">Aucune donnée</p>
          </div>
        ) : (
          <>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={4}
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <CustomLegend data={distribution} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
