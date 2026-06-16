import React, { useState } from 'react';
import { Card, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import OrderList from '@/components/order/OrderList';
import HelpPanel from '@/components/common/HelpPanel';
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

const Orders: React.FC = () => {
  const [helpVisible, setHelpVisible] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Card title="订单管理" extra={<Button icon={<QuestionCircleOutlined />} onClick={() => setHelpVisible(!helpVisible)} type={helpVisible ? 'primary' : 'default'}>帮助</Button>}>
          <OrderList orders={mockOrders} />
        </Card>
      </div>
      <HelpPanel
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
        onOpen={() => setHelpVisible(true)}
        title="订单管理帮助"
        sections={[
          { title: '订单流程', content: '订单管理支持完整的采购订单生命周期：\n\n1. 草稿 → 新建订单，填写基本信息\n2. 已提交 → 提交给供应商确认\n3. 已确认 → 供应商确认接单\n4. 部分交付 → 逐步收货\n5. 已交付 → 全部收货完成\n6. 已关闭 → 订单完结\n\n任何阶段均可取消订单' },
          { title: '订单创建', content: '点击"新建订单"按钮，选择供应商后添加物料明细。\n\n系统自动计算订单金额，支持设置付款条件和期望交付日期。' },
          { title: '交付跟踪', content: '在订单详情中可录入交付记录，包括交付数量、合格数量和检验结果。\n\n系统自动更新已交付数量，便于跟踪交付进度。' },
        ]}
      />
    </div>
  );
};

export default Orders;
