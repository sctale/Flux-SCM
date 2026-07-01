import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, message, Spin } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import OrderList from '@/components/order/OrderList';
import OrderForm from '@/components/order/OrderForm';
import HelpPanel from '@/components/common/HelpPanel';
import type { PurchaseOrder, OrderStatus } from '@/types/order';

const API = '/api/orders';

// 后端蛇形命名 → 前端驼峰命名映射
const mapOrder = (o: any): any => ({
  id: o.id,
  orderNo: o.order_no,
  supplierId: o.supplier_id,
  supplierName: o.supplier_name,
  title: o.title,
  status: o.status,
  totalAmount: o.total_amount ?? 0,
  orderDate: o.order_date,
  expectedDate: o.expected_date,
  paymentTerm: o.payment_term,
  remark: o.remark,
  createdBy: o.created_by,
  createdAt: o.created_at,
  updatedAt: o.updated_at,
});

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [helpVisible, setHelpVisible] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const json = await res.json();
      setOrders((json.data || []).map(mapOrder));
    } catch (e) {
      message.error('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载供应商和物料选项（OrderForm 需要）
  const fetchOptions = async () => {
    try {
      const [sRes, mRes] = await Promise.all([fetch('/api/suppliers'), fetch('/api/materials')]);
      const sJson = await sRes.json();
      const mJson = await mRes.json();
      setSuppliers(sJson.data || []);
      setMaterials(mJson.data || []);
    } catch (e) {
      // 忽略选项加载失败
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchOptions();
  }, []);

  const handleAdd = () => {
    setEditingOrder(null);
    setFormOpen(true);
  };

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setFormOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingOrder) {
        const res = await fetch(`${API}/${editingOrder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || '更新失败');
        }
        message.success('订单已更新');
      } else {
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || '创建失败');
        }
        message.success('订单已创建');
      }
      setFormOpen(false);
      fetchOrders();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const handleDelete = (order: PurchaseOrder) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除订单「${order.orderNo}」吗？关联的明细和交付记录将一并清理。`,
      okText: '删除', okType: 'danger', cancelText: '取消',
      onOk: async () => {
        try {
          const res = await fetch(`${API}/${order.id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('删除失败');
          message.success('已删除');
          fetchOrders();
        } catch (e: any) {
          message.error(e.message || '删除失败');
        }
      },
    });
  };

  // 订单状态变更（状态机校验由后端负责）
  const handleStatusChange = (order: PurchaseOrder, status: OrderStatus) => {
    Modal.confirm({
      title: '确认操作',
      content: `确定将订单「${order.orderNo}」状态变更为「${status === 'cancelled' ? '已取消' : status === 'submitted' ? '已提交' : '已确认'}」吗？`,
      onOk: async () => {
        try {
          const res = await fetch(`${API}/${order.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || '状态变更失败');
          }
          message.success('状态已更新');
          fetchOrders();
        } catch (e: any) {
          message.error(e.message || '状态变更失败');
        }
      },
    });
  };

  return (
    <Spin spinning={loading} tip="数据加载中...">
      <>
        <Card title="订单管理" extra={<Button icon={<QuestionCircleOutlined />} onClick={() => setHelpVisible(true)}>帮助</Button>}>
          <OrderList
            orders={orders}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </Card>
        <OrderForm
          open={formOpen}
          editingOrder={editingOrder}
          suppliers={suppliers}
          materials={materials}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
        <HelpPanel
          visible={helpVisible}
          onClose={() => setHelpVisible(false)}
          title="订单管理帮助"
          sections={[
            { title: '订单流程', content: '订单管理支持完整的采购订单生命周期：\n\n1. 草稿 → 新建订单，填写基本信息\n2. 已提交 → 提交给供应商确认\n3. 已确认 → 供应商确认接单\n4. 部分交付 → 逐步收货\n5. 已交付 → 全部收货完成\n6. 已关闭 → 订单完结\n\n任何阶段均可取消订单' },
            { title: '订单创建', content: '点击"新建订单"按钮，选择供应商后添加物料明细。\n\n系统自动计算订单金额，支持设置付款条件和期望交付日期。' },
            { title: '状态机校验', content: '订单状态变更遵循白名单规则：\n\n- 草稿 → 已提交/已取消\n- 已提交 → 已确认/已取消\n- 已确认 → 部分交付/已交付/已取消\n- 部分交付 → 已交付/已取消\n- 已交付 → 已关闭\n\n非法状态变更会被后端拒绝。' },
          ]}
        />
      </>
    </Spin>
  );
};

export default Orders;
