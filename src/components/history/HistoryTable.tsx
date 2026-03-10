"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Eye, Search, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { getCropFr } from "@/lib/crops-fr"

export type AnalysisHistoryItem = {
  id: string;
  created_at: string;
  recommended_crop: string;
  n: number;
  p: number;
  k: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  confidence: number;
  alternatives: { crop: string, confidence: number }[];
};

const CROP_COLORS: { [key: string]: string } = {
  Rice: "bg-blue-400",
  Maize: "bg-yellow-400",
  Jute: "bg-green-400",
  Coconut: "bg-amber-600",
  Papaya: "bg-orange-400",
  Cotton: "bg-gray-300",
  Mungbean: "bg-lime-500",
  Lentil: "bg-red-400",
  Coffee: "bg-amber-800",
}

export function HistoryTable() {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10;
  
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
        if (authLoading) return;
        if (!user) {
          setLoading(false);
          return;
        }
        
        const supabase = createClient();
        setLoading(true);
        const { data, error } = await supabase
            .from('analyses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching analysis history:', error);
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Could not fetch analysis history.'
            })
        } else {
            setHistory(data as any[] as AnalysisHistoryItem[]);
        }
        setLoading(false);
    };

    fetchHistory();
  }, [user, authLoading, toast]);

  const filteredData = history.filter((item) =>
    item.recommended_crop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  };

  const Pagination = () => {
    const pageNumbers = [];
    if (totalPages > 0) pageNumbers.push(1);
    if (currentPage > 3 && totalPages > 5) pageNumbers.push(-1);
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    if (currentPage < totalPages - 2 && totalPages > 5) pageNumbers.push(-1);
    if (totalPages > 1) pageNumbers.push(totalPages);
    
    return (
      <div className="flex items-center gap-2">
        {pageNumbers.map((num, index) =>
          num === -1 ? (
            <span key={`ellipsis-${index}`} className="px-1">...</span>
          ) : (
            <Button
              key={num}
              variant={currentPage === num ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(num)}
              className="h-8 w-8 p-0"
            >
              {num}
            </Button>
          )
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

       <div className="mb-6 flex items-center gap-4 flex-wrap">
        <Badge variant="secondary" className="bg-secondary py-2 px-4 rounded-xl">{history.length} Analyses totales</Badge>
        <Badge variant="secondary" className="bg-secondary py-2 px-4 rounded-xl">{[...new Set(history.map(item => item.recommended_crop))].length} Cultures uniques</Badge>
        <Badge variant="secondary" className="bg-secondary py-2 px-4 rounded-xl">
          {history.length > 0 ? (history.reduce((acc, item) => acc + item.confidence, 0) / history.length).toFixed(1) : 0}% Confiance moyenne
        </Badge>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead className="w-[140px]">Date</TableHead>
                <TableHead className="w-[160px]">Culture</TableHead>
                <TableHead className="w-[80px]">N</TableHead>
                <TableHead className="w-[80px]">P</TableHead>
                <TableHead className="w-[80px]">K</TableHead>
                <TableHead className="w-[80px]">Temp °C</TableHead>
                <TableHead className="w-[80px]">Humidité %</TableHead>
                <TableHead className="w-[80px]">pH</TableHead>
                <TableHead className="w-[80px]">Pluviométrie</TableHead>
                <TableHead className="w-[140px]">Confiance</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center h-48">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(item.created_at), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full", CROP_COLORS[item.recommended_crop] || "bg-gray-400")} />
                        {getCropFr(item.recommended_crop)}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.n}</TableCell>
                    <TableCell className="text-muted-foreground">{item.p}</TableCell>
                    <TableCell className="text-muted-foreground">{item.k}</TableCell>
                    <TableCell className="text-muted-foreground">{item.temperature}</TableCell>
                    <TableCell className="text-muted-foreground">{item.humidity}</TableCell>
                    <TableCell className="text-muted-foreground">{item.ph}</TableCell>
                    <TableCell className="text-muted-foreground">{item.rainfall}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={item.confidence} className="h-1.5 w-20" />
                        <span className="text-sm font-semibold text-primary">{item.confidence.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={12} className="text-center h-48 text-muted-foreground">
                      Aucun historique
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Affichage de {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredData.length)} sur {filteredData.length} résultats
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Précédent</Button>
            <Pagination />
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Suivant</Button>
          </div>
        </div>
      )}
    </div>
  )
}
