'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronLeft,
  Settings as SettingsIcon,
  Globe,
  DollarSign,
  Check,
  TrendingUp,
} from 'lucide-react';
import {
  SUPPORTED_CURRENCIES,
  CURRENCY_REGIONS,
  getCurrenciesByRegion,
  getPreferredCurrency,
  setPreferredCurrency,
  getExchangeRateTimestamp,
  formatCurrency,
  convertCurrency,
  type Currency,
} from '@/lib/currency';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();

  const [selectedCurrency, setSelectedCurrency] = useState<string>('EUR');
  const [hasChanges, setHasChanges] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load saved preferences on mount
  useEffect(() => {
    const saved = getPreferredCurrency();
    setSelectedCurrency(saved);
    setLastUpdated(getExchangeRateTimestamp());
  }, []);

  // Handle currency selection
  const handleCurrencySelect = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    setHasChanges(currencyCode !== getPreferredCurrency());
  };

  // Save settings
  const handleSave = () => {
    setPreferredCurrency(selectedCurrency);
    setHasChanges(false);

    // Reload page to apply changes
    window.location.reload();
  };

  // Reset to default
  const handleReset = () => {
    setSelectedCurrency('EUR');
    setHasChanges('EUR' !== getPreferredCurrency());
  };

  // Get selected currency object
  const selectedCurrencyObj = SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrency);

  // Example prices for preview
  const examplePrices = [1.5, 25.0, 150.0];

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
              <SettingsIcon className="h-8 w-8 text-slate-600" />
              Settings
            </h2>
            <p className="text-muted-foreground">
              Configure your preferences and regional settings
            </p>
          </div>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Panel */}
        <Card className="lg:col-span-2">
          <Tabs defaultValue="currency">
            <CardHeader>
              <TabsList>
                <TabsTrigger value="currency">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Currency
                </TabsTrigger>
                <TabsTrigger value="regional">
                  <Globe className="mr-2 h-4 w-4" />
                  Regional
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="currency" className="space-y-6">
                {/* Currency Selection by Region */}
                {(Object.keys(CURRENCY_REGIONS) as Array<keyof typeof CURRENCY_REGIONS>).map(
                  (region) => {
                    const currencies = getCurrenciesByRegion(region);
                    return (
                      <div key={region}>
                        <h3 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">
                          {region}
                        </h3>
                        <div className="grid gap-3 md:grid-cols-2">
                          {currencies.map((currency) => (
                            <div
                              key={currency.code}
                              className={cn(
                                'p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50',
                                selectedCurrency === currency.code
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border'
                              )}
                              onClick={() => handleCurrencySelect(currency.code)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-bold">
                                    {currency.symbol}
                                  </span>
                                  <div>
                                    <div className="font-semibold">{currency.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {currency.code}
                                    </div>
                                  </div>
                                </div>
                                {selectedCurrency === currency.code && (
                                  <Check className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Rate: 1 EUR = {currency.exchangeRate.toFixed(4)}{' '}
                                {currency.code}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}

                {/* Exchange Rate Info */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">Exchange Rates</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {lastUpdated.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Base currency: EUR (Euro). All prices are stored in EUR and converted to
                    your selected currency using current exchange rates.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="regional" className="space-y-6">
                {/* Language Selection */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">
                    Language
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Language selection will be available in a future update. Currently
                    supporting English.
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>

                {/* Date Format */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">
                    Date Format
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Date format is automatically determined by your selected currency's
                    locale.
                  </p>
                  {selectedCurrencyObj && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm">
                        Current format:{' '}
                        <span className="font-semibold">
                          {new Date().toLocaleDateString(selectedCurrencyObj.locale)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Number Format */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">
                    Number Format
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Number formatting follows your selected currency's regional conventions.
                  </p>
                  {selectedCurrencyObj && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm">
                        Example:{' '}
                        <span className="font-semibold">
                          {(1234.56).toLocaleString(selectedCurrencyObj.locale)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Preview Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How prices will appear</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCurrencyObj && (
              <>
                {/* Selected Currency Info */}
                <div className="p-4 bg-primary/5 border-2 border-primary rounded-lg">
                  <div className="text-center mb-3">
                    <div className="text-4xl font-bold mb-2">
                      {selectedCurrencyObj.symbol}
                    </div>
                    <div className="font-semibold">{selectedCurrencyObj.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedCurrencyObj.code}
                    </div>
                  </div>
                </div>

                {/* Price Examples */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Price Examples</h4>
                  {examplePrices.map((priceInEur) => (
                    <div
                      key={priceInEur}
                      className="p-3 border rounded-lg flex items-center justify-between"
                    >
                      <div className="text-sm text-muted-foreground">
                        €{priceInEur.toFixed(2)}/g
                      </div>
                      <div className="font-semibold">
                        {formatCurrency(
                          convertCurrency(priceInEur, selectedCurrency),
                          selectedCurrency
                        )}
                        /g
                      </div>
                    </div>
                  ))}
                </div>

                {/* Batch Examples */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Batch Examples (100ml)</h4>
                  {examplePrices.map((pricePerGram) => {
                    const batchPrice = pricePerGram * 90; // 100ml * 0.9 density
                    return (
                      <div
                        key={`batch-${pricePerGram}`}
                        className="p-3 border rounded-lg flex items-center justify-between"
                      >
                        <div className="text-sm text-muted-foreground">100ml batch</div>
                        <div className="font-semibold">
                          {formatCurrency(
                            convertCurrency(batchPrice, selectedCurrency),
                            selectedCurrency
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Exchange Rate Reference */}
                <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                  <div>1 EUR = {selectedCurrencyObj.exchangeRate.toFixed(4)} {selectedCurrency}</div>
                  <div>1 {selectedCurrency} = {(1 / selectedCurrencyObj.exchangeRate).toFixed(4)} EUR</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Banner */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-primary text-primary-foreground shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <div className="font-semibold">You have unsaved changes</div>
              <div className="text-sm opacity-90">
                Currency will change to {selectedCurrency}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleReset}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleSave}>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
