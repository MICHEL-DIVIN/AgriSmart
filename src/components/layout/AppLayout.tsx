"use client";
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="ml-0 md:ml-[260px] flex flex-col transition-all duration-300 ease-in-out">
        <Header />
        <main className="p-4 sm:p-8 mt-[64px]">
          {children}
        </main>
      </div>
    </div>
  );
}
