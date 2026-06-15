import React, { useState, useEffect } from 'react';
import { Card, Tabs, message } from 'antd';
import MaterialList from '@/components/material/MaterialList';
import MaterialForm from '@/components/material/MaterialForm';
import ABCXYZView from '@/components/material/ABCXYZView';
import { materialApi, toCamelCase, toSnakeCase } from '@/services/api';
import type { Material, MaterialFormData } from '@/types/material';

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await materialApi.list();
      setMaterials(res.data.map(toCamelCase));
    } catch (e: any) {
      message.error('获取物料数据失败: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleSubmit = async (data: MaterialFormData) => {
    try {
      const snakeData = toSnakeCase(data);
      await materialApi.create(snakeData);
      message.success('物料已添加');
      setFormOpen(false);
      fetchMaterials();
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
            label: '物料列表',
            children: <MaterialList materials={materials} loading={loading} onAdd={() => setFormOpen(true)} />,
          },
          {
            key: 'matrix',
            label: 'ABC-XYZ矩阵',
            children: <ABCXYZView materials={materials} />,
          },
        ]}
      />
      <MaterialForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
    </Card>
  );
};

export default Materials;
