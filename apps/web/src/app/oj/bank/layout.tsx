'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Vault,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BankLayoutProps {
  children: ReactNode;
}

const bankNav = [
  { name: 'Dashboard', href: '/oj/bank', icon: LayoutDashboard },
  { name: 'Dépôts', href: '/oj/bank/deposits', icon: ArrowDownLeft },
  { name: 'Retraits', href: '/oj/bank/withdrawals', icon: ArrowUpRight },
  { name: 'Historique', href: '/oj/bank/history', icon: History },
  { name: 'Séquestre', href: '/oj/bank/escrow', icon: Vault },
];

export default function BankLayout({ children }: BankLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bank Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/oj/dashboard"
                className="flex items-center gap-2 text-blue-200 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Link>
              <div className="h-6 w-px bg-blue-600" />
              <h1 className="font-semibold">Interface Banque OJ</h1>
            </div>
          </div>
        </div>

        {/* Bank Nav */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {bankNav.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/oj/bank' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors',
                    isActive
                      ? 'bg-gray-50 text-gray-900'
                      : 'text-blue-200 hover:text-white hover:bg-blue-700'
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
