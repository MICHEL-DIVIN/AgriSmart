"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ElementType } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

type Props = {
  label: string;
  value: string;
  subValue: string;
  Icon: ElementType;
  chartData?: any[];
};

export function AdminKpiCard({ label, value, subValue, Icon, chartData }: Props) {
  return (
    <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
      <CardContent className="p-0 flex items-start justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            <p className={cn("text-xs text-muted-foreground", subValue.startsWith('+') && "text-primary")}>{subValue}</p>
          </div>
        </div>
        {chartData && (
          <div className="w-[60px] h-[40px] opacity-50">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
