'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  X,
  Plus,
  Search,
  Users,
  FlaskConical,
  Boxes,
  Star,
  BarChart3,
  CircleDot,
  ArrowLeftRight,
  Sparkles,
  Settings,
  Beaker,
  TrendingUp,
  Clock,
  ChevronRight,
  Share2,
} from 'lucide-react';
import {
  GET_ALL_FORMULAS,
  GET_ALL_INGREDIENTS,
  type Formula,
  type Ingredient,
} from '@/graphql/perfume';
import {
  useDeviceDetection,
  useSwipe,
  vibrateDevice,
  shareContent,
  formatCompactNumber,
  truncateText,
  type QuickAction,
} from '@/lib/mobile';
import { cn } from '@/lib/utils';

export default function MobileDashboardPage() {
  const router = useRouter();
  const deviceInfo = useDeviceDetection();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const { data: formulasData } = useQuery<{ getAllFormulas: Formula[] }>(GET_ALL_FORMULAS);
  const { data: ingredientsData } = useQuery<{ getAllIngredients: Ingredient[] }>(
    GET_ALL_INGREDIENTS
  );

  const formulas = formulasData?.getAllFormulas || [];
  const ingredients = ingredientsData?.getAllIngredients || [];

  // Quick actions for mobile
  const quickActions: QuickAction[] = [
    {
      id: 'new-formula',
      icon: <Plus className="h-6 w-6" />,
      label: 'New Formula',
      description: 'Create perfume',
      color: 'bg-blue-500',
      href: '/dashboard/perfumes/create',
    },
    {
      id: 'search',
      icon: <Search className="h-6 w-6" />,
      label: 'Search',
      description: 'Find ingredients',
      color: 'bg-purple-500',
      href: '/dashboard/perfumes/search',
    },
    {
      id: 'lab-notes',
      icon: <FlaskConical className="h-6 w-6" />,
      label: 'Lab Notes',
      description: 'Testing journal',
      color: 'bg-indigo-500',
      href: '/dashboard/perfumes/lab-notes',
    },
    {
      id: 'clients',
      icon: <Users className="h-6 w-6" />,
      label: 'Clients',
      description: 'CRM system',
      color: 'bg-blue-600',
      href: '/dashboard/perfumes/clients',
    },
  ];

  // Navigation menu items
  const menuItems = [
    { icon: <Search />, label: 'Advanced Search', href: '/dashboard/perfumes/search' },
    { icon: <Users />, label: 'Client Profiles', href: '/dashboard/perfumes/clients' },
    { icon: <FlaskConical />, label: 'Lab Notes', href: '/dashboard/perfumes/lab-notes' },
    { icon: <Boxes />, label: 'Inventory', href: '/dashboard/perfumes/inventory' },
    { icon: <Star />, label: 'Accords', href: '/dashboard/perfumes/accords' },
    { icon: <BarChart3 />, label: 'Analytics', href: '/dashboard/perfumes/analytics' },
    { icon: <CircleDot />, label: 'Scent Wheel', href: '/dashboard/perfumes/wheel' },
    { icon: <ArrowLeftRight />, label: 'Compare', href: '/dashboard/perfumes/compare' },
    { icon: <Sparkles />, label: 'Note Library', href: '/dashboard/perfumes/notes' },
    { icon: <Settings />, label: 'Settings', href: '/dashboard/perfumes/settings' },
  ];

  // Handle quick action tap
  const handleQuickAction = (action: QuickAction) => {
    vibrateDevice(10);
    router.push(action.href);
  };

  // Handle menu toggle
  const toggleMenu = () => {
    vibrateDevice(5);
    setMenuOpen(!menuOpen);
  };

  // Handle share
  const handleShare = async () => {
    const success = await shareContent({
      title: 'Perfume Architect Pro',
      text: 'Professional perfume formulation platform',
      url: window.location.href,
    });

    if (success) {
      vibrateDevice([10, 20, 10]);
    }
  };

  // Swipe gesture for cards
  const swipeHandlers = useSwipe(
    () => {
      // Swipe left - next card
      if (activeCard !== null && activeCard < formulas.length - 1) {
        setActiveCard(activeCard + 1);
        vibrateDevice(5);
      }
    },
    () => {
      // Swipe right - previous card
      if (activeCard !== null && activeCard > 0) {
        setActiveCard(activeCard - 1);
        vibrateDevice(5);
      }
    }
  );

  // Recent formulas
  const recentFormulas = formulas.slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Beaker className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Perfume Pro</h1>
              <p className="text-xs text-muted-foreground">Mobile Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Slide-out Menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={toggleMenu}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background border-l shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <p className="text-sm text-muted-foreground">Navigate features</p>
            </div>
            <div className="p-2">
              {menuItems.map((item) => (
                <button
                  key={item.href}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                  onClick={() => {
                    router.push(item.href);
                    setMenuOpen(false);
                  }}
                >
                  <div className="p-2 bg-muted rounded-lg">{item.icon}</div>
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Formulas</CardDescription>
              <CardTitle className="text-2xl">{formulas.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                Active
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Ingredients</CardDescription>
              <CardTitle className="text-2xl">
                {formatCompactNumber(ingredients.length)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-blue-600">
                <Beaker className="h-3 w-3 mr-1" />
                In stock
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="relative overflow-hidden rounded-xl text-white p-6 text-left active:scale-95 transition-transform"
                style={{ background: action.color }}
                onClick={() => handleQuickAction(action)}
              >
                <div className="relative z-10">
                  <div className="mb-3">{action.icon}</div>
                  <div className="font-semibold text-lg mb-1">{action.label}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-20">
                  <div className="scale-150">{action.icon}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Formulas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Formulas</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/perfumes')}
            >
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {recentFormulas.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Beaker className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No formulas yet
                  </p>
                  <Button
                    size="sm"
                    onClick={() => router.push('/dashboard/perfumes/create')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Formula
                  </Button>
                </CardContent>
              </Card>
            ) : (
              recentFormulas.map((formula, index) => (
                <Card
                  key={formula.id}
                  className="active:scale-98 transition-transform"
                  onClick={() => vibrateDevice(5)}
                  {...(index === activeCard ? swipeHandlers : {})}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {truncateText(formula.name, 30)}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {formula.ingredients.length} ingredients
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formula.olfactiveFamily.name}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Recently updated</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/perfumes/production/${formula.id}`);
                        }}
                      >
                        View
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Device Info (Debug) */}
        {deviceInfo.isMobile && (
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Mobile Optimized</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1 text-muted-foreground">
              <div>Screen: {deviceInfo.screenWidth} × {deviceInfo.screenHeight}</div>
              <div>Orientation: {deviceInfo.orientation}</div>
              <div>Touch: {deviceInfo.touchSupported ? 'Yes' : 'No'}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="grid grid-cols-5 gap-1 p-2">
          <button
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent active:scale-95 transition-all"
            onClick={() => router.push('/dashboard/perfumes')}
          >
            <Beaker className="h-5 w-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent active:scale-95 transition-all"
            onClick={() => router.push('/dashboard/perfumes/search')}
          >
            <Search className="h-5 w-5" />
            <span className="text-[10px] font-medium">Search</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-primary text-primary-foreground active:scale-95 transition-all"
            onClick={() => router.push('/dashboard/perfumes/create')}
          >
            <Plus className="h-6 w-6" />
            <span className="text-[10px] font-medium">Create</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent active:scale-95 transition-all"
            onClick={() => router.push('/dashboard/perfumes/analytics')}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-[10px] font-medium">Stats</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent active:scale-95 transition-all"
            onClick={toggleMenu}
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </div>
    </div>
  );
}
