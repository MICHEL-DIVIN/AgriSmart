"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FlaskConical, Users, Settings, Leaf, LogOut, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const navItems = [
  { href: '/admin', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/analyses', label: 'Analyses', icon: FlaskConical },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] flex-col border-r border-border bg-[#0f0f0f] text-foreground md:flex">
      <div className="flex h-16 items-center gap-2 px-4 border-b border-border">
        <Leaf className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">AgriSmart</h1>
        <Badge className="bg-primary text-primary-foreground text-[10px] h-5 px-2">Admin</Badge>
      </div>
      
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
              (pathname === item.href) && 'bg-card text-foreground font-semibold border-l-2 border-primary'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-4 border-t border-border p-4">
         <Link href="/" className='flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground'>
            <ArrowLeft className="h-3 w-3" />
            <span>Retour à l'app</span>
         </Link>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.user_metadata?.avatar_url || 'https://picsum.photos/seed/admin/100/100'} alt={"Admin"} data-ai-hint="person portrait" />
              <AvatarFallback className="bg-primary">A</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.user_metadata?.full_name || 'Admin User'}</p>
              <p className="text-xs text-muted-foreground truncate">Administrateur</p>
            </div>
          </div>
          <Button onClick={() => signOut()} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
