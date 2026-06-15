import React, { useState } from 'react';
import { Card, Tabs, message } from 'antd';
import MaterialList from '@/components/material/MaterialList';
import MaterialForm from '@/components/material/MaterialForm';
import ABCXYZView from '@/components/material/ABCXYZView';
import type { Material, MaterialFormData } from '@/types/material';

const mockMaterials: Material[] = [
  {
    id: '1', code: 'CL-SS-0001', name: '精密齿轮', specification: 'M2-Z36-A', unit: '个', category: '齿轮类', materialType: '不锈钢',
    safetyStock: 200, leadTime: 15, abcClass: 'A', xyzClass: 'X', annualConsumptionValue: 580000, coefficientOfVariation: 0.22,
    createdAt: '2024-01-10', updatedAt: '2025-06-01',
  },
  {
    id: '2', code: 'YJ-RB-0001', name: '密封圈', specification: 'Φ50×3.5', unit: '个', category: '元件类', materialType: '橡胶',
    safetyStock: 5000, leadTime: 7, abcClass: 'A', xyzClass: 'Y', annualConsumptionValue: 420000, coefficientOfVariation: 0.65,
    createdAt: '2024-02-15', updatedAt: '2025-05-28',
  },
  {
    id: '3', code: 'CG-MG-0001', name: '钕铁硼磁钢', specification: 'N35-50×30×10', unit: '片', category: '磁钢类', materialType: '磁材',
    safetyStock: 100, leadTime: 30, abcClass: 'A', xyzClass: 'Z', annualConsumptionValue: 350000, coefficientOfVariation: 1.15,
    createdAt: '2024-03-20', updatedAt: '2025-06-05',
  },
  {
    id: '4', code: 'JJ-CS-0001', name: '传动轴', specification: 'Φ25×200', unit: '根', category: '机加类', materialType: '碳钢',
    safetyStock: 50, leadTime: 20, abcClass: 'B', xyzClass: 'X', annualConsumptionValue: 180000, coefficientOfVariation: 0.30,
    createdAt: '2024-04-12', updatedAt: '2025-05-30',
  },
  {
    id: '5', code: 'TH-SS-0001', name: '压缩弹簧', specification: 'Φ8×40', unit: '个', category: '弹簧类', materialType: '不锈钢',
    safetyStock: 3000, leadTime: 10, abcClass: 'B', xyzClass: 'Y', annualConsumptionValue: 120000, coefficientOfVariation: 0.72,
    createdAt: '2024-05-08', updatedAt: '2025-06-02',
  },
  {
    id: '6', code: 'XJ-RB-0001', name: '减震垫', specification: '60×40×8', unit: '个', category: '橡胶类', materialType: '橡胶',
    safetyStock: 2000, leadTime: 7, abcClass: 'B', xyzClass: 'Z', annualConsumptionValue: 95000, coefficientOfVariation: 1.08,
    createdAt: '2024-06-15', updatedAt: '2025-05-25',
  },
  {
    id: '7', code: 'BZ-PL-0001', name: '包装箱', specification: '400×300×250', unit: '箱', category: '包装箱', materialType: '塑料',
    safetyStock: 500, leadTime: 5, abcClass: 'C', xyzClass: 'X', annualConsumptionValue: 45000, coefficientOfVariation: 0.18,
    createdAt: '2024-07-20', updatedAt: '2025-05-20',
  },
  {
    id: '8', code: 'DS-CU-0001', name: '碳刷', specification: '12×8×25', unit: '个', category: '电刷类', materialType: '铜',
    safetyStock: 1000, leadTime: 12, abcClass: 'C', xyzClass: 'Y', annualConsumptionValue: 38000, coefficientOfVariation: 0.58,
    createdAt: '2024-08-10', updatedAt: '2025-06-03',
  },
  {
    id: '9', code: 'YZ-PL-0001', name: 'PCB电路板', specification: '4层-FR4', unit: '片', category: '印制板', materialType: '塑料',
    safetyStock: 100, leadTime: 14, abcClass: 'C', xyzClass: 'Z', annualConsumptionValue: 22000, coefficientOfVariation: 1.25,
    createdAt: '2024-09-05', updatedAt: '2025-05-22',
  },
];

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [formOpen, setFormOpen] = useState(false);

  const handleSubmit = (data: MaterialFormData) => {
    const newMaterial: Material = {
      id: String(Date.now()),
      code: data.code || '',
      name: data.name,
      specification: data.specification,
      unit: data.unit,
      category: data.category,
      materialType: data.materialType,
      safetyStock: data.safetyStock || 0,
      leadTime: data.leadTime || 0,
      drawingNo: data.drawingNo,
      remark: data.remark,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setMaterials((prev) => [...prev, newMaterial]);
    message.success('物料已添加');
    setFormOpen(false);
  };

  return (
    <Card>
      <Tabs
        defaultActiveKey="list"
        items={[
          {
            key: 'list',
            label: '物料列表',
            children: <MaterialList materials={materials} onAdd={() => setFormOpen(true)} />,
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
