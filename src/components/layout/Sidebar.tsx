"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FlaskConical, Clock, GitCompareArrows, Settings, Leaf, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';

const navItems = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/analysis', label: 'Nouvelle analyse', icon: FlaskConical },
  { href: '/history', label: 'Historique', icon: Clock },
  { href: '/comparison', label: 'Comparaison', icon: GitCompareArrows },
  { href: '/settings', label: 'Paramètres', icon: Settings },
];

export default function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  
  const getInitials = (name: string) => {
    if (!name) return 'JD';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const content = (
    <div className="flex h-full flex-col bg-card text-foreground border-r border-border">
      <div className="flex h-16 items-center gap-2 px-4 border-b border-border">
        <Leaf className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold">AgriSmart</h1>
      </div>
      
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
              (pathname === item.href) && 'bg-primary font-semibold text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt={user?.user_metadata?.full_name || "User"} />
            <AvatarFallback className="bg-secondary text-muted-foreground">
              {getInitials(user?.user_metadata?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.user_metadata?.full_name || 'John Doe'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.user_metadata?.role || 'Administrator'}</p>
          </div>
          <Button onClick={() => signOut()} variant="ghost" size="icon" className="text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full flex-shrink-0">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return content;
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] md:block">
      {content}
    </aside>
  );
}
