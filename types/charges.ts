export interface ShippingRule {
  id: string;
  min_price: number;
  max_price: number | null;
  shipping_charge: number;
  is_free_shipping: boolean;
  location: string;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export interface SurgeRule {
  id: string;
  label: string;
  type: "flat" | "percentage";
  value: number;
  applies_to: "shipping" | "order_total";
  location: string;
  start_time: number;
  end_time: number;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export interface CreateShippingRuleData {
  min_price: number;
  max_price: number | null;
  shipping_charge: number;
  is_free_shipping: boolean;
  location: string;
  is_active: boolean;
}

export interface CreateSurgeRuleData {
  label: string;
  type: "flat" | "percentage";
  value: number;
  applies_to: "shipping" | "order_total";
  location: string;
  start_time: number;
  end_time: number;
  is_active: boolean;
}

export interface UpdateShippingRuleData extends Partial<CreateShippingRuleData> {}

export interface UpdateSurgeRuleData extends Partial<CreateSurgeRuleData> {}
