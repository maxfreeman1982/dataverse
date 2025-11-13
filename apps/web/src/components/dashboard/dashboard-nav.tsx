'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Database,
  Zap,
  Mail,
  MessageSquare,
  FileText,
  Bot,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Database', href: '/database', icon: Database },
  { name: 'Builder', href: '/dashboard/builder', icon: Zap },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Mail', href: '/mail', icon: Mail },
  { name: 'Docs', href: '/docs', icon: FileText },
  { name: 'AI Hub', href: '/ai', icon: Bot },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="flex w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
          <span className="font-bold text-xl">DataVerse</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Settings */}
      <div className="border-t p-3">
        <Link
          href="/settings"
          className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  )
}
