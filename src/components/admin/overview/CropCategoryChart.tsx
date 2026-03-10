"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface CropData {
  recommended_crop: string;
}

interface CropCategoryChartProps {
  data: CropData[];
}

const CROP_CATEGORIES = {
  Cereals: ['rice', 'maize', 'jute'],
  Legumes: ['chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans', 'mungbean', 'blackgram', 'lentil'],
  Fruits: ['pomegranate', 'banana', 'mango', 'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya', 'coconut'],
  'Cash Crops': ['cotton', 'coffee'],
};

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-2 shadow-sm">
        <p className="font-bold text-foreground">{`${payload[0].name}: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ data }: { data: { name: string; value: number; fill: string }[] }) => {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
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

export function CropCategoryChart({ data }: CropCategoryChartProps) {
  // Categorize crops
  const categoryCounts: { [key: string]: number } = {};
  
  data.forEach(item => {
    const crop = item.recommended_crop.toLowerCase();
    let categorized = false;
    
    for (const [category, crops] of Object.entries(CROP_CATEGORIES)) {
      if (crops.includes(crop)) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        categorized = true;
        break;
      }
    }
    
    if (!categorized) {
      categoryCounts['Other'] = (categoryCounts['Other'] || 0) + 1;
    }
  });

  const total = data.length;
  const chartData = Object.entries(categoryCounts)
    .map(([name, count], index) => ({
      name,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <Card className="p-0 bg-card border-border">
      <CardHeader className="p-6">
        <CardTitle>Catégories de cultures</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {data.length === 0 ? (
          <div className="h-[180px] flex items-center justify-center">
            <p className="text-muted-foreground">No data yet</p>
          </div>
        ) : (
          <>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie 
                    data={chartData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={50} 
                    outerRadius={80} 
                    stroke="hsl(var(--card))" 
                    strokeWidth={4}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <CustomLegend data={chartData} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
