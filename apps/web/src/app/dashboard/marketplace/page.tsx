'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GET_PLUGINS,
  GET_INSTALLED_PLUGINS,
  INSTALL_PLUGIN,
  UNINSTALL_PLUGIN,
  TOGGLE_PLUGIN,
  SEED_MARKETPLACE
} from '@/graphql/marketplace';
import { Star, Download, Check, Package, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const { data: pluginsData, loading: pluginsLoading, refetch: refetchPlugins } = useQuery(GET_PLUGINS, {
    variables: {
      input: {
        search: searchQuery || undefined,
        category: selectedCategory,
      },
    },
  });

  const { data: installedData, refetch: refetchInstalled } = useQuery(GET_INSTALLED_PLUGINS);

  const [installPlugin, { loading: installing }] = useMutation(INSTALL_PLUGIN, {
    onCompleted: () => {
      refetchPlugins();
      refetchInstalled();
    },
  });

  const [uninstallPlugin, { loading: uninstalling }] = useMutation(UNINSTALL_PLUGIN, {
    onCompleted: () => {
      refetchPlugins();
      refetchInstalled();
    },
  });

  const [togglePlugin] = useMutation(TOGGLE_PLUGIN, {
    onCompleted: () => {
      refetchInstalled();
    },
  });

  const [seedMarketplace] = useMutation(SEED_MARKETPLACE, {
    onCompleted: () => {
      refetchPlugins();
    },
  });

  const plugins = pluginsData?.plugins || [];
  const installedPlugins = installedData?.installedPlugins || [];

  const isPluginInstalled = (pluginId: string) => {
    return installedPlugins.some((ip: any) => ip.plugin.id === pluginId);
  };

  const getInstalledPlugin = (pluginId: string) => {
    return installedPlugins.find((ip: any) => ip.plugin.id === pluginId);
  };

  const handleInstall = async (pluginId: string) => {
    await installPlugin({
      variables: {
        input: { pluginId },
      },
    });
  };

  const handleUninstall = async (pluginId: string) => {
    await uninstallPlugin({
      variables: {
        pluginId,
      },
    });
  };

  const handleToggle = async (pluginId: string) => {
    await togglePlugin({
      variables: {
        pluginId,
      },
    });
  };

  const categories = [
    { value: 'productivity', label: 'Productivity' },
    { value: 'communication', label: 'Communication' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'automation', label: 'Automation' },
    { value: 'ai_ml', label: 'AI/ML' },
    { value: 'integration', label: 'Integration' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'design', label: 'Design' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">Discover and install plugins to extend DataVerse</p>
        </div>
        <Button onClick={() => seedMarketplace()} variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Seed Marketplace
        </Button>
      </div>

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="installed">
            Installed ({installedPlugins.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plugins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || undefined)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Featured Plugins */}
          {plugins.filter((p: any) => p.isFeatured).length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Featured</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {plugins
                  .filter((p: any) => p.isFeatured)
                  .map((plugin: any) => (
                    <PluginCard
                      key={plugin.id}
                      plugin={plugin}
                      isInstalled={isPluginInstalled(plugin.id)}
                      installedPlugin={getInstalledPlugin(plugin.id)}
                      onInstall={handleInstall}
                      onUninstall={handleUninstall}
                      onToggle={handleToggle}
                      installing={installing}
                      uninstalling={uninstalling}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* All Plugins */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {plugins.filter((p: any) => p.isFeatured).length > 0 ? 'More Plugins' : 'All Plugins'}
            </h2>
            {pluginsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : plugins.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No plugins found</p>
                  <Button onClick={() => seedMarketplace()} className="mt-4">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Seed Sample Plugins
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {plugins
                  .filter((p: any) => !p.isFeatured)
                  .map((plugin: any) => (
                    <PluginCard
                      key={plugin.id}
                      plugin={plugin}
                      isInstalled={isPluginInstalled(plugin.id)}
                      installedPlugin={getInstalledPlugin(plugin.id)}
                      onInstall={handleInstall}
                      onUninstall={handleUninstall}
                      onToggle={handleToggle}
                      installing={installing}
                      uninstalling={uninstalling}
                    />
                  ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="installed">
          {installedPlugins.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No plugins installed</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse the Discover tab to find plugins
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {installedPlugins.map((installation: any) => (
                <InstalledPluginCard
                  key={installation.id}
                  installation={installation}
                  onUninstall={handleUninstall}
                  onToggle={handleToggle}
                  uninstalling={uninstalling}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PluginCard({
  plugin,
  isInstalled,
  installedPlugin,
  onInstall,
  onUninstall,
  onToggle,
  installing,
  uninstalling,
}: {
  plugin: any;
  isInstalled: boolean;
  installedPlugin: any;
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onToggle: (id: string) => void;
  installing: boolean;
  uninstalling: boolean;
}) {
  return (
    <Card className={plugin.isFeatured ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {plugin.name}
              {plugin.isVerified && (
                <Check className="h-4 w-4 text-primary" title="Verified" />
              )}
            </CardTitle>
            <CardDescription>{plugin.description}</CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">{plugin.category}</Badge>
          {plugin.isFeatured && <Badge variant="default">Featured</Badge>}
          {plugin.tags?.slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{plugin.averageRating.toFixed(1)}</span>
            <span>({plugin.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>{plugin.downloadCount.toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-2 text-sm">
          <span className="text-muted-foreground">by {plugin.author}</span>
          <span className="text-muted-foreground ml-2">v{plugin.version}</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {isInstalled ? (
          <>
            <Button
              onClick={() => onToggle(plugin.id)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {installedPlugin?.isEnabled ? 'Disable' : 'Enable'}
            </Button>
            <Button
              onClick={() => onUninstall(plugin.id)}
              variant="destructive"
              size="sm"
              disabled={uninstalling}
            >
              Uninstall
            </Button>
          </>
        ) : (
          <Button
            onClick={() => onInstall(plugin.id)}
            className="w-full"
            size="sm"
            disabled={installing}
          >
            Install
          </Button>
        )}
        <Link href={`/dashboard/marketplace/${plugin.id}`}>
          <Button variant="ghost" size="sm">
            Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function InstalledPluginCard({
  installation,
  onUninstall,
  onToggle,
  uninstalling,
}: {
  installation: any;
  onUninstall: (id: string) => void;
  onToggle: (id: string) => void;
  uninstalling: boolean;
}) {
  const plugin = installation.plugin;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {plugin.name}
          {installation.isEnabled ? (
            <Badge variant="default">Enabled</Badge>
          ) : (
            <Badge variant="secondary">Disabled</Badge>
          )}
        </CardTitle>
        <CardDescription>{plugin.description}</CardDescription>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">{plugin.category}</Badge>
          {plugin.tags?.slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version:</span>
            <span>{installation.installedVersion}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Installed:</span>
            <span>{new Date(installation.installedAt).toLocaleDateString()}</span>
          </div>
          {installation.lastUsedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last used:</span>
              <span>{new Date(installation.lastUsedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          onClick={() => onToggle(plugin.id)}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          {installation.isEnabled ? 'Disable' : 'Enable'}
        </Button>
        <Button
          onClick={() => onUninstall(plugin.id)}
          variant="destructive"
          size="sm"
          disabled={uninstalling}
        >
          Uninstall
        </Button>
        <Link href={`/dashboard/marketplace/${plugin.id}`}>
          <Button variant="ghost" size="sm">
            Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
