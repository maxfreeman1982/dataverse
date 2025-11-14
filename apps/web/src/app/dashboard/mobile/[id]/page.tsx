'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GET_MOBILE_APP,
  GET_BUILDS,
  GET_PUSH_NOTIFICATIONS,
  CREATE_BUILD,
  CREATE_PUSH_NOTIFICATION,
  SEND_PUSH_NOTIFICATION,
  DELETE_PUSH_NOTIFICATION,
} from '@/graphql/mobile-app';
import {
  ArrowLeft,
  Package,
  Bell,
  Info,
  Plus,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Send,
} from 'lucide-react';
import Link from 'next/link';

export default function MobileAppDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const { data: appData, loading: appLoading } = useQuery(GET_MOBILE_APP, {
    variables: { id: appId },
  });

  const { data: buildsData, refetch: refetchBuilds } = useQuery(GET_BUILDS, {
    variables: { input: { appId } },
  });

  const { data: notificationsData, refetch: refetchNotifications } = useQuery(GET_PUSH_NOTIFICATIONS, {
    variables: { input: { appId } },
  });

  const app = appData?.mobileApp;
  const builds = buildsData?.builds || [];
  const notifications = notificationsData?.pushNotifications || [];

  if (appLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">App not found</p>
            <Button onClick={() => router.push('/dashboard/mobile')} className="mt-4">
              Back to Mobile Apps
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/mobile')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Apps
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{app.name}</CardTitle>
              <CardDescription>{app.description}</CardDescription>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary">{app.platform}</Badge>
                <Badge>{app.status}</Badge>
                <Badge variant="outline">{app.category}</Badge>
                {app.isPublished && <Badge variant="default">Published</Badge>}
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="builds" className="space-y-4">
            <TabsList>
              <TabsTrigger value="builds">
                <Package className="h-4 w-4 mr-2" />
                Builds ({builds.length})
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Push Notifications ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="info">
                <Info className="h-4 w-4 mr-2" />
                Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builds">
              <BuildsTab appId={appId} builds={builds} refetch={refetchBuilds} />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationsTab
                appId={appId}
                notifications={notifications}
                refetch={refetchNotifications}
                isPushEnabled={app.isPushEnabled}
              />
            </TabsContent>

            <TabsContent value="info">
              <AppInfoTab app={app} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Downloads:</span>
                <span className="font-semibold">{app.totalDownloads.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Users:</span>
                <span className="font-semibold">{app.activeUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Rating:</span>
                <span className="font-semibold">
                  {app.averageRating?.toFixed(1) || 'N/A'} ({app.reviewCount} reviews)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Version:</span>
                <span className="font-semibold">
                  {app.currentVersion} ({app.currentBuildNumber})
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Push Notifications:</span>
                {app.isPushEnabled ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Offline Mode:</span>
                {app.isOfflineEnabled ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BuildsTab({ appId, builds, refetch }: { appId: string; builds: any[]; refetch: () => void }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [version, setVersion] = useState('');
  const [buildNumber, setBuildNumber] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');

  const [createBuild, { loading: creating }] = useMutation(CREATE_BUILD, {
    onCompleted: () => {
      refetch();
      setShowCreateForm(false);
      setVersion('');
      setBuildNumber('');
      setReleaseNotes('');
    },
  });

  const handleCreate = async () => {
    await createBuild({
      variables: {
        input: {
          appId,
          version,
          buildNumber: parseInt(buildNumber),
          type: 'development',
          releaseNotes,
        },
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'building':
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {!showCreateForm ? (
        <Button onClick={() => setShowCreateForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Build
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create New Build</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Version</label>
              <Input
                placeholder="1.0.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Build Number</label>
              <Input
                type="number"
                placeholder="1"
                value={buildNumber}
                onChange={(e) => setBuildNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Release Notes</label>
              <Textarea
                placeholder="What's new in this version..."
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={handleCreate} disabled={creating || !version || !buildNumber}>
              Create Build
            </Button>
            <Button onClick={() => setShowCreateForm(false)} variant="outline">
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="space-y-3">
        {builds.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No builds yet</p>
            </CardContent>
          </Card>
        ) : (
          builds.map((build: any) => (
            <Card key={build.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Version {build.version} (Build {build.buildNumber})
                      {getStatusIcon(build.status)}
                    </CardTitle>
                    <CardDescription>
                      {new Date(build.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{build.status}</Badge>
                    <Badge variant="outline">{build.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              {build.releaseNotes && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{build.releaseNotes}</p>
                  {build.buildDuration && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Built in {build.buildDuration}s
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function NotificationsTab({
  appId,
  notifications,
  refetch,
  isPushEnabled,
}: {
  appId: string;
  notifications: any[];
  refetch: () => void;
  isPushEnabled: boolean;
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const [createNotification, { loading: creating }] = useMutation(CREATE_PUSH_NOTIFICATION, {
    onCompleted: () => {
      refetch();
      setShowCreateForm(false);
      setTitle('');
      setMessage('');
    },
  });

  const [sendNotification] = useMutation(SEND_PUSH_NOTIFICATION, {
    onCompleted: () => {
      refetch();
    },
  });

  const [deleteNotification] = useMutation(DELETE_PUSH_NOTIFICATION, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleCreate = async () => {
    await createNotification({
      variables: {
        input: {
          appId,
          title,
          message,
          target: 'all_users',
        },
      },
    });
  };

  const handleSend = async (id: string) => {
    await sendNotification({
      variables: {
        input: { id, sendImmediately: true },
      },
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this notification?')) {
      await deleteNotification({ variables: { id } });
    }
  };

  if (!isPushEnabled) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Push notifications are not enabled for this app</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {!showCreateForm ? (
        <Button onClick={() => setShowCreateForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Notification
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create Push Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Notification title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Notification message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={handleCreate} disabled={creating || !title || !message}>
              Create Notification
            </Button>
            <Button onClick={() => setShowCreateForm(false)} variant="outline">
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification: any) => (
            <Card key={notification.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle>{notification.title}</CardTitle>
                    <CardDescription>{notification.message}</CardDescription>
                  </div>
                  <Badge>{notification.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Target:</span> {notification.target}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority:</span> {notification.priority}
                  </div>
                  {notification.totalRecipients > 0 && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Recipients:</span>{' '}
                        {notification.totalRecipients.toLocaleString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Delivered:</span>{' '}
                        {notification.deliveredCount.toLocaleString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Opened:</span>{' '}
                        {notification.openedCount.toLocaleString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Clicked:</span>{' '}
                        {notification.clickedCount.toLocaleString()}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                {notification.status === 'draft' && (
                  <Button onClick={() => handleSend(notification.id)} size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Send Now
                  </Button>
                )}
                {(notification.status === 'draft' || notification.status === 'scheduled') && (
                  <Button onClick={() => handleDelete(notification.id)} variant="destructive" size="sm">
                    Delete
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function AppInfoTab({ app }: { app: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>App Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-muted-foreground">Slug:</span>
            <p className="font-medium">{app.slug}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Platform:</span>
            <p className="font-medium capitalize">{app.platform}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Category:</span>
            <p className="font-medium capitalize">{app.category}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <p className="font-medium capitalize">{app.status}</p>
          </div>
          {app.bundleId && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Bundle ID:</span>
              <p className="font-medium">{app.bundleId}</p>
            </div>
          )}
          {app.packageName && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Package Name:</span>
              <p className="font-medium">{app.packageName}</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Created:</span>
            <p className="font-medium">{new Date(app.createdAt).toLocaleDateString()}</p>
          </div>
          {app.publishedAt && (
            <div>
              <span className="text-muted-foreground">Published:</span>
              <p className="font-medium">{new Date(app.publishedAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
