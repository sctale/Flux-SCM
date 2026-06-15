import React, { useState } from 'react';
import { Table, Card, Input, Tag, Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Material } from '@/types/material';
import type { ABCClass, XYZClass } from '@/types/common';

interface MaterialListProps {
  materials: Material[];
  loading?: boolean;
  onAdd: () => void;
}

const abcColorMap: Record<ABCClass, string> = { A: 'red', B: 'orange', C: 'green' };
const xyzColorMap: Record<XYZClass, string> = { X: 'blue', Y: 'gold', Z: 'volcano' };
const abcLabelMap: Record<ABCClass, string> = { A: 'A类', B: 'B类', C: 'C类' };
const xyzLabelMap: Record<XYZClass, string> = { X: 'X类', Y: 'Y类', Z: 'Z类' };

const MaterialList: React.FC<MaterialListProps> = ({ materials, loading, onAdd }) => {
  const [searchText, setSearchText] = useState('');

  const filtered = materials.filter((m) => {
    if (searchText && !m.name.includes(searchText) && !m.code.includes(searchText)) return false;
    return true;
  });

  const columns = [
    { title: '物料编码', dataIndex: 'code', key: 'code', width: 140 },
    { title: '物料名称', dataIndex: 'name', key: 'name' },
    { title: '规格型号', dataIndex: 'specification', key: 'specification', ellipsis: true },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
    { title: 'ABC分类', dataIndex: 'abcClass', key: 'abcClass', width: 90, render: (v: ABCClass) => v ? <Tag color={abcColorMap[v]}>{abcLabelMap[v]}</Tag> : '-' },
    { title: 'XYZ分类', dataIndex: 'xyzClass', key: 'xyzClass', width: 90, render: (v: XYZClass) => v ? <Tag color={xyzColorMap[v]}>{xyzLabelMap[v]}</Tag> : '-' },
    { title: '年消耗金额', dataIndex: 'annualConsumptionValue', key: 'annualConsumptionValue', width: 120, render: (v: number) => v ? `¥${v.toLocaleString()}` : '-', sorter: (a: Material, b: Material) => (a.annualConsumptionValue || 0) - (b.annualConsumptionValue || 0) },
    { title: '变异系数', dataIndex: 'coefficientOfVariation', key: 'coefficientOfVariation', width: 100, render: (v: number) => v !== undefined ? v.toFixed(2) : '-' },
    { title: '安全库存', dataIndex: 'safetyStock', key: 'safetyStock', width: 90 },
    { title: '采购提前期', dataIndex: 'leadTime', key: 'leadTime', width: 100, render: (v: number) => `${v}天` },
  ];

  return (
    <div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search placeholder="搜索物料编码/名称" allowClear style={{ width: 280 }} onSearch={setSearchText} onChange={(e) => !e.target.value && setSearchText('')} />
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>新增物料</Button>
        </Space>
      </Card>
      <Table rowKey="id" dataSource={filtered} columns={columns} size="small" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }} scroll={{ x: 1200 }} />
    </div>
  );
};

export default MaterialList;
