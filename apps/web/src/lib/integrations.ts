/**
 * Professional Integrations & API Framework
 * External service connections, webhooks, and data export
 */

export interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  permissions: string[];
  status: 'active' | 'revoked' | 'expired';
  usageCount: number;
  rateLimit: number; // requests per hour
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  status: 'active' | 'inactive' | 'error';
  secret: string;
  createdAt: Date;
  lastTriggered?: Date;
  deliveryCount: number;
  failureCount: number;
}

export type WebhookEvent =
  | 'formula.created'
  | 'formula.updated'
  | 'formula.deleted'
  | 'ingredient.added'
  | 'order.created'
  | 'client.created'
  | 'lab_note.completed';

export interface ExternalIntegration {
  id: string;
  type: 'erp' | 'ecommerce' | 'crm' | 'analytics' | 'shipping' | 'payment';
  provider: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  connectedAt?: Date;
  lastSync?: Date;
  syncEnabled: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  type: 'api_call' | 'webhook' | 'sync' | 'export';
  action: string;
  status: 'success' | 'error' | 'pending';
  timestamp: Date;
  duration?: number; // ms
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface DataExport {
  id: string;
  type: 'formulas' | 'ingredients' | 'clients' | 'orders' | 'lab_notes' | 'full';
  format: 'json' | 'csv' | 'xml' | 'excel';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  recordCount?: number;
  fileSize?: number; // bytes
}

/**
 * Generate API key
 */
export function generateAPIKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'pk_live_';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + key;
}

/**
 * Generate webhook secret
 */
export function generateWebhookSecret(): string {
  const chars = 'abcdef0123456789';
  let secret = 'whsec_';
  for (let i = 0; i < 40; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

/**
 * Mock API keys
 */
export function generateMockAPIKeys(count: number = 3): APIKey[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `key-${i + 1}`,
    name: ['Production API', 'Development API', 'Testing API'][i] || `API Key ${i + 1}`,
    key: generateAPIKey(),
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    lastUsed: Math.random() > 0.3
      ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      : undefined,
    permissions: ['read:formulas', 'write:formulas', 'read:ingredients', 'read:clients'],
    status: i === 0 ? 'active' : i === 1 ? 'active' : 'revoked',
    usageCount: Math.floor(Math.random() * 10000),
    rateLimit: 1000,
  }));
}

/**
 * Mock webhooks
 */
export function generateMockWebhooks(count: number = 4): Webhook[] {
  const events: WebhookEvent[] = [
    'formula.created',
    'formula.updated',
    'order.created',
    'client.created',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `webhook-${i + 1}`,
    name: `${['Formula', 'Order', 'Client', 'Lab Note'][i]} Webhook`,
    url: `https://api.example.com/webhooks/${['formulas', 'orders', 'clients', 'lab-notes'][i]}`,
    events: [events[i % events.length]],
    status: ['active', 'active', 'inactive', 'error'][i] as any,
    secret: generateWebhookSecret(),
    createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
    lastTriggered: Math.random() > 0.5
      ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      : undefined,
    deliveryCount: Math.floor(Math.random() * 500),
    failureCount: Math.floor(Math.random() * 10),
  }));
}

/**
 * Mock external integrations
 */
export function generateMockIntegrations(): ExternalIntegration[] {
  return [
    {
      id: 'int-1',
      type: 'erp',
      provider: 'SAP',
      name: 'SAP Business One',
      status: 'connected',
      config: { endpoint: 'https://sap.example.com', apiVersion: '2.0' },
      connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      syncEnabled: true,
      syncFrequency: 'hourly',
    },
    {
      id: 'int-2',
      type: 'ecommerce',
      provider: 'Shopify',
      name: 'Perfume Store',
      status: 'connected',
      config: { shopDomain: 'perfume-store.myshopify.com' },
      connectedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      lastSync: new Date(Date.now() - 30 * 60 * 1000),
      syncEnabled: true,
      syncFrequency: 'realtime',
    },
    {
      id: 'int-3',
      type: 'crm',
      provider: 'Salesforce',
      name: 'Sales Cloud',
      status: 'disconnected',
      config: {},
      syncEnabled: false,
      syncFrequency: 'daily',
    },
    {
      id: 'int-4',
      type: 'analytics',
      provider: 'Google Analytics',
      name: 'Website Analytics',
      status: 'connected',
      config: { propertyId: 'GA-123456789' },
      connectedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      lastSync: new Date(Date.now() - 60 * 1000),
      syncEnabled: true,
      syncFrequency: 'realtime',
    },
    {
      id: 'int-5',
      type: 'shipping',
      provider: 'FedEx',
      name: 'FedEx Shipping',
      status: 'error',
      config: { accountNumber: 'XXX-XXX-XXX' },
      connectedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
      syncEnabled: true,
      syncFrequency: 'daily',
    },
  ];
}

/**
 * Mock integration logs
 */
export function generateMockLogs(count: number = 20): IntegrationLog[] {
  const types: IntegrationLog['type'][] = ['api_call', 'webhook', 'sync', 'export'];
  const statuses: IntegrationLog['status'][] = ['success', 'error', 'pending'];
  const actions = [
    'GET /api/formulas',
    'POST /api/formulas',
    'Webhook: formula.created',
    'Sync: Products to Shopify',
    'Export: Formulas to CSV',
    'GET /api/clients',
    'Sync: Orders from ERP',
  ];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      id: `log-${i + 1}`,
      integrationId: `int-${Math.floor(Math.random() * 5) + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      status,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      duration: Math.floor(Math.random() * 2000),
      errorMessage: status === 'error' ? 'Connection timeout' : undefined,
    };
  });
}

/**
 * Mock data exports
 */
export function generateMockExports(count: number = 5): DataExport[] {
  const types: DataExport['type'][] = ['formulas', 'ingredients', 'clients', 'orders', 'full'];
  const formats: DataExport['format'][] = ['json', 'csv', 'xml', 'excel'];
  const statuses: DataExport['status'][] = ['completed', 'completed', 'processing', 'failed', 'pending'];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[i % statuses.length];
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    return {
      id: `export-${i + 1}`,
      type: types[i % types.length],
      format: formats[i % formats.length],
      status,
      createdAt,
      completedAt: status === 'completed'
        ? new Date(createdAt.getTime() + Math.random() * 60 * 60 * 1000)
        : undefined,
      downloadUrl: status === 'completed'
        ? `/downloads/export-${i + 1}.${formats[i % formats.length]}`
        : undefined,
      recordCount: status === 'completed' ? Math.floor(Math.random() * 1000) + 100 : undefined,
      fileSize: status === 'completed' ? Math.floor(Math.random() * 10000000) + 100000 : undefined,
    };
  });
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Get integration status color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'connected':
    case 'success':
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'inactive':
    case 'disconnected':
    case 'pending':
    case 'processing':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'error':
    case 'failed':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'revoked':
    case 'expired':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    default:
      return 'bg-blue-100 text-blue-700 border-blue-300';
  }
}

/**
 * Get integration provider icon/color
 */
export function getProviderColor(type: ExternalIntegration['type']): string {
  switch (type) {
    case 'erp':
      return 'bg-blue-500';
    case 'ecommerce':
      return 'bg-purple-500';
    case 'crm':
      return 'bg-green-500';
    case 'analytics':
      return 'bg-orange-500';
    case 'shipping':
      return 'bg-indigo-500';
    case 'payment':
      return 'bg-pink-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Save API key (localStorage)
 */
export function saveAPIKeys(keys: APIKey[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('api-keys', JSON.stringify(keys));
}

/**
 * Get API keys (localStorage)
 */
export function getStoredAPIKeys(): APIKey[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('api-keys');
  if (!stored) return [];

  try {
    return JSON.parse(stored).map((k: any) => ({
      ...k,
      createdAt: new Date(k.createdAt),
      lastUsed: k.lastUsed ? new Date(k.lastUsed) : undefined,
    }));
  } catch {
    return [];
  }
}
