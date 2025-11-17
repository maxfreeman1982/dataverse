'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { GET_ALL_INGREDIENTS, type Ingredient } from '@/graphql/perfume';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Package, AlertTriangle, TrendingDown, DollarSign, Search, RefreshCw } from 'lucide-react';
import {
  generateMockInventory,
  getStockAlerts,
  getStockPercentage,
  getStockStatus,
  getInventoryStats,
  type InventoryItem
} from '@/lib/inventory';
import { cn } from '@/lib/utils';

export default function InventoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: ingredientsData } = useQuery<{ getAllIngredients: Ingredient[] }>(GET_ALL_INGREDIENTS);
  const ingredients = ingredientsData?.getAllIngredients || [];

  // Generate mock inventory
  const inventory = useMemo(() => generateMockInventory(ingredients), [ingredients]);
  const alerts = useMemo(() => getStockAlerts(inventory), [inventory]);
  const stats = useMemo(() => getInventoryStats(inventory), [inventory]);

  // Filter inventory
  const filteredInventory = inventory.filter((item) =>
    item.ingredientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Package className="h-8 w-8 text-blue-600" />
              Inventory Management
            </h2>
            <p className="text-muted-foreground">Track stock levels and reorder alerts</p>
          </div>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync Stock
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Ingredients tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">€{stats.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Items need reorder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">Immediate action required</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Items ({inventory.length})</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="suppliers">By Supplier</TabsTrigger>
        </TabsList>

        {/* ALL ITEMS TAB */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Overview</CardTitle>
              <CardDescription>All ingredients with current stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by ingredient or supplier..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 pb-2 border-b font-semibold text-sm">
                  <div className="col-span-3">Ingredient</div>
                  <div className="col-span-2">Stock</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Supplier</div>
                  <div className="col-span-2 text-right">Value</div>
                  <div className="col-span-1 text-center">Actions</div>
                </div>

                {/* Table Rows */}
                <div className="max-h-[500px] overflow-y-auto space-y-1">
                  {filteredInventory.map((item) => {
                    const status = getStockStatus(item);
                    const percentage = getStockPercentage(item);

                    return (
                      <div key={item.ingredientId} className="grid grid-cols-12 gap-4 py-3 hover:bg-accent rounded px-2">
                        <div className="col-span-3 font-medium">{item.ingredientName}</div>

                        <div className="col-span-2">
                          <div className="text-sm font-semibold">{item.currentStock}g</div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-1">
                            <div
                              className={cn(
                                "h-full transition-all",
                                status.status === 'good' && 'bg-green-500',
                                status.status === 'low' && 'bg-yellow-500',
                                status.status === 'critical' && 'bg-orange-500',
                                status.status === 'out' && 'bg-red-500'
                              )}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="col-span-2">
                          <Badge
                            variant={status.status === 'good' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {status.label}
                          </Badge>
                        </div>

                        <div className="col-span-2 text-sm text-muted-foreground">
                          {item.supplier}
                        </div>

                        <div className="col-span-2 text-right font-semibold text-emerald-600">
                          €{(item.currentStock * item.costPerGram).toFixed(2)}
                        </div>

                        <div className="col-span-1 text-center">
                          <Button variant="ghost" size="sm" className="h-8">
                            Restock
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ALERTS TAB */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>Items requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-600 mb-2">All Stock Levels Good!</h3>
                  <p className="text-muted-foreground">No reorder alerts at this time</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.ingredientId}
                      className={cn(
                        'p-4 rounded-lg border-2',
                        alert.severity === 'out' && 'bg-red-50 border-red-300',
                        alert.severity === 'critical' && 'bg-orange-50 border-orange-300',
                        alert.severity === 'low' && 'bg-yellow-50 border-yellow-300'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle
                              className={cn(
                                'h-5 w-5',
                                alert.severity === 'out' && 'text-red-600',
                                alert.severity === 'critical' && 'text-orange-600',
                                alert.severity === 'low' && 'text-yellow-600'
                              )}
                            />
                            <h4 className="font-semibold">{alert.ingredientName}</h4>
                            <Badge
                              variant="destructive"
                              className={cn(
                                alert.severity === 'low' && 'bg-yellow-600',
                                alert.severity === 'critical' && 'bg-orange-600'
                              )}
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                        <Button variant="default" size="sm">
                          Order Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUPPLIERS TAB */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory by Supplier</CardTitle>
              <CardDescription>Stock grouped by supplier</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const bySupplier = new Map<string, InventoryItem[]>();
                inventory.forEach((item) => {
                  const items = bySupplier.get(item.supplier) || [];
                  items.push(item);
                  bySupplier.set(item.supplier, items);
                });

                return (
                  <div className="space-y-4">
                    {Array.from(bySupplier.entries()).map(([supplier, items]) => {
                      const totalValue = items.reduce((sum, item) =>
                        sum + (item.currentStock * item.costPerGram), 0
                      );
                      const lowStockItems = items.filter(item =>
                        item.currentStock < item.minimumStock
                      ).length;

                      return (
                        <div key={supplier} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{supplier}</h4>
                              <p className="text-sm text-muted-foreground">
                                {items.length} ingredients • €{totalValue.toFixed(2)} value
                              </p>
                            </div>
                            {lowStockItems > 0 && (
                              <Badge variant="destructive">
                                {lowStockItems} low stock
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {items.slice(0, 6).map((item) => {
                              const status = getStockStatus(item);
                              return (
                                <div key={item.ingredientId} className="text-xs p-2 bg-muted rounded">
                                  <div className="font-medium truncate">{item.ingredientName}</div>
                                  <div className={cn("text-xs", status.color)}>
                                    {item.currentStock}g
                                  </div>
                                </div>
                              );
                            })}
                            {items.length > 6 && (
                              <div className="text-xs p-2 bg-muted rounded flex items-center justify-center text-muted-foreground">
                                +{items.length - 6} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
