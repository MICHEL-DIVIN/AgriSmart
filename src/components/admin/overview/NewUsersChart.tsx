"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from "date-fns";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-2 shadow-sm">
        <p className="font-bold text-foreground">{`${label}: ${payload[0].value} new users`}</p>
      </div>
    );
  }
  return null;
};

export function NewUsersChart() {
  const { user, loading: authLoading } = useAuth();
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewUsers = async () => {
      if (authLoading || !user) return;

      const supabase = createClient();

      try {
        setLoading(true);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', sevenDaysAgo)
          .limit(1000);

        if (error) {
          console.error('Error fetching new users:', error);
        } else {
          // Group by day
          const dayCounts: { [key: string]: number } = {};
          data?.forEach(item => {
            const day = format(new Date(item.created_at), "EEE");
            dayCounts[day] = (dayCounts[day] || 0) + 1;
          });

          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const chartDataResult = days.map(day => ({
            day,
            users: dayCounts[day] || 0,
          }));

          setChartData(chartDataResult);
        }
      } catch (error) {
        console.error('Error fetching new users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewUsers();
  }, [user, authLoading]);

  return (
    <Card className="p-0 bg-card border-border">
      <CardHeader className="p-6">
        <CardTitle>Nouveaux utilisateurs (7 jours)</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {loading ? (
          <div className="h-[240px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center">
            <p className="text-muted-foreground">No data yet</p>
          </div>
        ) : (
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={{stroke: "hsl(var(--border))"}} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={{stroke: "hsl(var(--border))"}} width={20} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
