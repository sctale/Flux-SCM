import React, { useState } from 'react';
import { Table, Card, Select, Tag, Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { PurchaseOrder, OrderStatus } from '@/types/order';

interface OrderListProps {
  orders: PurchaseOrder[];
  loading?: boolean;
  onAdd?: () => void;
}

const statusMap: Record<OrderStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  submitted: { label: '已提交', color: 'processing' },
  confirmed: { label: '已确认', color: 'blue' },
  partial_delivered: { label: '部分交付', color: 'cyan' },
  delivered: { label: '已交付', color: 'success' },
  closed: { label: '已关闭', color: 'default' },
  cancelled: { label: '已取消', color: 'error' },
};

const OrderList: React.FC<OrderListProps> = ({ orders, loading, onAdd }) => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | undefined>();

  const filtered = filterStatus ? orders.filter((o) => o.status === filterStatus) : orders;

  const columns = [
    { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '订单金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 130, render: (v: number) => `¥${v.toLocaleString()}`, sorter: (a: PurchaseOrder, b: PurchaseOrder) => a.totalAmount - b.totalAmount },
    { title: '订单日期', dataIndex: 'orderDate', key: 'orderDate', width: 120 },
    { title: '期望交期', dataIndex: 'expectedDate', key: 'expectedDate', width: 120 },
    { title: '付款条件', dataIndex: 'paymentTerm', key: 'paymentTerm', width: 120 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (s: OrderStatus) => <Tag color={statusMap[s].color}>{statusMap[s].label}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
  ];

  return (
    <div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <Select placeholder="订单状态" allowClear style={{ width: 140 }} value={filterStatus} onChange={setFilterStatus}
            options={Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.label }))} />
          {onAdd && <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>新建订单</Button>}
        </Space>
      </Card>
      <Table rowKey="id" dataSource={filtered} columns={columns} size="small" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }} scroll={{ x: 1200 }} />
    </div>
  );
};

export default OrderList;
