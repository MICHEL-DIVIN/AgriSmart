import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ElementType } from "react"

interface KpiCardProps {
  title: string
  value: string
  subLabel: string
  Icon: ElementType
  subLabelColor?: string
}

export function KpiCard({ title, value, subLabel, Icon, subLabelColor }: KpiCardProps) {
  return (
    <Card className="p-6">
      <CardContent className="p-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="data-label">{title}</span>
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="data-value">{value}</p>
          <p className={cn("text-xs text-muted-foreground", subLabelColor)}>{subLabel}</p>
        </div>
      </CardContent>
    </Card>
  )
}
