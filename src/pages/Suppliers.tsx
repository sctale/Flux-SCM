import React, { useState, useEffect } from 'react';
import { Card, Tabs, message } from 'antd';
import SupplierList from '@/components/supplier/SupplierList';
import SupplierForm from '@/components/supplier/SupplierForm';
import KraljicView from '@/components/supplier/KraljicView';
import PerformanceRadar from '@/components/supplier/PerformanceRadar';
import { supplierApi, toCamelCase, toSnakeCase } from '@/services/api';
import type { Supplier, SupplierFormData } from '@/types/supplier';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await supplierApi.list();
      setSuppliers(res.data.map(toCamelCase));
    } catch (e: any) {
      message.error('获取供应商数据失败: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleAdd = () => {
    setEditingSupplier(null);
    setFormOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await supplierApi.delete(id);
      message.success('删除成功');
      fetchSuppliers();
    } catch (e: any) {
      message.error('删除失败: ' + e.message);
    }
  };

  const handleSubmit = async (data: SupplierFormData) => {
    try {
      const snakeData = toSnakeCase(data);
      if (editingSupplier) {
        await supplierApi.update(editingSupplier.id, snakeData);
        message.success('供应商信息已更新');
      } else {
        await supplierApi.create(snakeData);
        message.success('供应商已添加');
      }
      setFormOpen(false);
      fetchSuppliers();
    } catch (e: any) {
      message.error('操作失败: ' + e.message);
    }
  };

  return (
    <Card>
      <Tabs
        defaultActiveKey="list"
        items={[
          {
            key: 'list',
            label: '供应商列表',
            children: <SupplierList suppliers={suppliers} loading={loading} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} />,
          },
          {
            key: 'matrix',
            label: '卡拉杰克矩阵',
            children: <KraljicView suppliers={suppliers} />,
          },
          {
            key: 'radar',
            label: '绩效雷达',
            children: <PerformanceRadar suppliers={suppliers} />,
          },
        ]}
      />
      <SupplierForm open={formOpen} editingSupplier={editingSupplier} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
    </Card>
  );
};

export default Suppliers;
