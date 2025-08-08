// API types
export interface Product {
  id: number;
  name: string;
  sku: string;
  unit_sale_price: number;
  unit_cost: number;
  description?: string;
}

export interface Tender {
  id: number;
  client: string;
  award_date: string;
  description?: string;
}

export interface Order {
  id: number;
  tender_id: number;
  product_id: number;
  awarded_quantity: number;
}

export interface OrderWithDetails extends Order {
  product: Product;
  margin: number;
}

export interface TenderWithDetails extends Tender {
  orders: OrderWithDetails[];
  total_margin: number;
}

export interface TenderSummary {
  id: number;
  client: string;
  award_date: string;
  description?: string;
  product_count: number;
  total_margin: number;
}

// Form types
export interface ProductForm {
  name: string;
  sku: string;
  unit_sale_price: number;
  unit_cost: number;
  description?: string;
}

export interface TenderForm {
  client: string;
  description?: string;
}

export interface OrderForm {
  tender_id: number;
  product_id: number;
  awarded_quantity: number;
}

export interface MultipleOrderItem {
  product_id: number;
  awarded_quantity: number;
}

export interface MultipleOrderForm {
  tender_id: number;
  orders: MultipleOrderItem[];
}
