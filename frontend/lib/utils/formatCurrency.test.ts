import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  describe('Basic formatting', () => {
    it('should format NGN by default', () => {
      expect(formatCurrency(5000)).toBe('₦5,000.00');
    });

    it('should format USD when specified', () => {
      expect(formatCurrency(1200, 'USD')).toBe('$1,200.00');
    });


    it('should format GBP when specified', () => {
      expect(formatCurrency(500, 'GBP')).toBe('£500.00');
    });



  });

  describe('Decimal places', () => {
    it('should handle decimal amounts correctly', () => {
      expect(formatCurrency(1234.56, 'NGN')).toBe('₦1,234.56');
    });

    it('should round to 2 decimal places by default', () => {
      expect(formatCurrency(99.999, 'USD')).toBe('$100.00');
    });

    it('should respect custom minimumFractionDigits', () => {
      const result = formatCurrency(100, {
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      expect(result).toBe('$100');
    });

    it('should respect custom maximumFractionDigits', () => {
      const result = formatCurrency(123.456789, {
        currency: 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      });
      expect(result).toBe('$123.4568');
    });
  });


});