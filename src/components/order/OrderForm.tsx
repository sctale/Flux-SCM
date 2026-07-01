import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Row, Col, Table, Button, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { PurchaseOrder, OrderItem } from '@/types/order';

interface OrderFormItem {
  key: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
}

interface OrderFormProps {
  open: boolean;
  editingOrder?: PurchaseOrder | null;
  suppliers: any[];
  materials: any[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

// 生成订单编号 PO-YYYY-NNNN
const genOrderNo = () => {
  const now = new Date();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `PO-${now.getFullYear()}-${seq}`;
};

const OrderForm: React.FC<OrderFormProps> = ({ open, editingOrder, suppliers, materials, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState<OrderFormItem[]>([]);

  useEffect(() => {
    if (open && editingOrder) {
      form.setFieldsValue({
        orderNo: editingOrder.orderNo,
        supplierId: editingOrder.supplierId,
        title: editingOrder.title,
        orderDate: editingOrder.orderDate ? dayjs(editingOrder.orderDate) : undefined,
        expectedDate: editingOrder.expectedDate ? dayjs(editingOrder.expectedDate) : undefined,
        paymentTerm: editingOrder.paymentTerm,
        remark: editingOrder.remark,
      });
      // 加载已有明细（需要额外请求，这里简化为空，编辑时主要改主表信息）
      setItems([]);
    } else if (open) {
      form.setFieldsValue({ orderNo: genOrderNo() });
      setItems([]);
    }
  }, [open, editingOrder, form]);

  // 计算总金额
  const totalAmount = items.reduce((sum, it) => sum + (it.quantity || 0) * (it.unitPrice || 0), 0);

  const handleAddItem = () => {
    setItems([...items, { key: Date.now().toString(), materialId: '', materialName: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((it) => it.key !== key));
  };

  const handleItemChange = (key: string, field: string, value: any) => {
    setItems(items.map((it) => {
      if (it.key !== key) return it;
      const updated = { ...it, [field]: value };
      if (field === 'materialId') {
        const m = materials.find((m: any) => m.id === value);
        updated.materialName = m?.name || '';
      }
      return updated;
    }));
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // 校验明细
      if (items.length > 0) {
        for (const it of items) {
          if (!it.materialId) { message.error('请选择所有物料明细'); return; }
          if (it.quantity <= 0) { message.error('数量必须大于0'); return; }
        }
      }
      onSubmit({
        ...values,
        orderDate: values.orderDate ? values.orderDate.format('YYYY-MM-DD') : null,
        expectedDate: values.expectedDate ? values.expectedDate.format('YYYY-MM-DD') : null,
        totalAmount,
        items: items.map((it) => ({
          materialId: it.materialId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          amount: it.quantity * it.unitPrice,
        })),
      });
    } catch (e: any) {
      if (e.errorFields) return;
    }
  };

  const itemColumns = [
    {
      title: '物料', dataIndex: 'materialId', width: 200,
      render: (_: any, record: OrderFormItem) => (
        <Select
          size="small" showSearch optionFilterProp="label"
          placeholder="选择物料" style={{ width: '100%' }}
          value={record.materialId || undefined}
          onChange={(v) => handleItemChange(record.key, 'materialId', v)}
          options={materials.map((m: any) => ({ value: m.id, label: `${m.code} - ${m.name}` }))}
        />
      ),
    },
    {
      title: '数量', dataIndex: 'quantity', width: 100,
      render: (_: any, record: OrderFormItem) => (
        <InputNumber size="small" min={0.01} step={1} style={{ width: '100%' }}
          value={record.quantity} onChange={(v) => handleItemChange(record.key, 'quantity', v || 0)} />
      ),
    },
    {
      title: '单价', dataIndex: 'unitPrice', width: 110,
      render: (_: any, record: OrderFormItem) => (
        <InputNumber size="small" min={0} step={0.01} style={{ width: '100%' }}
          value={record.unitPrice} onChange={(v) => handleItemChange(record.key, 'unitPrice', v || 0)} />
      ),
    },
    {
      title: '金额', dataIndex: 'amount', width: 100,
      render: (_: any, record: OrderFormItem) => `¥${((record.quantity || 0) * (record.unitPrice || 0)).toLocaleString()}`,
    },
    {
      title: '', width: 50,
      render: (_: any, record: OrderFormItem) => (
        <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveItem(record.key)} />
      ),
    },
  ];

  return (
    <Modal
      title={editingOrder ? '编辑订单' : '新建订单'}
      open={open} onOk={handleOk} onCancel={onClose} width={720} destroyOnClose
      okText="保存" cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="orderNo" label="订单编号" rules={[{ required: true, message: '请输入订单编号' }]}>
              <Input placeholder="PO-2026-0001" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="supplierId" label="供应商" rules={[{ required: true, message: '请选择供应商' }]}>
              <Select showSearch optionFilterProp="label" placeholder="选择供应商"
                options={suppliers.map((s: any) => ({ value: s.id, label: s.name }))} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="title" label="订单标题">
              <Input placeholder="订单标题" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="orderDate" label="订单日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="expectedDate" label="期望交期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="paymentTerm" label="付款条件">
              <Select placeholder="选择付款条件" allowClear
                options={[
                  { value: '货到付款', label: '货到付款' },
                  { value: '月结15天', label: '月结15天' },
                  { value: '月结30天', label: '月结30天' },
                  { value: '月结45天', label: '月结45天' },
                  { value: '预付30%', label: '预付30%' },
                  { value: '预付全款', label: '预付全款' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="物料明细">
          <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={handleAddItem} style={{ marginBottom: 8 }}>添加物料</Button>
          <Table
            rowKey="key" dataSource={items} columns={itemColumns} size="small" pagination={false}
            locale={{ emptyText: '点击"添加物料"添加明细' }}
          />
          {items.length > 0 && (
            <div style={{ textAlign: 'right', marginTop: 8, fontSize: 14 }}>
              订单总额：<strong style={{ color: '#1677ff' }}>¥{totalAmount.toLocaleString()}</strong>
            </div>
          )}
        </Form.Item>

        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={2} placeholder="备注信息" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrderForm;
