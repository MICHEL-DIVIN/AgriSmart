"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { getCropFr } from "@/lib/crops-fr"

interface AnalysisItem {
  id: string;
  created_at: string;
  recommended_crop: string;
  confidence: number;
}

interface RecentAnalysesProps {
  data: AnalysisItem[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-2 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Date
            </span>
            <span className="font-bold text-foreground">{label}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Confiance
            </span>
            <span className="font-bold text-primary">{payload[0].value}%</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export function RecentAnalyses({ data }: RecentAnalysesProps) {
  // Group data by day for chart
  const chartData = data.reduce((acc: any[], item) => {
    const date = format(new Date(item.created_at), "MMM dd");
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.confidence = Math.max(existing.confidence, item.confidence);
    } else {
      acc.push({ date, confidence: item.confidence });
    }
    return acc;
  }, []).sort((a, b) => {
    const dateA = new Date(a.date + ', 2026');
    const dateB = new Date(b.date + ', 2026');
    return dateA.getTime() - dateB.getTime();
  });

  const minConfidence = chartData.length > 0 
    ? Math.min(...chartData.map(d => d.confidence)) 
    : 80;
  const maxConfidence = chartData.length > 0 
    ? Math.max(...chartData.map(d => d.confidence)) 
    : 100;
  const domainMin = Math.max(0, Math.floor(minConfidence - 5));
  const domainMax = Math.min(100, Math.ceil(maxConfidence + 5));

  return (
    <Card className="p-0">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <CardTitle>Analyses récentes</CardTitle>
          <Link href="/history" className="text-sm font-semibold text-primary hover:underline">
            Voir tout →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {data.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center">
            <p className="text-muted-foreground">Aucune analyse pour le moment</p>
          </div>
        ) : (
          <>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--secondary))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                    domain={[domainMin, domainMax]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="confidence"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-4">
              {data.map((item, index) => (
                <div key={item.id}>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-2">
                    <div>
                      <p className="font-semibold text-foreground">{getCropFr(item.recommended_crop)}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(item.created_at), "MMMM dd, yyyy")}</p>
                    </div>
                    <Progress value={item.confidence} className="w-full" />
                    <p className="text-right font-semibold text-primary">{item.confidence.toFixed(1)}%</p>
                  </div>
                  {index < data.length - 1 && <Separator className="bg-secondary"/>}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
