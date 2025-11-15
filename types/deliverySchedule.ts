export interface DeliverySchedule {
  id: string;
  category_id: string;      // Category ID instead of name
  category?: string;         // Optional: Category name for display (computed field)
  product_ids?: string[];   // Array of selected product IDs (optional)
  order_day: number;        // 0=Sunday … 6=Saturday, -1=any
  order_start: string;      // "HH:MM"
  order_end: string;        // "HH:MM"
  delivery_day_offset: number;
  delivery_time_start: string;    // "HH:MM" (From)
  delivery_time_end?: string; // "HH:MM" (To, optional)
  createdAt?: number;       // Timestamp in milliseconds
  updatedAt?: number;       // Timestamp in milliseconds
}

export interface DeliveryScheduleFormData {
  category_id: string;      // Category ID instead of name
  product_ids: string[];    // Array of selected product IDs
  order_day: number;
  order_start: string;
  order_end: string;
  delivery_day_offset: number;
  delivery_time_start: string;
  delivery_time_end?: string;
}

export const WEEKDAYS = [
  { value: -1, label: "Any Day" },
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" }
];

// We'll fetch categories dynamically from the database
export interface Category {
  id: string;
  title: string;
  active: boolean;
  status: string;
  img?: string;
  translation?: {
    locale: string;
    title: string;
    description: string;
  };
  translations?: Array<{
    locale: string;
    title: string;
    description: string;
  }>;
}

// Product interface for displaying products within categories
export interface Product {
  id: string;
  title: Record<string, string>;
  category_id: string | null;
  category?: any; // Some products might have full category object
  active: number;
  status: string;
  img?: string;
  price?: number;
  translation?: {
    locale: string;
    title: string;
    description: string;
  };
  translations?: Array<{
    locale: string;
    title: string;
    description: string;
  }>;
}
