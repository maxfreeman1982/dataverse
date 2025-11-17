/**
 * Client Profiles & CRM System
 * Manage client relationships, preferences, and order history
 */

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  type: 'individual' | 'business';
  segment: 'vip' | 'regular' | 'prospect' | 'inactive';

  // Contact details
  address?: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };

  // Olfactive preferences
  preferences: {
    favoriteFamily: string[];
    dislikedFamily: string[];
    preferredIntensity: 'light' | 'moderate' | 'strong';
    allergyRestrictions: string[];
    notes: string;
  };

  // Purchase history
  orders: Order[];
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;

  // Favorite formulas
  favoriteFormulas: string[];

  // Interactions
  interactions: Interaction[];

  // Metadata
  tags: string[];
  assignedTo?: string; // Perfumer/Sales rep
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  date: Date;
  formulaId: string;
  formulaName: string;
  quantity: number; // in ml
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Interaction {
  id: string;
  date: Date;
  type: 'consultation' | 'sample-sent' | 'phone-call' | 'email' | 'meeting' | 'note';
  subject: string;
  description: string;
  outcome?: string;
  nextFollowUp?: Date;
}

export interface ClientStats {
  totalClients: number;
  bySegment: Record<Client['segment'], number>;
  byType: Record<Client['type'], number>;
  totalRevenue: number;
  averageLifetimeValue: number;
  activeClients: number; // Ordered in last 90 days
  topClients: Client[];
  recentInteractions: number;
}

/**
 * Generate mock client data
 */
export function generateMockClients(count: number = 20): Client[] {
  const firstNames = [
    'Sophie', 'Jean', 'Marie', 'Pierre', 'Isabelle', 'Laurent', 'Camille', 'Antoine',
    'Charlotte', 'Alexandre', 'Emma', 'Lucas', 'Léa', 'Thomas', 'Chloé', 'Nicolas',
    'Julie', 'Mathieu', 'Sarah', 'Benjamin', 'Laura', 'David', 'Manon', 'Julien',
  ];

  const lastNames = [
    'Dubois', 'Martin', 'Bernard', 'Petit', 'Robert', 'Richard', 'Durand', 'Leroy',
    'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand',
    'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'André', 'Mercier', 'Dupont',
  ];

  const companies = [
    'Parfums de Luxe', 'Maison Aromatique', 'Essence & Co', 'Boutique Senteur',
    'Le Nez Parisien', 'Fragrance Atelier', null, null, null, null,
  ];

  const cities = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Bordeaux', 'Lille',
    'Strasbourg', 'Montpellier', 'Rennes', 'Geneva', 'Brussels', 'Monaco', 'Luxembourg',
  ];

  const families = ['Floral', 'Citrus', 'Woody', 'Oriental', 'Fresh', 'Gourmand', 'Chypre'];
  const segments: Client['segment'][] = ['vip', 'regular', 'prospect', 'inactive'];
  const types: Client['type'][] = ['individual', 'business'];

  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const company = companies[Math.floor(Math.random() * companies.length)];
    const type: Client['type'] = company ? 'business' : 'individual';
    const segment = segments[Math.floor(Math.random() * segments.length)];

    const orderCount = segment === 'vip' ? 5 + Math.floor(Math.random() * 10)
      : segment === 'regular' ? 2 + Math.floor(Math.random() * 5)
      : segment === 'prospect' ? Math.floor(Math.random() * 2)
      : 0;

    const orders: Order[] = Array.from({ length: orderCount }, (_, j) => {
      const date = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const quantity = [30, 50, 100, 250, 500][Math.floor(Math.random() * 5)];
      const unitPrice = 0.5 + Math.random() * 2;

      return {
        id: `order-${i}-${j}`,
        date,
        formulaId: `formula-${Math.floor(Math.random() * 10) + 1}`,
        formulaName: `Formula ${Math.floor(Math.random() * 10) + 1}`,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
        status: j === 0 && Math.random() > 0.7 ? 'processing' : 'completed',
      };
    });

    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
    const lastOrderDate = orders.length > 0
      ? new Date(Math.max(...orders.map(o => o.date.getTime())))
      : undefined;

    const interactionCount = 1 + Math.floor(Math.random() * 5);
    const interactionTypes: Interaction['type'][] = [
      'consultation', 'sample-sent', 'phone-call', 'email', 'meeting', 'note'
    ];

    const interactions: Interaction[] = Array.from({ length: interactionCount }, (_, j) => {
      const date = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000);
      const type = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];

      return {
        id: `interaction-${i}-${j}`,
        date,
        type,
        subject: type === 'consultation' ? 'Initial olfactive profile consultation'
          : type === 'sample-sent' ? 'Sent sample set of 5 formulas'
          : type === 'phone-call' ? 'Follow-up on recent order'
          : type === 'email' ? 'New collection announcement'
          : type === 'meeting' ? 'In-person fragrance creation session'
          : 'General note',
        description: 'Discussed preferences and explored new olfactive directions.',
        outcome: Math.random() > 0.5 ? 'Positive - interested in custom creation' : undefined,
        nextFollowUp: Math.random() > 0.6
          ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
          : undefined,
      };
    });

    const favoriteFamily = families.filter(() => Math.random() > 0.5).slice(0, 3);
    const dislikedFamily = families.filter(() => Math.random() > 0.7).slice(0, 2);

    return {
      id: `client-${i + 1}`,
      name,
      email,
      phone: Math.random() > 0.3 ? `+33 ${Math.floor(Math.random() * 900000000) + 100000000}` : undefined,
      company: company || undefined,
      type,
      segment,
      address: Math.random() > 0.4 ? {
        street: `${Math.floor(Math.random() * 200) + 1} Rue de la Parfumerie`,
        city: cities[Math.floor(Math.random() * cities.length)],
        country: 'France',
        postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      } : undefined,
      preferences: {
        favoriteFamily,
        dislikedFamily,
        preferredIntensity: ['light', 'moderate', 'strong'][Math.floor(Math.random() * 3)] as any,
        allergyRestrictions: Math.random() > 0.7 ? ['Linalool', 'Limonene'] : [],
        notes: 'Prefers fresh, citrus-forward compositions with subtle woody base notes.',
      },
      orders,
      totalSpent,
      averageOrderValue,
      lastOrderDate,
      favoriteFormulas: [`formula-${Math.floor(Math.random() * 5) + 1}`, `formula-${Math.floor(Math.random() * 5) + 6}`],
      interactions,
      tags: ['loyal-customer', 'high-value'].filter(() => Math.random() > 0.5),
      assignedTo: Math.random() > 0.5 ? 'Master Perfumer' : 'Junior Perfumer',
      createdAt: new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    };
  });
}

/**
 * Get client statistics
 */
export function getClientStats(clients: Client[]): ClientStats {
  const bySegment: Record<Client['segment'], number> = {
    'vip': 0,
    'regular': 0,
    'prospect': 0,
    'inactive': 0,
  };

  const byType: Record<Client['type'], number> = {
    'individual': 0,
    'business': 0,
  };

  let totalRevenue = 0;
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  let activeCount = 0;
  let recentInteractionCount = 0;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  clients.forEach((client) => {
    bySegment[client.segment]++;
    byType[client.type]++;
    totalRevenue += client.totalSpent;

    if (client.lastOrderDate && client.lastOrderDate > ninetyDaysAgo) {
      activeCount++;
    }

    const recentInteractions = client.interactions.filter(i => i.date > thirtyDaysAgo);
    recentInteractionCount += recentInteractions.length;
  });

  const averageLifetimeValue = clients.length > 0 ? totalRevenue / clients.length : 0;

  const topClients = [...clients]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return {
    totalClients: clients.length,
    bySegment,
    byType,
    totalRevenue,
    averageLifetimeValue,
    activeClients: activeCount,
    topClients,
    recentInteractions: recentInteractionCount,
  };
}

/**
 * Filter clients
 */
export function filterClients(
  clients: Client[],
  filters: {
    segment?: Client['segment'][];
    type?: Client['type'][];
    searchQuery?: string;
    minSpent?: number;
    hasOrders?: boolean;
    tags?: string[];
  }
): Client[] {
  return clients.filter((client) => {
    // Segment filter
    if (filters.segment && filters.segment.length > 0) {
      if (!filters.segment.includes(client.segment)) return false;
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(client.type)) return false;
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchText = [
        client.name,
        client.email,
        client.company || '',
        client.phone || '',
      ].join(' ').toLowerCase();

      if (!searchText.includes(query)) return false;
    }

    // Minimum spent filter
    if (filters.minSpent !== undefined) {
      if (client.totalSpent < filters.minSpent) return false;
    }

    // Has orders filter
    if (filters.hasOrders !== undefined) {
      const hasOrders = client.orders.length > 0;
      if (filters.hasOrders !== hasOrders) return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasAllTags = filters.tags.every((tag) => client.tags.includes(tag));
      if (!hasAllTags) return false;
    }

    return true;
  });
}

/**
 * Sort clients
 */
export function sortClients(
  clients: Client[],
  sortBy: 'name' | 'totalSpent' | 'lastOrder' | 'created',
  order: 'asc' | 'desc' = 'desc'
): Client[] {
  const sorted = [...clients].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'totalSpent':
        comparison = a.totalSpent - b.totalSpent;
        break;
      case 'lastOrder':
        const aTime = a.lastOrderDate?.getTime() || 0;
        const bTime = b.lastOrderDate?.getTime() || 0;
        comparison = aTime - bTime;
        break;
      case 'created':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Export client to CSV format
 */
export function exportClientToCSV(client: Client): string {
  const lines: string[] = [];

  lines.push('CLIENT PROFILE');
  lines.push('');
  lines.push(`Name,${client.name}`);
  lines.push(`Email,${client.email}`);
  lines.push(`Phone,${client.phone || 'N/A'}`);
  lines.push(`Company,${client.company || 'N/A'}`);
  lines.push(`Type,${client.type}`);
  lines.push(`Segment,${client.segment}`);
  lines.push('');
  lines.push('FINANCIAL SUMMARY');
  lines.push(`Total Spent,€${client.totalSpent.toFixed(2)}`);
  lines.push(`Average Order Value,€${client.averageOrderValue.toFixed(2)}`);
  lines.push(`Total Orders,${client.orders.length}`);
  lines.push('');
  lines.push('ORDER HISTORY');
  lines.push('Date,Formula,Quantity,Unit Price,Total,Status');
  client.orders.forEach((order) => {
    lines.push(`${order.date.toLocaleDateString()},${order.formulaName},${order.quantity}ml,€${order.unitPrice.toFixed(2)},€${order.totalPrice.toFixed(2)},${order.status}`);
  });

  return lines.join('\n');
}

/**
 * Save client to localStorage
 */
export function saveClient(client: Client): void {
  const clients = getStoredClients();
  const existingIndex = clients.findIndex((c) => c.id === client.id);

  if (existingIndex >= 0) {
    clients[existingIndex] = { ...client, updatedAt: new Date() };
  } else {
    clients.push({ ...client, createdAt: new Date(), updatedAt: new Date() });
  }

  localStorage.setItem('client-profiles', JSON.stringify(clients));
}

/**
 * Get clients from localStorage
 */
export function getStoredClients(): Client[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('client-profiles');
  if (!stored) return [];

  try {
    return JSON.parse(stored).map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      lastOrderDate: c.lastOrderDate ? new Date(c.lastOrderDate) : undefined,
      orders: c.orders.map((o: any) => ({
        ...o,
        date: new Date(o.date),
      })),
      interactions: c.interactions.map((i: any) => ({
        ...i,
        date: new Date(i.date),
        nextFollowUp: i.nextFollowUp ? new Date(i.nextFollowUp) : undefined,
      })),
    }));
  } catch {
    return [];
  }
}

/**
 * Delete client from localStorage
 */
export function deleteClient(id: string): void {
  const clients = getStoredClients();
  const filtered = clients.filter((c) => c.id !== id);
  localStorage.setItem('client-profiles', JSON.stringify(filtered));
}
