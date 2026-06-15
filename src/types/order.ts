export type OrderStatus = 'draft' | 'submitted' | 'confirmed' | 'partial_delivered' | 'delivered' | 'closed' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplierId: string;
  title?: string;
  status: OrderStatus;
  totalAmount: number;
  orderDate?: string;
  expectedDate?: string;
  paymentTerm?: string;
  remark?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  materialId: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  deliveredQty: number;
  qualifiedQty: number;
  expectedDate?: string;
  remark?: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  orderItemId: string;
  deliveryDate: string;
  quantity: number;
  qualifiedQty: number;
  inspectionResult?: 'qualified' | 'unqualified' | 'pending';
  inspectionRemark?: string;
  createdAt: string;
}
