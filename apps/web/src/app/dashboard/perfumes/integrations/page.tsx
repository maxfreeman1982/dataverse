'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronLeft,
  Plug2,
  Key,
  Webhook,
  Download,
  Activity,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  generateMockAPIKeys,
  generateMockWebhooks,
  generateMockIntegrations,
  generateMockLogs,
  generateMockExports,
  generateAPIKey,
  generateWebhookSecret,
  formatFileSize,
  getStatusColor,
  getProviderColor,
  type APIKey as APIKeyType,
  type Webhook as WebhookType,
  type ExternalIntegration,
} from '@/lib/integrations';
import { copyToClipboard } from '@/lib/mobile';
import { cn } from '@/lib/utils';

export default function IntegrationsPage() {
  const router = useRouter();

  const [apiKeys, setApiKeys] = useState<APIKeyType[]>(() => generateMockAPIKeys(3));
  const [webhooks, setWebhooks] = useState<WebhookType[]>(() => generateMockWebhooks(4));
  const [integrations] = useState<ExternalIntegration[]>(() => generateMockIntegrations());
  const [logs] = useState(() => generateMockLogs(20));
  const [exports] = useState(() => generateMockExports(5));

  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Toggle key visibility
  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  // Copy key to clipboard
  const handleCopyKey = async (key: string) => {
    const success = await copyToClipboard(key);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Mask API key
  const maskKey = (key: string): string => {
    if (key.length < 12) return key;
    const prefix = key.substring(0, 8);
    const suffix = key.substring(key.length - 4);
    return `${prefix}${'*'.repeat(Math.min(20, key.length - 12))}${suffix}`;
  };

  // Generate new API key
  const handleCreateAPIKey = () => {
    const newKey: APIKeyType = {
      id: `key-${apiKeys.length + 1}`,
      name: `API Key ${apiKeys.length + 1}`,
      key: generateAPIKey(),
      createdAt: new Date(),
      permissions: ['read:formulas', 'read:ingredients'],
      status: 'active',
      usageCount: 0,
      rateLimit: 1000,
    };
    setApiKeys([...apiKeys, newKey]);
    setVisibleKeys(new Set([newKey.id]));
  };

  // Revoke API key
  const handleRevokeKey = (keyId: string) => {
    setApiKeys(apiKeys.map((k) => (k.id === keyId ? { ...k, status: 'revoked' as const } : k)));
  };

  // Stats
  const stats = useMemo(() => {
    const activeKeys = apiKeys.filter((k) => k.status === 'active').length;
    const activeWebhooks = webhooks.filter((w) => w.status === 'active').length;
    const connectedIntegrations = integrations.filter((i) => i.status === 'connected').length;
    const recentLogs = logs.filter(
      (l) => Date.now() - l.timestamp.getTime() < 24 * 60 * 60 * 1000
    ).length;

    return {
      activeKeys,
      activeWebhooks,
      connectedIntegrations,
      recentLogs,
    };
  }, [apiKeys, webhooks, integrations, logs]);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Plug2 className="h-8 w-8 text-cyan-600" />
              Professional Integrations
            </h2>
            <p className="text-muted-foreground">
              API keys, webhooks, and external service connections
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeKeys}</div>
            <p className="text-xs text-muted-foreground">Of {apiKeys.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Webhooks</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWebhooks}</div>
            <p className="text-xs text-muted-foreground">Configured endpoints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Services</CardTitle>
            <Plug2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.connectedIntegrations}</div>
            <p className="text-xs text-muted-foreground">External platforms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentLogs}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="api-keys">
        <TabsList>
          <TabsTrigger value="api-keys">
            <Key className="mr-2 h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="mr-2 h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="services">
            <Plug2 className="mr-2 h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="mr-2 h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="exports">
            <Download className="mr-2 h-4 w-4" />
            Exports
          </TabsTrigger>
        </TabsList>

        {/* API Keys */}
        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage authentication keys for API access</CardDescription>
                </div>
                <Button onClick={handleCreateAPIKey}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{apiKey.name}</h4>
                        <Badge className={getStatusColor(apiKey.status)}>{apiKey.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-mono bg-muted px-3 py-2 rounded">
                        {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {visibleKeys.has(apiKey.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyKey(apiKey.key)}
                        >
                          {copiedKey === apiKey.key ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {apiKey.status === 'active' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeKey(apiKey.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Revoke
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Created</div>
                      <div>{apiKey.createdAt.toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Last Used</div>
                      <div>{apiKey.lastUsed?.toLocaleDateString() || 'Never'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Usage</div>
                      <div>{apiKey.usageCount.toLocaleString()} requests</div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {apiKey.permissions.map((perm) => (
                      <Badge key={perm} variant="secondary" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>Configure event-driven HTTP callbacks</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{webhook.name}</h4>
                        <Badge className={getStatusColor(webhook.status)}>{webhook.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{webhook.url}</div>
                      <div className="flex flex-wrap gap-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Deliveries</div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        {webhook.deliveryCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Failures</div>
                      <div className="flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        {webhook.failureCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Last Triggered</div>
                      <div>{webhook.lastTriggered?.toLocaleDateString() || 'Never'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* External Services */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'p-3 rounded-lg text-white',
                          getProviderColor(integration.type)
                        )}
                      >
                        <Plug2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.provider}</CardTitle>
                        <CardDescription>{integration.name}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(integration.status)}>
                      {integration.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Type</div>
                      <div className="capitalize">{integration.type}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Sync</div>
                      <div className="capitalize">{integration.syncFrequency}</div>
                    </div>
                  </div>
                  {integration.lastSync && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last synced {integration.lastSync.toLocaleString()}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {integration.status === 'connected' ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync Now
                        </Button>
                        <Button variant="outline" size="sm">
                          Settings
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className="flex-1">
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Recent integration activity and API calls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                      <div>
                        <div className="font-medium">{log.action}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.type.replace('_', ' ')} • {log.timestamp.toLocaleString()}
                        </div>
                        {log.errorMessage && (
                          <div className="text-xs text-red-600 mt-1">{log.errorMessage}</div>
                        )}
                      </div>
                    </div>
                    {log.duration && (
                      <div className="text-xs text-muted-foreground">{log.duration}ms</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Exports */}
        <TabsContent value="exports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Exports</CardTitle>
                  <CardDescription>Export your data in various formats</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {exports.map((exp) => (
                <div key={exp.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold capitalize">
                          {exp.type.replace('_', ' ')} Export
                        </h4>
                        <Badge className={getStatusColor(exp.status)}>{exp.status}</Badge>
                        <Badge variant="outline" className="uppercase">
                          {exp.format}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created {exp.createdAt.toLocaleString()}
                      </div>
                    </div>
                    {exp.status === 'completed' && exp.downloadUrl && (
                      <Button size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    )}
                  </div>
                  {exp.status === 'completed' && (
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Records:</span>{' '}
                        {exp.recordCount?.toLocaleString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Size:</span>{' '}
                        {exp.fileSize ? formatFileSize(exp.fileSize) : 'N/A'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
