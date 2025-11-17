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
  Users,
  Plus,
  Download,
  Search,
  TrendingUp,
  Euro,
  ShoppingCart,
  UserCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  Heart,
  Tag,
} from 'lucide-react';
import {
  generateMockClients,
  getClientStats,
  filterClients,
  sortClients,
  exportClientToCSV,
  type Client,
} from '@/lib/client-profiles';
import { cn } from '@/lib/utils';

export default function ClientProfilesPage() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>(() => generateMockClients(20));
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<Client['segment'][]>([]);
  const [typeFilter, setTypeFilter] = useState<Client['type'][]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'totalSpent' | 'lastOrder' | 'created'>('totalSpent');

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    const filtered = filterClients(clients, {
      segment: segmentFilter.length > 0 ? segmentFilter : undefined,
      type: typeFilter.length > 0 ? typeFilter : undefined,
      searchQuery: searchQuery || undefined,
    });
    return sortClients(filtered, sortBy, 'desc');
  }, [clients, searchQuery, segmentFilter, typeFilter, sortBy]);

  // Get statistics
  const stats = useMemo(() => getClientStats(clients), [clients]);

  // Toggle filter
  const toggleFilter = <T extends string>(
    current: T[],
    value: T,
    setter: (value: T[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  // Export client
  const handleExport = (client: Client) => {
    const csv = exportClientToCSV(client);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-${client.id}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Segment badge color
  const getSegmentColor = (segment: Client['segment']) => {
    switch (segment) {
      case 'vip':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'regular':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'prospect':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Type icon
  const getTypeIcon = (type: Client['type']) => {
    return type === 'business' ? <Building2 className="h-4 w-4" /> : <Users className="h-4 w-4" />;
  };

  // Interaction type icon
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <MessageSquare className="h-4 w-4" />;
      case 'sample-sent':
        return <ShoppingCart className="h-4 w-4" />;
      case 'phone-call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'meeting':
        return <Users className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

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
              <Users className="h-8 w-8 text-blue-600" />
              Client Profiles & CRM
            </h2>
            <p className="text-muted-foreground">
              Manage client relationships and preferences
            </p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </div>

      {/* Stats KPIs */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeClients} active (90d)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Clients</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.bySegment.vip}
            </div>
            <p className="text-xs text-muted-foreground">Premium segment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Euro className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              €{stats.totalRevenue.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg LTV</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              €{stats.averageLifetimeValue.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Per client</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.recentInteractions}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>
              {filteredClients.length} of {clients.length} clients
            </CardDescription>

            {/* Search & Filters */}
            <div className="space-y-3 pt-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Segment</div>
                <div className="flex flex-wrap gap-2">
                  {(['vip', 'regular', 'prospect', 'inactive'] as const).map((segment) => (
                    <Badge
                      key={segment}
                      className={cn(
                        'cursor-pointer capitalize',
                        segmentFilter.includes(segment)
                          ? getSegmentColor(segment)
                          : 'bg-gray-100 text-gray-600 border-gray-300'
                      )}
                      onClick={() => toggleFilter(segmentFilter, segment, setSegmentFilter)}
                    >
                      {segment}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Type</div>
                <div className="flex flex-wrap gap-2">
                  {(['individual', 'business'] as const).map((type) => (
                    <Badge
                      key={type}
                      className={cn(
                        'cursor-pointer capitalize',
                        typeFilter.includes(type)
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-gray-100 text-gray-600 border-gray-300'
                      )}
                      onClick={() => toggleFilter(typeFilter, type, setTypeFilter)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className={cn(
                  'p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent',
                  selectedClient?.id === client.id && 'bg-accent border-primary'
                )}
                onClick={() => setSelectedClient(client)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(client.type)}
                      <h4 className="font-semibold text-sm">{client.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">{client.email}</p>
                    {client.company && (
                      <p className="text-xs text-muted-foreground">{client.company}</p>
                    )}
                  </div>
                  <Badge className={cn('text-xs', getSegmentColor(client.segment))}>
                    {client.segment}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {client.orders.length} orders
                  </span>
                  <span className="font-semibold text-emerald-600">
                    €{client.totalSpent.toFixed(0)}
                  </span>
                </div>
              </div>
            ))}

            {filteredClients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No clients found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Details */}
        <Card className="lg:col-span-2">
          {selectedClient ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(selectedClient.type)}
                      <CardTitle className="text-2xl">{selectedClient.name}</CardTitle>
                    </div>
                    {selectedClient.company && (
                      <CardDescription className="text-base">
                        {selectedClient.company}
                      </CardDescription>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Badge className={getSegmentColor(selectedClient.segment)}>
                        {selectedClient.segment}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {selectedClient.type}
                      </Badge>
                      {selectedClient.assignedTo && (
                        <Badge variant="secondary">
                          <UserCheck className="h-3 w-3 mr-1" />
                          {selectedClient.assignedTo}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(selectedClient)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="orders">
                      Orders ({selectedClient.orders.length})
                    </TabsTrigger>
                    <TabsTrigger value="interactions">
                      Interactions ({selectedClient.interactions.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    {/* Contact Info */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">
                        Contact Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedClient.email}</span>
                        </div>
                        {selectedClient.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedClient.phone}</span>
                          </div>
                        )}
                        {selectedClient.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <div>{selectedClient.address.street}</div>
                              <div>
                                {selectedClient.address.postalCode} {selectedClient.address.city}
                              </div>
                              <div>{selectedClient.address.country}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">
                        Financial Summary
                      </h3>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-xs font-semibold mb-1 uppercase text-muted-foreground">
                            Total Spent
                          </div>
                          <div className="text-2xl font-bold text-emerald-600">
                            €{selectedClient.totalSpent.toFixed(2)}
                          </div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-xs font-semibold mb-1 uppercase text-muted-foreground">
                            Avg Order Value
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            €{selectedClient.averageOrderValue.toFixed(2)}
                          </div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-xs font-semibold mb-1 uppercase text-muted-foreground">
                            Total Orders
                          </div>
                          <div className="text-2xl font-bold">
                            {selectedClient.orders.length}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Olfactive Preferences */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">
                        Olfactive Preferences
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium mb-2">Favorite Families</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedClient.preferences.favoriteFamily.map((family) => (
                              <Badge key={family} className="bg-pink-100 text-pink-700 border-pink-300">
                                <Heart className="h-3 w-3 mr-1" />
                                {family}
                              </Badge>
                            ))}
                            {selectedClient.preferences.favoriteFamily.length === 0 && (
                              <span className="text-sm text-muted-foreground">None specified</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-2">Disliked Families</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedClient.preferences.dislikedFamily.map((family) => (
                              <Badge key={family} variant="outline">
                                {family}
                              </Badge>
                            ))}
                            {selectedClient.preferences.dislikedFamily.length === 0 && (
                              <span className="text-sm text-muted-foreground">None specified</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-2">Preferred Intensity</div>
                          <Badge variant="secondary" className="capitalize">
                            {selectedClient.preferences.preferredIntensity}
                          </Badge>
                        </div>
                        {selectedClient.preferences.allergyRestrictions.length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-2">Allergy Restrictions</div>
                            <div className="flex flex-wrap gap-2">
                              {selectedClient.preferences.allergyRestrictions.map((allergen) => (
                                <Badge key={allergen} className="bg-red-100 text-red-700 border-red-300">
                                  {allergen}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium mb-2">Notes</div>
                          <p className="text-sm text-muted-foreground">
                            {selectedClient.preferences.notes}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {selectedClient.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedClient.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="orders" className="space-y-3">
                    {selectedClient.orders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No orders yet
                      </div>
                    ) : (
                      <>
                        {selectedClient.orders
                          .sort((a, b) => b.date.getTime() - a.date.getTime())
                          .map((order) => (
                            <div key={order.id} className="p-3 border rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{order.formulaName}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {order.date.toLocaleDateString()} • {order.quantity}ml
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-emerald-600">
                                    €{order.totalPrice.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    €{order.unitPrice.toFixed(2)}/ml
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant={order.status === 'completed' ? 'default' : 'secondary'}
                                  className="capitalize"
                                >
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="interactions" className="space-y-3">
                    {selectedClient.interactions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No interactions yet
                      </div>
                    ) : (
                      <>
                        {selectedClient.interactions
                          .sort((a, b) => b.date.getTime() - a.date.getTime())
                          .map((interaction) => (
                            <div key={interaction.id} className="p-3 border rounded-lg">
                              <div className="flex items-start gap-3 mb-2">
                                <div className="p-2 bg-muted rounded-full">
                                  {getInteractionIcon(interaction.type)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-sm">
                                      {interaction.subject}
                                    </h4>
                                    <span className="text-xs text-muted-foreground">
                                      {interaction.date.toLocaleDateString()}
                                    </span>
                                  </div>
                                  <Badge variant="outline" className="capitalize text-xs mb-2">
                                    {interaction.type.replace('-', ' ')}
                                  </Badge>
                                  <p className="text-sm text-muted-foreground">
                                    {interaction.description}
                                  </p>
                                  {interaction.outcome && (
                                    <p className="text-sm mt-2">
                                      <span className="font-medium">Outcome:</span>{' '}
                                      {interaction.outcome}
                                    </p>
                                  )}
                                  {interaction.nextFollowUp && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-orange-600">
                                      <Calendar className="h-3 w-3" />
                                      Follow up: {interaction.nextFollowUp.toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">No client selected</p>
                <p className="text-sm text-muted-foreground">
                  Select a client from the list to view details
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
