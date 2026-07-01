import React, { useEffect, useState } from 'react';
import { Card, Tabs, Modal, message, Spin } from 'antd';
import SupplierList from '@/components/supplier/SupplierList';
import SupplierForm from '@/components/supplier/SupplierForm';
import KraljicView from '@/components/supplier/KraljicView';
import type { Supplier, SupplierFormData } from '@/types/supplier';

const API = '/api/suppliers';

const mapSupplier = (s: any): Supplier => ({
  id: s.id,
  name: s.name,
  shortName: s.short_name,
  unifiedCode: s.unified_code,
  category: s.category,
  kraljicQuadrant: s.kraljic_quadrant,
  profitImpactScore: s.profit_impact_score ?? 0,
  supplyRiskScore: s.supply_risk_score ?? 0,
  performanceGrade: s.performance_grade,
  overallScore: s.overall_score ?? 0,
  qualityScore: s.quality_score ?? 0,
  costScore: s.cost_score ?? 0,
  deliveryScore: s.delivery_score ?? 0,
  serviceScore: s.service_score ?? 0,
  status: s.status,
  address: s.address,
  contactPerson: s.contact_person,
  contactPhone: s.contact_phone,
  contactEmail: s.contact_email,
  bankName: s.bank_name,
  bankAccount: s.bank_account,
  remark: s.remark,
  createdAt: s.created_at,
  updatedAt: s.updated_at,
});

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const json = await res.json();
      setSuppliers((json.data || []).map(mapSupplier));
    } catch (e) {
      message.error('加载供应商失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAdd = () => {
    setEditingSupplier(null);
    setFormOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormOpen(true);
  };

  const handleSubmit = async (data: SupplierFormData) => {
    try {
      if (editingSupplier) {
        const res = await fetch(`${API}/${editingSupplier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('更新失败');
        message.success('供应商信息已更新');
      } else {
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('创建失败');
        message.success('供应商已添加');
      }
      setFormOpen(false);
      fetchSuppliers();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const handleDelete = (supplier: Supplier) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除供应商「${supplier.name}」吗？关联数据将一并清理。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await fetch(`${API}/${supplier.id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('删除失败');
          message.success('已删除');
          fetchSuppliers();
        } catch (e: any) {
          message.error(e.message || '删除失败');
        }
      },
    });
  };

  return (
    <Spin spinning={loading} tip="数据加载中...">
      <Card>
        <Tabs
          defaultActiveKey="list"
          items={[
            {
              key: 'list',
              label: '供应商列表',
              children: (
                <SupplierList
                  suppliers={suppliers}
                  onAdd={handleAdd}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ),
            },
            {
              key: 'matrix',
              label: '卡拉杰克矩阵',
              children: <KraljicView suppliers={suppliers} />,
            },
          ]}
        />
        <SupplierForm
          open={formOpen}
          editingSupplier={editingSupplier}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      </Card>
    </Spin>
  );
};

export default Suppliers;
