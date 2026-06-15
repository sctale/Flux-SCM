import React, { useState, useEffect } from 'react';
import { Card, message } from 'antd';
import OrderList from '@/components/order/OrderList';
import { orderApi, toCamelCase } from '@/services/api';
import type { PurchaseOrder } from '@/types/order';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.list();
      setOrders(res.data.map(toCamelCase));
    } catch (e: any) {
      message.error('获取订单数据失败: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <Card>
      <OrderList orders={orders} loading={loading} />
    </Card>
  );
};

export default Orders;
