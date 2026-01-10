import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 flex items-center justify-end h-16 px-6 bg-background/80 backdrop-blur-lg border-b border-border">
          <ThemeToggle />
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
