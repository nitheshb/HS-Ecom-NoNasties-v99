/**
 * Dynamic status color utility
 * Provides consistent color assignment for any status name using hash-based color selection
 */

export interface ColorScheme {
  selected: string;
  unselected: string;
  badge: string;
}

/**
 * Generate a simple hash from a string for consistent color assignment
 */
const generateHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Predefined color schemes for status colors
 */
const COLOR_SCHEMES: ColorScheme[] = [
  {
    selected: 'bg-green-600 text-white border-green-600',
    unselected: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    badge: 'bg-green-100 text-green-800 hover:bg-green-100'
  },
  {
    selected: 'bg-blue-600 text-white border-blue-600',
    unselected: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    badge: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
  },
  {
    selected: 'bg-purple-600 text-white border-purple-600',
    unselected: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
    badge: 'bg-purple-100 text-purple-800 hover:bg-purple-100'
  },
  {
    selected: 'bg-orange-600 text-white border-orange-600',
    unselected: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
    badge: 'bg-orange-100 text-orange-800 hover:bg-orange-100'
  },
  {
    selected: 'bg-pink-600 text-white border-pink-600',
    unselected: 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
    badge: 'bg-pink-100 text-pink-800 hover:bg-pink-100'
  },
  {
    selected: 'bg-indigo-600 text-white border-indigo-600',
    unselected: 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100'
  },
  {
    selected: 'bg-teal-600 text-white border-teal-600',
    unselected: 'bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200',
    badge: 'bg-teal-100 text-teal-800 hover:bg-teal-100'
  },
  {
    selected: 'bg-yellow-600 text-white border-yellow-600',
    unselected: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
  },
  {
    selected: 'bg-red-600 text-white border-red-600',
    unselected: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
    badge: 'bg-red-100 text-red-800 hover:bg-red-100'
  },
  {
    selected: 'bg-cyan-600 text-white border-cyan-600',
    unselected: 'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200',
    badge: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100'
  }
];

/**
 * Get dynamic colors for a status based on its name
 * Prioritizes specific status colors, falls back to hash-based assignment
 * @param status - The status name
 * @returns ColorScheme object with selected, unselected, and badge colors
 */
export const getStatusColors = (status: string): ColorScheme => {
  const statusLower = status.toLowerCase();
  
  
  // Specific status color mappings - matching admin panel
  const specificStatusColors: Record<string, number> = {
    'cancelled': 8,        // Red (index 8)
    'order received': 1,   // Blue (index 1) - FORCED BLUE
    'orderreceived': 1,    // Blue (index 1) - FORCED BLUE
    'delivery': 2,         // Purple (index 2)
    'delivered': 2,        // Purple (index 2)
    'return': 4,           // Pink (index 4)
    'new': 1,              // Blue (index 1) - same as order received
    'completed': 0,        // Green (index 0)
    'fulfilled': 0,        // Green (index 0)
    'pending': 6,          // Yellow (index 6)
    'processing': 3,       // Orange (index 3)
    'shipped': 5,          // Indigo (index 5)
  };
  
  // Also handle common variations - normalize to standard form
  const statusVariations: Record<string, string> = {
    'order received': 'order received',
    'orderreceived': 'order received',
    'order-received': 'order received',
    'order_received': 'order received',
    'orderReceived': 'order received',
  };
  
  // Check for variations first
  const normalizedStatus = statusVariations[statusLower] || statusLower;
  
  // Check if it's a specific status first (check both normalized and original)
  if (specificStatusColors.hasOwnProperty(normalizedStatus)) {
    const colorIndex = specificStatusColors[normalizedStatus];
    return COLOR_SCHEMES[colorIndex];
  }
  
  // Also check original status (in case it's already in the mapping)
  if (specificStatusColors.hasOwnProperty(statusLower)) {
    const colorIndex = specificStatusColors[statusLower];
    return COLOR_SCHEMES[colorIndex];
  }
  
  // For other statuses, use hash-based assignment
  const hash = generateHash(status);
  const colorIndex = hash % COLOR_SCHEMES.length;
  return COLOR_SCHEMES[colorIndex];
};

/**
 * Get filter button classes for a status
 * @param status - The status name
 * @param selected - Whether the filter is selected
 * @returns CSS classes for the filter button
 */
export const getStatusFilterClasses = (status: string, selected: boolean): string => {
  const colors = getStatusColors(status);
  return selected ? colors.selected : colors.unselected;
};

/**
 * Get badge classes for a status
 * @param status - The status name
 * @returns CSS classes for the status badge
 */
export const getStatusBadgeClasses = (status: string): string => {
  const colors = getStatusColors(status);
  return colors.badge;
};

/**
 * Get default colors for null/undefined status
 * @param selected - Whether the filter is selected
 * @returns CSS classes for null status
 */
export const getDefaultStatusClasses = (selected: boolean): string => {
  if (selected) {
    return 'bg-blue-600 text-white border-blue-600';
  }
  return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
};

/**
 * Get default badge classes for null/undefined status
 * @returns CSS classes for null status badge
 */
export const getDefaultBadgeClasses = (): string => {
  return 'bg-gray-100 text-gray-600 hover:bg-gray-100';
};
