"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, formatDistanceToNow } from "date-fns";
import { createClient } from '@/lib/supabase/client';
import { getCropFr } from '@/lib/crops-fr';

const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const roleColors: { [key: string]: string } = {
    'user': 'bg-green-500/10 text-green-400 border-green-500/20',
    'admin': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

const Stat = ({label, value}: {label: string, value: string}) => (
    <div className="text-center">
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
    </div>
)

interface RecentAnalysis {
  id: string;
  created_at: string;
  recommended_crop: string;
  confidence: number;
}

export function UserDetailModal({ isOpen, setIsOpen, user }: { isOpen: boolean, setIsOpen: (open: boolean) => void, user: any }) {
    const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRecentAnalyses = async () => {
            if (!isOpen || !user?.id) return;

            const supabase = createClient();

            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('analyses')
                    .select('id, created_at, recommended_crop, confidence')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (error) {
                    console.error('Error fetching recent analyses:', error);
                } else {
                    setRecentAnalyses(data || []);
                }
            } catch (error) {
                console.error('Error fetching recent analyses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentAnalyses();
    }, [isOpen, user?.id]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-[520px] bg-card border-border rounded-2xl p-8">
                <DialogHeader className="text-left space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                            <AvatarFallback className="text-2xl bg-primary">{getInitials(user.name || user.display_name || user.email)}</AvatarFallback>
                        </Avatar>
                        <div>
                             <DialogTitle className="text-xl font-bold text-foreground">{user.name || user.display_name || user.email}</DialogTitle>
                             <p className="text-muted-foreground text-sm">{user.email}</p>
                        </div>
                        <Badge variant="outline" className={`ml-auto capitalize ${roleColors[user.role] || roleColors['user']}`}>
                            {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                        </Badge>
                    </div>
                </DialogHeader>

                <Separator className="my-4 bg-border" />
                
                <div className="grid grid-cols-3 gap-4 my-4">
                    <Stat label="Analyses" value={user.analyses?.toString() || '0'} />
                    <Stat label="Inscrit" value={`Il y a ${formatDistanceToNow(new Date(user.joined || user.created_at))}`} />
                    <Stat label="Dernière activité" value={user.last_active || 'N/A'} />
                </div>
                
                <Separator className="my-4 bg-border" />

                <div>
                    <h4 className="font-semibold text-foreground mb-2">Analyses récentes</h4>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Chargement...</p>
                    ) : recentAnalyses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucune analyse pour le moment</p>
                    ) : (
                        <div className="space-y-2">
                            {recentAnalyses.map((analysis) => (
                                <div key={analysis.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-secondary">
                                    <p className="font-semibold text-foreground">{getCropFr(analysis.recommended_crop)}</p>
                                    <p className="text-primary">{analysis.confidence.toFixed(1)}%</p>
                                    <p className="text-muted-foreground">{format(new Date(analysis.created_at), 'MMM dd, yyyy')}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    )
}
