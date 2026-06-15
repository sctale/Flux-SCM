import React, { useState } from 'react';
import { Card, Tabs, message } from 'antd';
import SupplierList from '@/components/supplier/SupplierList';
import SupplierForm from '@/components/supplier/SupplierForm';
import KraljicView from '@/components/supplier/KraljicView';
import type { Supplier, SupplierFormData } from '@/types/supplier';

const mockSuppliers: Supplier[] = [
  {
    id: '1', name: '华信精密科技有限公司', shortName: '华信精密', category: '零部件',
    kraljicQuadrant: 'strategic', profitImpactScore: 78, supplyRiskScore: 72,
    performanceGrade: 'A', overallScore: 92, qualityScore: 95, costScore: 88, deliveryScore: 93, serviceScore: 90,
    status: 'active', contactPerson: '张伟', contactPhone: '13800138001', contactEmail: 'zhangwei@huaxin.com',
    bankName: '中国工商银行', bankAccount: '6222000000001',
    createdAt: '2024-01-15', updatedAt: '2025-06-01',
  },
  {
    id: '2', name: '东方钢铁集团', shortName: '东方钢铁', category: '原材料',
    kraljicQuadrant: 'leverage', profitImpactScore: 65, supplyRiskScore: 35,
    performanceGrade: 'B', overallScore: 82, qualityScore: 85, costScore: 80, deliveryScore: 82, serviceScore: 78,
    status: 'active', contactPerson: '李明', contactPhone: '13800138002', contactEmail: 'liming@dongfang.com',
    bankName: '中国建设银行', bankAccount: '6227000000001',
    createdAt: '2024-03-20', updatedAt: '2025-05-28',
  },
  {
    id: '3', name: '瑞德电子科技', shortName: '瑞德电子', category: '零部件',
    kraljicQuadrant: 'bottleneck', profitImpactScore: 42, supplyRiskScore: 68,
    performanceGrade: 'C', overallScore: 74, qualityScore: 78, costScore: 70, deliveryScore: 72, serviceScore: 75,
    status: 'trial', contactPerson: '王芳', contactPhone: '13800138003',
    createdAt: '2024-06-10', updatedAt: '2025-06-05',
  },
  {
    id: '4', name: '鑫达包装材料厂', shortName: '鑫达包装', category: '包装材料',
    kraljicQuadrant: 'non_critical', profitImpactScore: 25, supplyRiskScore: 20,
    performanceGrade: 'B', overallScore: 85, qualityScore: 88, costScore: 82, deliveryScore: 86, serviceScore: 83,
    status: 'active', contactPerson: '赵刚', contactPhone: '13800138004',
    createdAt: '2024-08-05', updatedAt: '2025-05-30',
  },
  {
    id: '5', name: '盛通机械制造', shortName: '盛通机械', category: '外协加工',
    kraljicQuadrant: 'strategic', profitImpactScore: 70, supplyRiskScore: 60,
    performanceGrade: 'A', overallScore: 90, qualityScore: 92, costScore: 87, deliveryScore: 91, serviceScore: 88,
    status: 'active', contactPerson: '陈磊', contactPhone: '13800138005',
    createdAt: '2024-02-18', updatedAt: '2025-06-02',
  },
  {
    id: '6', name: '恒力橡塑制品', shortName: '恒力橡塑', category: '原材料',
    kraljicQuadrant: 'leverage', profitImpactScore: 55, supplyRiskScore: 30,
    performanceGrade: 'B', overallScore: 80, qualityScore: 82, costScore: 78, deliveryScore: 80, serviceScore: 79,
    status: 'active', contactPerson: '刘洋', contactPhone: '13800138006',
    createdAt: '2024-05-12', updatedAt: '2025-05-25',
  },
  {
    id: '7', name: '天宇磁材科技', shortName: '天宇磁材', category: '零部件',
    kraljicQuadrant: 'bottleneck', profitImpactScore: 38, supplyRiskScore: 75,
    performanceGrade: 'D', overallScore: 65, qualityScore: 68, costScore: 60, deliveryScore: 62, serviceScore: 70,
    status: 'suspended', contactPerson: '孙鹏', contactPhone: '13800138007',
    createdAt: '2024-04-22', updatedAt: '2025-06-08',
  },
];

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleAdd = () => {
    setEditingSupplier(null);
    setFormOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormOpen(true);
  };

  const handleSubmit = (data: SupplierFormData) => {
    if (editingSupplier) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === editingSupplier.id ? { ...s, ...data, updatedAt: new Date().toISOString().slice(0, 10) } : s))
      );
      message.success('供应商信息已更新');
    } else {
      const newSupplier: Supplier = {
        id: String(Date.now()),
        ...data,
        profitImpactScore: 0,
        supplyRiskScore: 0,
        overallScore: 0,
        qualityScore: 0,
        costScore: 0,
        deliveryScore: 0,
        serviceScore: 0,
        status: 'pending',
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      setSuppliers((prev) => [...prev, newSupplier]);
      message.success('供应商已添加');
    }
    setFormOpen(false);
  };

  return (
    <Card>
      <Tabs
        defaultActiveKey="list"
        items={[
          {
            key: 'list',
            label: '供应商列表',
            children: <SupplierList suppliers={suppliers} onAdd={handleAdd} onEdit={handleEdit} />,
          },
          {
            key: 'matrix',
            label: '卡拉杰克矩阵',
            children: <KraljicView suppliers={suppliers} />,
          },
        ]}
      />
      <SupplierForm open={formOpen} editingSupplier={editingSupplier} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
    </Card>
  );
};

export default Suppliers;
