"use client";

import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '../ui/sheet';
import Sidebar from './Sidebar';

const pageTitles: { [key: string]: string } = {
  '/': 'Tableau de bord',
  '/analysis': 'Nouvelle analyse',
  '/history': 'Historique des analyses',
  '/comparison': 'Comparaison',
  '/settings': 'Paramètres',
};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? 'Dashboard';

  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(format(new Date(), "EEEE, MMMM dd, yyyy"));
  }, []);

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
                <SheetContent side="left" className="w-[260px] p-0 border-r-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <Sidebar isMobile />
                </SheetContent>
            </Sheet>
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden lg:block text-sm text-muted-foreground">{currentDate}</span>
        <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  );
}
