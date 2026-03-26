export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'CREDIT';

export interface BillItem {
  id: string;
  billId: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  gstRate: number;
  gstAmount: number;
  totalPrice: number;
}

export interface Bill {
  id: string;
  storeId: string;
  billNumber: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  gstTotal: number;
  discount: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  isPaid: boolean;
  pdfUrl?: string;
  items: BillItem[];
  createdAt: string;
}

export interface CreateBillRequest {
  storeId: string;
  customerName?: string;
  customerPhone?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  discount?: number;
  paymentMode: PaymentMode;
}

export interface GSTBreakdown {
  rate: number;
  taxable: number;
  gst: number;
}
