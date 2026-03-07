// Tipos TypeScript para el e-commerce de SACRÉ

// Simple product type for frontend
export interface Product {
  id: string | number;
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  compare_at_price?: number | null;
  category?: string | null;
  subcategory?: string | null;
  origin?: string | null;
  weight?: string | null;
  stock?: number;
  sku?: string | null;
  images?: string[] | null;
  is_active?: boolean;
  is_featured?: boolean;
  tags?: string[] | null;
  created_at?: string;
  updated_at?: string;
  image?: string; // Legacy field for backwards compatibility
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni?: string;
}

export interface ShippingInfo {
  method: 'delivery' | 'pickup';
  // Delivery fields
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  instructions?: string;
}

export type PaymentMethod = 'mercadopago' | 'transfer' | 'card_debit' | 'card_credit';

export type OrderStatus = 
  | 'pending' 
  | 'payment_pending' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  status: OrderStatus;
  
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  
  shipping_method: 'delivery' | 'pickup';
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_instructions: string | null;
  
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_id: string | null;
  payment_external_reference: string | null;
  
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  
  internal_notes: string | null;
  admin_notes: string | null;
  
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface CheckoutData {
  customer: CustomerInfo;
  shipping: ShippingInfo;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}

// Helper functions
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(price);
}

export function generateOrderId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `SACRE-${year}-${random}`;
}
