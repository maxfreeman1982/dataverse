/**
 * Multi-Currency Support System
 * Exchange rates, currency conversion, and formatting
 */

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  exchangeRate: number; // Relative to EUR (base currency)
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'fr-FR',
    exchangeRate: 1.0,
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    exchangeRate: 1.09,
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    exchangeRate: 0.86,
  },
  {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    locale: 'de-CH',
    exchangeRate: 0.96,
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    locale: 'ja-JP',
    exchangeRate: 161.5,
  },
  {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    locale: 'zh-CN',
    exchangeRate: 7.85,
  },
  {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham',
    locale: 'ar-AE',
    exchangeRate: 4.01,
  },
  {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    exchangeRate: 1.49,
  },
  {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    locale: 'en-AU',
    exchangeRate: 1.68,
  },
  {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    locale: 'en-SG',
    exchangeRate: 1.45,
  },
];

/**
 * Convert price from EUR to target currency
 */
export function convertCurrency(
  amountInEur: number,
  targetCurrencyCode: string
): number {
  const targetCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === targetCurrencyCode);

  if (!targetCurrency) {
    console.warn(`Currency ${targetCurrencyCode} not found, returning EUR amount`);
    return amountInEur;
  }

  return amountInEur * targetCurrency.exchangeRate;
}

/**
 * Convert price from source currency to target currency
 */
export function convertBetweenCurrencies(
  amount: number,
  sourceCurrencyCode: string,
  targetCurrencyCode: string
): number {
  const sourceCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === sourceCurrencyCode);
  const targetCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === targetCurrencyCode);

  if (!sourceCurrency || !targetCurrency) {
    console.warn('Currency conversion failed, returning original amount');
    return amount;
  }

  // Convert to EUR first, then to target
  const amountInEur = amount / sourceCurrency.exchangeRate;
  return amountInEur * targetCurrency.exchangeRate;
}

/**
 * Format price with currency symbol
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options: {
    decimals?: number;
    showCode?: boolean;
  } = {}
): string {
  const {
    decimals = 2,
    showCode = false,
  } = options;

  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);

  if (!currency) {
    return `${amount.toFixed(decimals)}`;
  }

  const formatted = new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  if (showCode && !formatted.includes(currency.code)) {
    return `${formatted} ${currency.code}`;
  }

  return formatted;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}

/**
 * Get currency by code
 */
export function getCurrency(currencyCode: string): Currency | undefined {
  return SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
}

/**
 * Get user's preferred currency from localStorage
 */
export function getPreferredCurrency(): string {
  if (typeof window === 'undefined') return 'EUR';

  const stored = localStorage.getItem('preferred-currency');
  if (stored && SUPPORTED_CURRENCIES.some((c) => c.code === stored)) {
    return stored;
  }

  return 'EUR';
}

/**
 * Set user's preferred currency in localStorage
 */
export function setPreferredCurrency(currencyCode: string): void {
  if (typeof window === 'undefined') return;

  if (SUPPORTED_CURRENCIES.some((c) => c.code === currencyCode)) {
    localStorage.setItem('preferred-currency', currencyCode);
  }
}

/**
 * Price with multi-currency support
 */
export interface MultiCurrencyPrice {
  baseAmount: number; // Amount in EUR
  baseCurrency: 'EUR';
  displayAmount: number; // Amount in user's currency
  displayCurrency: string;
  formatted: string;
}

/**
 * Create multi-currency price object
 */
export function createMultiCurrencyPrice(
  amountInEur: number,
  userCurrency?: string
): MultiCurrencyPrice {
  const displayCurrency = userCurrency || getPreferredCurrency();
  const displayAmount = convertCurrency(amountInEur, displayCurrency);
  const formatted = formatCurrency(displayAmount, displayCurrency);

  return {
    baseAmount: amountInEur,
    baseCurrency: 'EUR',
    displayAmount,
    displayCurrency,
    formatted,
  };
}

/**
 * Bulk convert prices to user's currency
 */
export function convertPrices<T extends { pricePerGram: number }>(
  items: T[],
  userCurrency?: string
): (T & { convertedPrice: number; formattedPrice: string })[] {
  const currency = userCurrency || getPreferredCurrency();

  return items.map((item) => ({
    ...item,
    convertedPrice: convertCurrency(item.pricePerGram, currency),
    formattedPrice: formatCurrency(
      convertCurrency(item.pricePerGram, currency),
      currency
    ),
  }));
}

/**
 * Exchange rate update timestamp
 * Note: In production, this would be fetched from an external API
 */
export function getExchangeRateTimestamp(): Date {
  // Simulated: rates updated daily at midnight UTC
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): number {
  const from = SUPPORTED_CURRENCIES.find((c) => c.code === fromCurrency);
  const to = SUPPORTED_CURRENCIES.find((c) => c.code === toCurrency);

  if (!from || !to) {
    return 1;
  }

  // Convert through EUR
  return to.exchangeRate / from.exchangeRate;
}

/**
 * Currency regions for grouping
 */
export const CURRENCY_REGIONS = {
  Europe: ['EUR', 'GBP', 'CHF'],
  Americas: ['USD', 'CAD'],
  Asia: ['JPY', 'CNY', 'SGD'],
  'Middle East': ['AED'],
  Oceania: ['AUD'],
} as const;

/**
 * Get currencies by region
 */
export function getCurrenciesByRegion(
  region: keyof typeof CURRENCY_REGIONS
): Currency[] {
  const codes = CURRENCY_REGIONS[region];
  return SUPPORTED_CURRENCIES.filter((c) => codes.includes(c.code as any));
}

/**
 * Format price range with currency
 */
export function formatPriceRange(
  min: number,
  max: number,
  currencyCode: string
): string {
  const minFormatted = formatCurrency(min, currencyCode, { decimals: 0 });
  const maxFormatted = formatCurrency(max, currencyCode, { decimals: 0 });
  return `${minFormatted} - ${maxFormatted}`;
}
