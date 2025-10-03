
export type DateFormat = 'short' | 'relative';

/**
 * Formats a date into a readable string
 * @param date - Date object, string, or timestamp
 * @param format - Format type: 'short' for DD/MM/YYYY, 'relative' for relative time
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, format: DateFormat): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }

  switch (format) {
    case 'short':
      return formatShortDate(dateObj);
    case 'relative':
      return formatRelativeDate(dateObj);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Formats date as DD/MM/YYYY using Intl.DateTimeFormat
 */
function formatShortDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  return formatter.format(date);
}

/**
 * Formats date as relative time using Intl.RelativeTimeFormat
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInSeconds = Math.round(diffInMs / 1000);
  
  // Handle same time
  if (Math.abs(diffInSeconds) < 1) {
    return 'now';
  }
  
  const formatter = new Intl.RelativeTimeFormat('en', {
    numeric: 'always' // Use "1 day ago" instead of "yesterday" for consistency
  });
  
  // Determine the appropriate unit and value
  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; value: number }> = [
    { unit: 'year', value: 365 * 24 * 60 * 60 },
    { unit: 'month', value: 30 * 24 * 60 * 60 },
    { unit: 'day', value: 24 * 60 * 60 },
    { unit: 'hour', value: 60 * 60 },
    { unit: 'minute', value: 60 },
    { unit: 'second', value: 1 }
  ];
  
  for (const { unit, value } of units) {
    const absDiff = Math.abs(diffInSeconds);
    if (absDiff >= value) {
      const relativeValue = Math.round(diffInSeconds / value);
      return formatter.format(relativeValue, unit);
    }
  }
  
  // Fallback for very small differences
  return formatter.format(diffInSeconds, 'second');
}
