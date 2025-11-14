'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GET_MOBILE_APPS,
  DELETE_MOBILE_APP,
  PUBLISH_MOBILE_APP,
  SEED_MOBILE_APPS,
} from '@/graphql/mobile-app';
import {
  Smartphone,
  Search,
  Apple,
  Bot as Android,
  Download,
  Users,
  Star,
  Sparkles,
  Plus,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function MobileAppsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  const { data: appsData, loading: appsLoading, refetch: refetchApps } = useQuery(GET_MOBILE_APPS, {
    variables: {
      input: {
        search: searchQuery || undefined,
        platform: selectedPlatform,
        status: selectedStatus,
      },
    },
  });

  const [deleteApp, { loading: deleting }] = useMutation(DELETE_MOBILE_APP, {
    onCompleted: () => {
      refetchApps();
    },
  });

  const [publishApp] = useMutation(PUBLISH_MOBILE_APP, {
    onCompleted: () => {
      refetchApps();
    },
  });

  const [seedMobileApps] = useMutation(SEED_MOBILE_APPS, {
    onCompleted: () => {
      refetchApps();
    },
  });

  const apps = appsData?.mobileApps || [];

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this app?')) {
      await deleteApp({ variables: { id } });
    }
  };

  const handlePublish = async (id: string) => {
    await publishApp({ variables: { id } });
  };

  const platforms = [
    { value: 'ios', label: 'iOS' },
    { value: 'android', label: 'Android' },
    { value: 'both', label: 'Both' },
  ];

  const statuses = [
    { value: 'development', label: 'Development' },
    { value: 'testing', label: 'Testing' },
    { value: 'production', label: 'Production' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mobile Apps</h1>
          <p className="text-muted-foreground">Manage your iOS and Android applications</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => seedMobileApps()} variant="outline" size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Seed Apps
          </Button>
          <Link href="/dashboard/mobile/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New App
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="apps" className="space-y-6">
        <TabsList>
          <TabsTrigger value="apps">
            <Smartphone className="h-4 w-4 mr-2" />
            Apps ({apps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="apps" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={selectedPlatform || ''}
              onChange={(e) => setSelectedPlatform(e.target.value || undefined)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="">All Platforms</option>
              {platforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || undefined)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Apps Grid */}
          {appsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : apps.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No mobile apps found</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => seedMobileApps()}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Seed Sample Apps
                  </Button>
                  <Link href="/dashboard/mobile/new">
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New App
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {apps.map((app: any) => (
                <MobileAppCard
                  key={app.id}
                  app={app}
                  onDelete={handleDelete}
                  onPublish={handlePublish}
                  deleting={deleting}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MobileAppCard({
  app,
  onDelete,
  onPublish,
  deleting,
}: {
  app: any;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  deleting: boolean;
}) {
  const getPlatformIcon = (platform: string) => {
    if (platform === 'ios') return <Apple className="h-4 w-4" />;
    if (platform === 'android') return <Android className="h-4 w-4" />;
    return (
      <div className="flex gap-0.5">
        <Apple className="h-4 w-4" />
        <Android className="h-4 w-4" />
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'development':
        return 'secondary';
      case 'testing':
        return 'default';
      case 'production':
        return 'default';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {app.name}
              {app.isPublished && <Badge variant="default">Published</Badge>}
            </CardTitle>
            <CardDescription>{app.description || 'No description'}</CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">{getPlatformIcon(app.platform)}</Badge>
          <Badge variant={getStatusColor(app.status) as any}>{app.status}</Badge>
          <Badge variant="outline">{app.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version:</span>
            <span>
              {app.currentVersion} ({app.currentBuildNumber})
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>{app.totalDownloads.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{app.activeUsers.toLocaleString()}</span>
            </div>
            {app.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{app.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {app.appStoreUrl && (
            <a href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Apple className="h-4 w-4 mr-1" />
                App Store
              </Button>
            </a>
          )}
          {app.playStoreUrl && (
            <a href={app.playStoreUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Android className="h-4 w-4 mr-1" />
                Play Store
              </Button>
            </a>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/dashboard/mobile/${app.id}`} className="flex-1">
          <Button variant="default" size="sm" className="w-full">
            Manage
          </Button>
        </Link>
        {!app.isPublished && (
          <Button onClick={() => onPublish(app.id)} variant="outline" size="sm">
            Publish
          </Button>
        )}
        <Button
          onClick={() => onDelete(app.id)}
          variant="destructive"
          size="sm"
          disabled={deleting}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
