export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'CREDIT';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  storeId: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryAddress: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  isPaid: boolean;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  storeId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  deliveryAddress: string;
  paymentMode: PaymentMode;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
