"use client";

import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '../ui/sheet';
import AdminSidebar from './AdminSidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';

const pageTitles: { [key: string]: string } = {
  '/admin': 'Vue d\'ensemble',
  '/admin/users': 'Utilisateurs',
  '/admin/analyses': 'Analyses',
  '/admin/settings': 'Paramètres',
};

export default function AdminHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? 'Overview';

  return (
    <header className="fixed top-0 left-0 md:left-[260px] right-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 sm:px-8 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[260px] p-0 bg-[#0f0f0f] border-r-0">
                    <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
                    <AdminSidebar />
                </SheetContent>
            </Sheet>
        </div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-xs hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher utilisateurs, analyses..."
              className="pl-9 bg-card border-border w-[280px]"
            />
        </div>
        <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-white hover:bg-secondary">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Avatar className="h-8 w-8">
            <AvatarImage src="https://picsum.photos/seed/admin/100/100" alt="Admin" data-ai-hint="person portrait"/>
            <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
