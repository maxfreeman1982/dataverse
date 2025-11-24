'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, TrendingUp, Info } from 'lucide-react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/oj/public', icon: LayoutDashboard },
    { name: 'Projets', href: '/oj/public/projects', icon: FolderKanban },
    { name: 'Performance', href: '/oj/public/performance', icon: TrendingUp },
    { name: 'À propos', href: '/oj/public/about', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/oj/public" className="text-xl font-bold text-indigo-600">
                OJ Investment
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/oj/auth/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Connexion
              </Link>
              <Link
                href="/oj/auth/register"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">OJ Investment</h3>
              <p className="text-gray-400 text-sm">
                Plateforme d'investissement transparente et sécurisée
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Plateforme</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/oj/public/projects" className="hover:text-white">Projets</Link></li>
                <li><Link href="/oj/public/performance" className="hover:text-white">Performance</Link></li>
                <li><Link href="/oj/public/about" className="hover:text-white">À propos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white">CGU</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>contact@oj-investment.com</li>
                <li>+33 1 23 45 67 89</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 OJ Investment. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
