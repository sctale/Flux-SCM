import React, { useState } from 'react';
import { Card, Tabs, Button, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import MaterialList from '@/components/material/MaterialList';
import MaterialForm from '@/components/material/MaterialForm';
import ABCXYZView from '@/components/material/ABCXYZView';
import HelpPanel from '@/components/common/HelpPanel';
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
  const [helpVisible, setHelpVisible] = useState(true);

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
    <>
      <Card extra={<Button icon={<QuestionCircleOutlined />} onClick={() => setHelpVisible(true)}>帮助</Button>}>
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
      <HelpPanel
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
        title="物料管理帮助"
        sections={[
          { title: '物料列表', content: '物料列表展示所有已录入的物料信息，支持按类别、ABC分类、XYZ分类筛选。\n\n点击"添加物料"按钮可新增物料，填写物料编码、名称、规格、单位等基本信息。\n\n物料编码建议遵循统一规则：类别-材质-序号，如 JJ-SS-M8-JM-001' },
          { title: 'ABC-XYZ矩阵', content: 'ABC-XYZ矩阵是物料分类的核心工具：\n\nABC分类（按价值）：\n• A类：占采购金额70-80%的少数物料\n• B类：占采购金额15-20%\n• C类：占采购金额5-10%的大量低值物料\n\nXYZ分类（按需求波动性）：\n• X类：需求稳定，变异系数<0.5\n• Y类：需求中等波动，变异系数0.5-1.0\n• Z类：需求高度波动，变异系数>1.0\n\n九宫格交叉分析可帮助制定差异化的采购策略' },
          { title: '物料编码规则', content: '推荐编码格式：类别缩写-材质缩写-规格-序号\n\n示例：\n• JJ-SS-M8-JM-001（机加-不锈钢-M8-精密-001）\n• YJ-CU-R10-HT-001（元件-铜-R10-华通-001）\n• TH-SS-C20-HL-001（弹簧-不锈钢-C20-恒力-001）' },
        ]}
      />
    </>
  );
};

export default Materials;
