"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getCropFr } from "@/lib/crops-fr";

interface CircularProgressProps {
  percentage: number;
}

const CircularProgress = ({ percentage }: CircularProgressProps) => {
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative h-[100px] w-[100px]">
      <svg
        height="100"
        width="100"
        className="-rotate-90 transform"
      >
        <circle
          stroke="hsl(var(--border))"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="hsl(var(--primary))"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-500 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-foreground">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};


const StatChip = ({ label, value }: { label: string, value: string }) => (
  <div className="rounded-lg bg-secondary p-3">
    <p className="text-xs uppercase text-muted">{label}</p>
    <p className="font-semibold text-foreground">{value}</p>
  </div>
);

export function AnalysisResult({ result }: { result: any | null }) {
  if (!result) {
    return (
      <Card className="flex h-full min-h-[600px] items-center justify-center p-6">
        <div className="text-center">
          <FlaskConical className="mx-auto h-12 w-12 text-border" />
          <p className="mt-4 text-sm text-muted">Effectuez une analyse pour voir les résultats</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider text-muted">Culture recommandée</p>
        <h2 className="text-3xl font-bold text-foreground">{result.crop}</h2>
        <div className="my-4 flex justify-center">
          <CircularProgress percentage={result.confidence} />
        </div>
        <p className="text-sm text-muted-foreground">Score de confiance</p>
      </div>

      <Separator className="my-6" />

      <div>
        <h4 className="text-base font-semibold">Alternatives</h4>
        <div className="mt-4 space-y-4">
          {(result.alternatives ?? []).map((alt: any, index: number) => (
            <div key={index} className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-xs font-bold text-muted-foreground">
                #{index + 1}
              </span>
              <p className="font-semibold">{getCropFr(alt.crop)}</p>
              <div className="flex items-center gap-2">
                <Progress value={alt.confidence} className="h-1 w-20" />
                <span className="text-sm font-semibold text-primary">
                  {alt.confidence.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Separator className="my-6" />

      <div>
        <h4 className="text-base font-semibold">Conditions idéales pour {getCropFr(result.crop)}</h4>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatChip label="Ideal N" value="80-100 mg/kg" />
          <StatChip label="Ideal P" value="40-60 mg/kg" />
          <StatChip label="Ideal K" value="40-50 mg/kg" />
          <StatChip label="Temp Range" value="20-30°C" />
          <StatChip label="Humidity" value="70-85%" />
          <StatChip label="pH Range" value="6.0-7.0" />
        </div>
      </div>

      <Button variant="outline" className="mt-6 w-full">Sauvegarder l'analyse</Button>
    </Card>
  );
}
