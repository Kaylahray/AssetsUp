// Can be extended to support more currencies as needed
export type CurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | string;

/**
 * Options for currency formatting
 */
export interface FormatCurrencyOptions {
  /**
   * @default 'NGN'
   */
  currency?: CurrencyCode;
  
  /**
   * Locale for formatting
   * @default 'en-NG' for NGN, 'en-US' for USD, auto-detect for others
   */
  locale?: string;
  
  /**
   * Minimum number of decimal places
   * @default 2
   */
  minimumFractionDigits?: number;
  
  /**
   * Maximum number of decimal places
   * @default 2
   */
  maximumFractionDigits?: number;
}


function getLocaleForCurrency(currency: string): string {
  const localeMap: Record<string, string> = {
    NGN: 'en-NG',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    CAD: 'en-CA',
    AUD: 'en-AU',
  };
  
  return localeMap[currency] || 'en-US';
}

/**
 * Formats a number as a localized currency string
 * 
 * @param amount - The numeric amount to format
 * @param currencyOrOptions - Currency code string or options object
 * @returns Formatted currency string
 * 
 * @example
 * ```typescript
 * formatCurrency(5000) // "₦5,000.00"
 * formatCurrency(1200, "USD") // "$1,200.00"
 * formatCurrency(999.99, { currency: "EUR", locale: "fr-FR" }) // "999,99 €"
 * ```
 */
export function formatCurrency(
  amount: number,
  currencyOrOptions?: CurrencyCode | FormatCurrencyOptions
): string {
  
  if (typeof amount !== 'number' || !isFinite(amount)) {
    throw new TypeError('Amount must be a finite number');
  }

  let options: FormatCurrencyOptions;
  
  if (typeof currencyOrOptions === 'string') {
    options = { currency: currencyOrOptions };
  } else {
    options = currencyOrOptions || {};
  }

 
  const currency = options.currency || 'NGN';
  const locale = options.locale || getLocaleForCurrency(currency);
  const minimumFractionDigits = options.minimumFractionDigits ?? 2;
  const maximumFractionDigits = options.maximumFractionDigits ?? 2;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    });

    return formatter.format(amount);
  } catch (error) {
    // Fallback to USD if currency is not supported
    console.warn(`Currency "${currency}" not supported, falling back to USD`, error);
    
    const fallbackFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits,
      maximumFractionDigits,
    });

    return fallbackFormatter.format(amount);
  }
}