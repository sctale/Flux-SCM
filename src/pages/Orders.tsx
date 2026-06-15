import React from 'react';
import { Card } from 'antd';
import OrderList from '@/components/order/OrderList';
import type { PurchaseOrder } from '@/types/order';

const mockOrders: PurchaseOrder[] = [
  {
    id: '1', orderNo: 'PO-2025-001', supplierId: '1', title: '精密齿轮采购', status: 'confirmed',
    totalAmount: 156000, orderDate: '2025-06-01', expectedDate: '2025-06-20',
    paymentTerm: '月结30天', createdBy: '张伟', createdAt: '2025-06-01T08:00:00', updatedAt: '2025-06-02T10:00:00',
  },
  {
    id: '2', orderNo: 'PO-2025-002', supplierId: '2', title: '特种钢材采购', status: 'partial_delivered',
    totalAmount: 328000, orderDate: '2025-05-20', expectedDate: '2025-06-15',
    paymentTerm: '月结45天', createdBy: '李明', createdAt: '2025-05-20T09:00:00', updatedAt: '2025-06-10T14:00:00',
  },
  {
    id: '3', orderNo: 'PO-2025-003', supplierId: '3', title: '电子元器件采购', status: 'submitted',
    totalAmount: 89000, orderDate: '2025-06-10', expectedDate: '2025-07-05',
    paymentTerm: '货到付款', createdBy: '王芳', createdAt: '2025-06-10T11:00:00', updatedAt: '2025-06-10T11:00:00',
  },
  {
    id: '4', orderNo: 'PO-2025-004', supplierId: '4', title: '包装材料采购', status: 'delivered',
    totalAmount: 45000, orderDate: '2025-05-15', expectedDate: '2025-05-30',
    paymentTerm: '月结15天', createdBy: '赵刚', createdAt: '2025-05-15T10:00:00', updatedAt: '2025-05-30T16:00:00',
  },
  {
    id: '5', orderNo: 'PO-2025-005', supplierId: '5', title: '机加工外协订单', status: 'draft',
    totalAmount: 210000, orderDate: '2025-06-12', expectedDate: '2025-07-10',
    paymentTerm: '月结30天', createdBy: '陈磊', createdAt: '2025-06-12T08:30:00', updatedAt: '2025-06-12T08:30:00',
  },
  {
    id: '6', orderNo: 'PO-2025-006', supplierId: '6', title: '橡胶密封件采购', status: 'closed',
    totalAmount: 67000, orderDate: '2025-04-01', expectedDate: '2025-04-20',
    paymentTerm: '月结30天', createdBy: '刘洋', createdAt: '2025-04-01T09:00:00', updatedAt: '2025-05-10T10:00:00',
  },
  {
    id: '7', orderNo: 'PO-2025-007', supplierId: '7', title: '磁钢采购', status: 'cancelled',
    totalAmount: 95000, orderDate: '2025-05-10', expectedDate: '2025-06-10',
    paymentTerm: '预付30%', createdBy: '孙鹏', createdAt: '2025-05-10T14:00:00', updatedAt: '2025-05-25T09:00:00',
  },
];

const Orders: React.FC = () => (
  <Card>
    <OrderList orders={mockOrders} />
  </Card>
);

export default Orders;
