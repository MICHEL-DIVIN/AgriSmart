import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { getCropFr } from "@/lib/crops-fr";

const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const StatCard = ({ label, value }: { label: string, value: string | number }) => (
    <div className="rounded-lg bg-secondary p-3">
        <p className="text-xs uppercase text-muted-foreground">{label}</p>
        <p className="font-bold text-foreground text-lg">{value}</p>
    </div>
)

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 32;
  const stroke = 6;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative h-[80px] w-[80px]">
      <svg height="80" width="80" className="-rotate-90 transform">
        <circle stroke="hsl(var(--border))" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius+4} cy={radius+4} />
        <circle stroke="hsl(var(--primary))" fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset }} r={normalizedRadius} cx={radius+4} cy={radius+4} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-foreground">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};


export function AnalysisDetailModal({ isOpen, setIsOpen, analysis }: { isOpen: boolean, setIsOpen: (open: boolean) => void, analysis: any }) {

    // Use alternatives from analysis if available, otherwise empty array
    const alternatives = (analysis.alternatives && Array.isArray(analysis.alternatives) && analysis.alternatives.length > 0)
      ? analysis.alternatives.map((alt: any) => ({
          name: alt.crop || alt.name || 'Unknown',
          confidence: alt.confidence || 0
        }))
      : [];
    
    const parameters = [
        {label: "Azote (N)", value: `${analysis.n} mg/kg`},
        {label: "Phosphore (P)", value: `${analysis.p} mg/kg`},
        {label: "Potassium (K)", value: `${analysis.k} mg/kg`},
        {label: "Température", value: `${analysis.temperature} °C`},
        {label: "Humidité", value: `${analysis.humidity} %`},
        {label: "Niveau de pH", value: analysis.ph},
        {label: "Pluviométrie", value: `${analysis.rainfall} mm`},
    ]
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-[520px] bg-card border-border rounded-2xl p-8">
               <DialogHeader className="flex-row items-center gap-4 space-y-0">
                    <DialogTitle className="text-2xl font-bold text-foreground flex-1">{getCropFr(analysis.recommended_crop)}</DialogTitle>
                    <CircularProgress percentage={analysis.confidence} />
               </DialogHeader>

                <Separator className="my-4 bg-border" />
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {parameters.map(p => <StatCard key={p.label} label={p.label} value={p.value} />)}
                </div>

                {alternatives.length > 0 && (
                    <>
                        <Separator className="my-4 bg-border" />
                        <div>
                            <h4 className="font-semibold text-foreground mb-2 text-sm">Top {Math.min(alternatives.length, 3)} alternatives</h4>
                            <div className="space-y-2">
                                {alternatives.slice(0, 3).map((alt, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-secondary">
                                        <p className="font-semibold text-foreground">{getCropFr(alt.name)}</p>
                                        <p className="text-primary">{alt.confidence.toFixed(1)}%</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                 <Separator className="my-4 bg-border" />

                <div className="flex items-center gap-3 text-sm">
                    <p className="text-muted-foreground">Analysé par</p>
                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary">{getInitials(analysis.user?.name || analysis.user?.display_name || 'Unknown')}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-foreground">{analysis.user?.name || analysis.user?.display_name || 'Unknown'}</p>
                    <p className="text-muted-foreground ml-auto">
                        {format(new Date(analysis.created_at || analysis.date), "MMM dd, yyyy 'at' hh:mm a")}
                    </p>
                </div>

            </DialogContent>
        </Dialog>
    )
}
