import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BookOpen, Brain, History, BarChart3, Settings, Menu, X, Database, Code2, Terminal, Shield, LogOut, HelpCircle, Library, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/', icon: BookOpen, label: 'Estudar' },
  { to: '/simulado', icon: Brain, label: 'Simulado' },
  { to: '/revisao', icon: History, label: 'Revisão' },
  { to: '/banco', icon: Database, label: 'Banco de Questões' },
  { to: '/biblioteca', icon: Library, label: 'Biblioteca' },
  { to: '/terminal', icon: Terminal, label: 'Terminal' },
  { to: '/pesquisa', icon: Search, label: 'Pesquisa' },
  { to: '/scripts', icon: Code2, label: 'Scripts' },
  { to: '/api-python', icon: Code2, label: 'API Python' },
  { to: '/estatisticas', icon: BarChart3, label: 'Estatísticas' },
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
  { to: '/ajuda', icon: HelpCircle, label: 'Ajuda' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold text-gradient">Infra Study Lab</h1>
            <p className="text-sm text-muted-foreground mt-1">Linux + Proxmox</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                      : "text-sidebar-foreground"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          {/* Admin link */}
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mt-4 border-t border-sidebar-border pt-4",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                      : "text-sidebar-foreground"
                  )
                }
              >
                <Shield className="h-5 w-5" />
                <span className="font-medium">Painel Admin</span>
              </NavLink>
            )}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-sidebar-border">
            {user && (
              <div className="mb-3">
                <p className="text-sm font-medium truncate">{user.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
            <div className="text-xs text-muted-foreground text-center mt-3">
              v2.0.0 • Linux + Proxmox VE
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
