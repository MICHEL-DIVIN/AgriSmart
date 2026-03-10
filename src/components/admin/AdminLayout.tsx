"use client";
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="ml-0 md:ml-[260px] flex flex-col transition-all duration-300 ease-in-out">
        <AdminHeader />
        <main className="p-4 sm:p-8 mt-[64px]">
          {children}
        </main>
      </div>
    </div>
  );
}
