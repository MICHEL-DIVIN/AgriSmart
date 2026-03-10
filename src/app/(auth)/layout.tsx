export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-4">
      {children}
    </main>
  );
}
