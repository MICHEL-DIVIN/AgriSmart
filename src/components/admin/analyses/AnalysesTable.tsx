"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { AnalysisDetailModal } from "./AnalysisDetailModal";
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getCropFr } from '@/lib/crops-fr';

const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const CROP_COLORS: { [key: string]: string } = {
  Rice: "bg-blue-400", Maize: "bg-yellow-400", Jute: "bg-green-400",
  Coconut: "bg-amber-600", Papaya: "bg-orange-400", Cotton: "bg-gray-300",
  Mungbean: "bg-lime-500", Lentil: "bg-red-400", Coffee: "bg-amber-800",
  Orange: "bg-orange-500"
}

interface AnalysisItem {
  id: string;
  created_at: string;
  n: number;
  p: number;
  k: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  recommended_crop: string;
  confidence: number;
  user_id: string;
}

export function AnalysesTable() {
    const { user, loading: authLoading } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);
    const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
  
    useEffect(() => {
      const fetchAnalyses = async () => {
        if (authLoading || !user) return;

        const supabase = createClient();

        try {
          setLoading(true);
          const start = (currentPage - 1) * itemsPerPage;
          const end = start + itemsPerPage - 1;

          const { data, error } = await supabase
            .from('analyses')
            .select(`
              id, created_at, n, p, k, 
              temperature, humidity, ph, rainfall,
              recommended_crop, confidence, user_id
            `)
            .order('created_at', { ascending: false })
            .range(start, end);

          if (error) {
            console.error('Error fetching analyses:', error);
          } else {
            setAnalyses(data || []);
          }
        } catch (error) {
          console.error('Error fetching analyses:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchAnalyses();
    }, [user, authLoading, currentPage]);

    const handleViewDetails = (analysis: AnalysisItem) => {
      // Transform data to match AnalysisDetailModal expectations
      const transformedAnalysis = {
        ...analysis,
        user: {
          name: analysis.user_id.substring(0, 8) + '...',
        },
        date: analysis.created_at,
      };
      setSelectedAnalysis(transformedAnalysis);
      setIsModalOpen(true);
    }

    if (authLoading || loading) {
      return (
        <Card className="p-0 border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-card bg-secondary">
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead className="w-[180px]">User</TableHead>
                  <TableHead className="w-[140px]">Date</TableHead>
                  <TableHead className="w-[80px]">N</TableHead>
                  <TableHead className="w-[80px]">P</TableHead>
                  <TableHead className="w-[80px]">K</TableHead>
                  <TableHead className="w-[80px]">Temp °C</TableHead>
                  <TableHead className="w-[80px]">Humidity %</TableHead>
                  <TableHead className="w-[80px]">pH</TableHead>
                  <TableHead className="w-[140px]">Recommended Crop</TableHead>
                  <TableHead className="w-[140px]">Confidence</TableHead>
                  <TableHead className="w-[60px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={12} className="text-center h-48">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      );
    }

    return (
      <>
        <Card className="p-0 border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-card bg-secondary">
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead className="w-[180px]">Utilisateur</TableHead>
                    <TableHead className="w-[140px]">Date</TableHead>
                    <TableHead className="w-[80px]">N</TableHead>
                    <TableHead className="w-[80px]">P</TableHead>
                    <TableHead className="w-[80px]">K</TableHead>
                    <TableHead className="w-[80px]">Temp °C</TableHead>
                    <TableHead className="w-[80px]">Humidité %</TableHead>
                    <TableHead className="w-[80px]">pH</TableHead>
                    <TableHead className="w-[140px]">Culture recommandée</TableHead>
                    <TableHead className="w-[140px]">Confiance</TableHead>
                    <TableHead className="w-[60px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center h-48 text-muted-foreground">
                      Aucune analyse trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  analyses.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-card">
                      <TableCell className="text-muted-foreground">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell>
                          <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                                    {item.user_id.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                              </Avatar>
                              <p className="font-semibold text-foreground text-sm">
                                {item.user_id.substring(0, 8) + '...'}
                              </p>
                          </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(item.created_at), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="text-muted-foreground">{item.n}</TableCell>
                      <TableCell className="text-muted-foreground">{item.p}</TableCell>
                      <TableCell className="text-muted-foreground">{item.k}</TableCell>
                      <TableCell className="text-muted-foreground">{item.temperature}</TableCell>
                      <TableCell className="text-muted-foreground">{item.humidity}</TableCell>
                      <TableCell className="text-muted-foreground">{item.ph}</TableCell>
                      <TableCell className="font-semibold text-foreground">
                          <div className="flex items-center gap-2">
                              <span className={cn("h-2.5 w-2.5 rounded-full", CROP_COLORS[item.recommended_crop] || "bg-gray-400")} />
                              {getCropFr(item.recommended_crop)}
                          </div>
                      </TableCell>
                      <TableCell>
                          <div className="flex items-center gap-2">
                              <Progress value={item.confidence} className="h-1.5 w-16" />
                              <span className="text-sm font-semibold text-primary">{item.confidence.toFixed(1)}%</span>
                          </div>
                      </TableCell>
                      <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleViewDetails(item)}>
                              <Eye className="h-4 w-4" />
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {analyses.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">Page {currentPage}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={analyses.length < itemsPerPage}
              >
                Suivant
              </Button>
            </div>
          )}
        </Card>
        {selectedAnalysis && <AnalysisDetailModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} analysis={selectedAnalysis} />}
      </>
    );
}
