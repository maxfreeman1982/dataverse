'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Shield,
  FolderKanban,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNav = [
  { name: 'Dashboard', href: '/oj/admin', icon: LayoutDashboard },
  { name: 'Investisseurs', href: '/oj/admin/investors', icon: Users },
  { name: 'Validation KYC', href: '/oj/admin/kyc', icon: Shield },
  { name: 'Projets', href: '/oj/admin/projects', icon: FolderKanban },
  { name: 'Rapports', href: '/oj/admin/reports', icon: BarChart3 },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/oj/dashboard"
                className="flex items-center gap-2 text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Link>
              <div className="h-6 w-px bg-slate-600" />
              <h1 className="font-semibold">Administration OJ</h1>
            </div>
          </div>
        </div>

        {/* Admin Nav */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {adminNav.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/oj/admin' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors',
                    isActive
                      ? 'bg-gray-50 text-gray-900'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}
