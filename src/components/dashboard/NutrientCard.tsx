import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface NutrientCardProps {
  title: string
  data: {
    value: number
    optimal: string
    max: number
    unit: string
    status: string
  }
}

export function NutrientCard({ title, data }: NutrientCardProps) {
  const progressValue = (data.value / data.max) * 100

  return (
    <Card className="p-6">
      <CardContent className="p-0 flex flex-col justify-between h-full gap-2">
        <div>
          <p className="data-label">{title}</p>
          <p className="data-value mt-2">
            {data.value} <span className="text-base text-muted-foreground">{data.unit}</span>
          </p>
          <p className="text-xs text-muted-foreground">Optimal: {data.optimal}</p>
        </div>
        <div className="space-y-2">
          <Progress value={progressValue} />
          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">{data.status}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
