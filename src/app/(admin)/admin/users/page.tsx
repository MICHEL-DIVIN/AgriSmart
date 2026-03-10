"use client";

import { useState, useEffect } from "react";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ChevronDown, Download, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      if (authLoading || !user) return;

      try {
        const supabase = createClient();
        setLoading(true);

        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error('Error fetching total users:', error);
        } else {
          setTotalUsers(count || 0);
        }
      } catch (error) {
        console.error('Error fetching total users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalUsers();
  }, [user, authLoading]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Utilisateurs</h2>
          <Badge variant="secondary" className="bg-secondary py-1 px-3 rounded-lg text-sm">
            {loading ? 'Chargement...' : `${totalUsers ?? 0} total`}
          </Badge>
        </div>
        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
           <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-9 bg-card border-border w-full"
              />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-between">
                All Roles <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All Roles</DropdownMenuItem>
              <DropdownMenuItem>Farmer</DropdownMenuItem>
              <DropdownMenuItem>Technician</DropdownMenuItem>
              <DropdownMenuItem>Agronomist</DropdownMenuItem>
              <DropdownMenuItem>Researcher</DropdownMenuItem>
              <DropdownMenuItem>Developer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Exporter CSV
          </Button>
        </div>
      </div>
      <UsersTable />
    </div>
  );
}
