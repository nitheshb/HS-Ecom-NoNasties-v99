// Utility functions dealing with time / calendar calculations that are not covered by date-fns
// We intentionally keep it framework-agnostic so it can be used on both web and server environments.

export interface WeekMonthInfo {
  weekNumberOfYear: number;
  weekNumberOfMonth: number;
  day: number;
  month: number; // 1-based (January = 1)
  year: number;
}

/**
 * Given a JavaScript milliseconds timestamp, returns calendar breakdown used for analytics.
 * The logic replicates the user-provided function but typed and exported.
 */
export function getWeekMonthNo(milliseconds: number): WeekMonthInfo {
  const date = new Date(milliseconds);
  const currentMonth = date.getMonth();

  // Get day month and year
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-based so add 1
  const year = date.getFullYear();

  // Week number within month (1-5)
  const weekNumberOfMonth = Math.ceil((date.getDate() + date.getDay()) / 7);

  // Adjust the date to Monday (ISO week standard)
  const dayOfWeek = date.getDay();
  date.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

  // ISO week number of year
  const firstThursday = new Date(year, 0, 4 - ((date.getDay() + 6) % 7));
  const weekNumberOfYear = Math.floor(
    (date.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000) + 1
  );

  return {
    weekNumberOfYear,
    weekNumberOfMonth,
    day,
    month,
    year,
  };
}

/**
 * Format timestamp in milliseconds to a readable date string
 * @param timestamp - Timestamp in milliseconds
 * @returns Formatted date string
 */
export const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
};

/**
 * Format timestamp in milliseconds to a relative time string
 * @param timestamp - Timestamp in milliseconds
 * @returns Relative time string (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp: number): string => {
  if (!timestamp) return 'N/A';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

/**
 * Converts current time or given date to IST (UTC+5:30) ISO string without the 'Z' suffix
 * @param date - Optional Date object (defaults to current time)
 * @returns ISO string in IST timezone without 'Z' suffix (e.g., "2025-11-04T13:24:05.260")
 */
export const getISTISOString = (date?: Date): string => {
  const d = date || new Date();
  
  // Use Intl.DateTimeFormat to get IST time components
  const istFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Use 24-hour format
  });
  
  // Format the date in IST
  const parts = istFormatter.formatToParts(d);
  
  // Extract parts
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  const hours = parts.find(p => p.type === 'hour')?.value || '';
  const minutes = parts.find(p => p.type === 'minute')?.value || '';
  const seconds = parts.find(p => p.type === 'second')?.value || '';
  
  // Get milliseconds from the original date (they're the same regardless of timezone)
  const milliseconds = String(d.getMilliseconds()).padStart(3, '0');
  
  const result = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  
  // Debug log to verify IST conversion (remove in production if needed)
  if (process.env.NODE_ENV === 'development') {
    console.log('[getISTISOString] UTC:', d.toISOString(), '→ IST:', result);
  }
  
  return result;
};