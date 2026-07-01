import React, { useEffect, useState } from 'react';
import { Card, Tabs, Button, Modal, message, Spin } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import MaterialList from '@/components/material/MaterialList';
import MaterialForm from '@/components/material/MaterialForm';
import ABCXYZView from '@/components/material/ABCXYZView';
import HelpPanel from '@/components/common/HelpPanel';
import type { Material, MaterialFormData } from '@/types/material';

const API = '/api/materials';

const mapMaterial = (m: any): Material => ({
  id: m.id,
  code: m.code,
  name: m.name,
  specification: m.specification,
  unit: m.unit,
  category: m.category,
  materialType: m.material_type,
  safetyStock: m.safety_stock ?? 0,
  leadTime: m.lead_time ?? 0,
  drawingNo: m.drawing_no,
  abcClass: m.abc_class,
  xyzClass: m.xyz_class,
  annualConsumptionValue: m.annual_consumption_value,
  coefficientOfVariation: m.coefficient_of_variation,
  remark: m.remark,
  createdAt: m.created_at,
  updatedAt: m.updated_at,
});

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [helpVisible, setHelpVisible] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const json = await res.json();
      setMaterials((json.data || []).map(mapMaterial));
    } catch (e) {
      message.error('加载物料失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAdd = () => {
    setEditingMaterial(null);
    setFormOpen(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormOpen(true);
  };

  const handleSubmit = async (data: MaterialFormData) => {
    try {
      if (editingMaterial) {
        const res = await fetch(`${API}/${editingMaterial.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('更新失败');
        message.success('物料信息已更新');
      } else {
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('创建失败');
        message.success('物料已添加');
      }
      setFormOpen(false);
      fetchMaterials();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const handleDelete = (material: Material) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除物料「${material.name}」吗？关联数据将一并清理。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await fetch(`${API}/${material.id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('删除失败');
          message.success('已删除');
          fetchMaterials();
        } catch (e: any) {
          message.error(e.message || '删除失败');
        }
      },
    });
  };

  return (
    <Spin spinning={loading} tip="数据加载中...">
      <>
        <Card extra={<Button icon={<QuestionCircleOutlined />} onClick={() => setHelpVisible(true)}>帮助</Button>}>
          <Tabs
            defaultActiveKey="list"
            items={[
              {
                key: 'list',
                label: '物料列表',
                children: (
                  <MaterialList
                    materials={materials}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ),
              },
              {
                key: 'matrix',
                label: 'ABC-XYZ矩阵',
                children: <ABCXYZView materials={materials} />,
              },
            ]}
          />
          <MaterialForm
            open={formOpen}
            editingMaterial={editingMaterial}
            onClose={() => setFormOpen(false)}
            onSubmit={handleSubmit}
          />
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
    </Spin>
  );
};

export default Materials;
