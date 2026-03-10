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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, FlaskConical, MoreVertical, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { UserDetailModal } from "./UserDetailModal";
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const roleColors: { [key: string]: string } = {
    'user': 'bg-green-500/10 text-green-400 border-green-500/20',
    'admin': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

interface UserItem {
  id: string;
  display_name: string;
  email: string;
  role: string;
  organization: string | null;
  country: string | null;
  created_at: string;
}

export function UsersTable() {
  const { user, loading: authLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [analysesCounts, setAnalysesCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      if (authLoading || !user) return;

      const supabase = createClient();

      try {
        setLoading(true);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage - 1;

        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, email, role, organization, country, created_at')
          .order('created_at', { ascending: false })
          .range(start, end);

        if (error) {
          console.error('Error fetching users:', error);
        } else {
          setUsers(data || []);

          // Fetch analyses counts for each user
          if (data && data.length > 0) {
            const userIds = data.map(u => u.id);
            const counts: { [key: string]: number } = {};
            
            await Promise.all(
              userIds.map(async (userId) => {
                const { count } = await supabase
                  .from('analyses')
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', userId);
                counts[userId] = count || 0;
              })
            );
            
            setAnalysesCounts(counts);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, authLoading, currentPage]);

  const handleViewDetails = (userItem: UserItem) => {
    const userWithCount = {
      ...userItem,
      name: userItem.display_name || userItem.email,
      analyses: analysesCounts[userItem.id] || 0,
      joined: userItem.created_at,
      last_active: formatDistanceToNow(new Date(userItem.created_at), { addSuffix: true }),
    };
    setSelectedUser(userWithCount);
    setIsModalOpen(true);
  }

  const getCountryFlag = (country: string | null) => {
    if (!country) return '';
    const flags: { [key: string]: string } = {
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'India': '🇮🇳',
      'Spain': '🇪🇸',
      'China': '🇨🇳',
      'Morocco': '🇲🇦',
    };
    return flags[country] || '';
  };

  if (authLoading || loading) {
    return (
      <Card className="p-0 border-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-card bg-secondary">
                <TableHead className="w-[240px]">User</TableHead>
                <TableHead className="w-[120px]">Role</TableHead>
                <TableHead className="w-[160px]">Organization</TableHead>
                <TableHead className="w-[120px]">Country</TableHead>
                <TableHead className="w-[100px] text-center">Analyses</TableHead>
                <TableHead className="w-[120px]">Joined</TableHead>
                <TableHead className="w-[120px]">Last Active</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} className="text-center h-48">
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
                <TableHead className="w-[240px]">User</TableHead>
                <TableHead className="w-[120px]">Role</TableHead>
                <TableHead className="w-[160px]">Organization</TableHead>
                <TableHead className="w-[120px]">Country</TableHead>
                <TableHead className="w-[100px] text-center">Analyses</TableHead>
                <TableHead className="w-[120px]">Joined</TableHead>
                <TableHead className="w-[120px]">Last Active</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={8} className="text-center h-48 text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                users.map((userItem) => (
                  <TableRow key={userItem.id} className="hover:bg-card">
                    <TableCell>
                      <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                {getInitials(userItem.display_name || userItem.email)}
                              </AvatarFallback>
                          </Avatar>
                          <div>
                              <p className="font-bold text-foreground">{userItem.display_name || userItem.email}</p>
                              <p className="text-xs text-muted-foreground">{userItem.email}</p>
                          </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs font-medium capitalize", roleColors[userItem.role] || roleColors['user'])}>
                        {userItem.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{userItem.organization || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {userItem.country && (
                        <>
                          <span className="mr-2">{getCountryFlag(userItem.country)}</span>
                          {userItem.country}
                        </>
                      )}
                      {!userItem.country && '-'}
                    </TableCell>
                    <TableCell className="text-foreground font-bold text-center">
                      {analysesCounts[userItem.id] || 0}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(userItem.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(userItem.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                  <MoreVertical className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(userItem)}>
                                  <Eye className="mr-2 h-4 w-4" /> Voir les détails
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                  <FlaskConical className="mr-2 h-4 w-4" /> Voir les analyses
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {users.length > 0 && (
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
              disabled={users.length < itemsPerPage}
            >
              Suivant
            </Button>
          </div>
        )}
      </Card>
      {selectedUser && <UserDetailModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} user={selectedUser} />}
    </>
  );
}
