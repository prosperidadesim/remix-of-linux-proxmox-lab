import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />
      <div className="lg:ml-64 flex-1 flex flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-end h-16 px-6 bg-background/80 backdrop-blur-lg border-b border-border">
          <ThemeToggle />
        </header>
        <main className="p-6 flex-1">
          {children}
        </main>
        {/* Legal Disclaimer Footer */}
        <footer className="px-6 py-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Material educacional não oficial. Não afiliado ao LPI ou Proxmox Server Solutions GmbH.
          </p>
        </footer>
      </div>
    </div>
  );
}
