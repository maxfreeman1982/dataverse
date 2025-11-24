'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  FolderKanban,
  PieChart,
  Shield,
  Settings,
  LogOut,
  User,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OjLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Tableau de bord', href: '/oj/dashboard', icon: LayoutDashboard },
  { name: 'Projets', href: '/oj/projects', icon: FolderKanban },
  { name: 'Portefeuille', href: '/oj/portfolio', icon: PieChart },
  { name: 'Wallet', href: '/oj/wallet', icon: Wallet },
  { name: 'Vérification KYC', href: '/oj/kyc', icon: Shield },
  { name: 'Paramètres', href: '/oj/settings', icon: Settings },
];

export default function OjLayout({ children }: OjLayoutProps) {
  const pathname = usePathname();

  // Don't show layout for auth pages
  if (pathname?.startsWith('/oj/auth')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">OJ</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">OJ Investment</h1>
              <p className="text-xs text-gray-500">Plateforme d'investissement</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-3 border-t border-gray-200">
            <Link
              href="/oj/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <User className="w-5 h-5" />
              Mon Profil
            </Link>
            <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {navigation.find((n) => pathname?.startsWith(n.href))?.name || 'OJ Investment'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
