"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

interface AnalysesTimeChartProps {
  data: { created_at: string }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-2 shadow-sm">
        <p className="font-bold text-foreground">{`${label}: ${payload[0].value} analyses`}</p>
      </div>
    );
  }
  return null;
};

export function AnalysesTimeChart({ data }: AnalysesTimeChartProps) {
  // Group by month
  const monthCounts: { [key: string]: number } = {};
  data.forEach(item => {
    const month = format(new Date(item.created_at), "MMM");
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = months.map(month => ({
    month,
    analyses: monthCounts[month] || 0,
  }));

  const total = data.length;
  const avgPerMonth = total > 0 ? Math.round(total / 12) : 0;
  const bestMonth = Math.max(...chartData.map(d => d.analyses));

  return (
    <Card className="p-0 bg-card border-border">
      <CardHeader className="p-6">
        <CardTitle>Analyses dans le temps</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {data.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center">
            <p className="text-muted-foreground">No data yet</p>
          </div>
        ) : (
          <>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickLine={false} axisLine={{stroke: "hsl(var(--border))"}} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickLine={false} axisLine={{stroke: "hsl(var(--border))"}}/>
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }}/>
                  <Area type="monotone" dataKey="analyses" stroke="hsl(var(--primary))" fill="url(#colorAnalyses)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-around text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold text-foreground">{total.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg/month</p>
                <p className="text-lg font-bold text-foreground">{avgPerMonth}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Best month</p>
                <p className="text-lg font-bold text-foreground">{bestMonth}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
