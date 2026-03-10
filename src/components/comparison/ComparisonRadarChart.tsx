"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { radarChartData } from "@/lib/data";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ComparisonRadarChartProps {
  data?: typeof radarChartData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-2 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            <span className="font-bold text-muted-foreground">
              Current: {payload.find((p: any) => p.dataKey === 'current')?.value}
            </span>
          </div>
          <div className="flex flex-col">
             <span className="font-bold" style={{color: payload.find((p: any) => p.dataKey === 'rice')?.fill}}>
              Rice: {payload.find((p: any) => p.dataKey === 'rice')?.value}
            </span>
            <span className="font-bold" style={{color: payload.find((p: any) => p.dataKey === 'maize')?.fill}}>
              Maize: {payload.find((p: any) => p.dataKey === 'maize')?.value}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export function ComparisonRadarChart({ data = radarChartData }: ComparisonRadarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parameter Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 50']} tick={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Radar name="Rice" dataKey="rice" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} />
              <Radar name="Maize" dataKey="maize" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              <Radar name="Current Soil" dataKey="current" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeDasharray="4 4" />
              <Legend iconSize={10} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
