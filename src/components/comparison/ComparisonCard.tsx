"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCropFr } from "@/lib/crops-fr";

type Condition = {
  param: string;
  ideal: string;
  current: number;
  compatible: boolean;
};

type Props = {
  cropName: string;
  compatibility: number;
  conditions: Condition[];
  color: string;
};

export function ComparisonCard({ cropName, compatibility, conditions, color }: Props) {
  return (
    <Card className="p-0">
      <CardHeader className="p-6">
        <CardTitle className="text-2xl font-bold text-foreground">{getCropFr(cropName)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-0">
        <div>
          <span className="text-4xl font-bold" style={{ color }}>{compatibility}%</span>
          <p className="text-sm text-muted-foreground">Compatibilité du sol</p>
        </div>
        <Separator />
        <div className="space-y-3">
          {conditions.map((item) => (
            <div key={item.param} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 text-sm">
              <span className="text-muted-foreground">{item.param}</span>
              <span className="font-semibold">{item.ideal}</span>
              <div className="flex items-center gap-2 justify-end">
                <span className={cn(item.compatible ? "text-primary" : "text-destructive")}>{item.current}</span>
                {item.compatible ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
