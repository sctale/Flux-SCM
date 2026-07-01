import React, { useState } from 'react';
import { Table, Card, Row, Col, Tag, Select, Space, Button, Input, Statistic } from 'antd';
import { ShopOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { Supplier, SupplierStatus } from '@/types/supplier';
import type { KraljicQuadrant, PerformanceGrade } from '@/types/common';
import { quadrantLabels, quadrantColors } from '@/utils/kraljic';
import { gradeColors } from '@/utils/scoring';

interface SupplierListProps {
  suppliers: Supplier[];
  onAdd: () => void;
  onEdit: (supplier: Supplier) => void;
  onDelete?: (supplier: Supplier) => void;
}

const statusMap: Record<SupplierStatus, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'default' },
  trial: { label: '试用中', color: 'processing' },
  active: { label: '合格', color: 'success' },
  suspended: { label: '暂停', color: 'warning' },
  blacklisted: { label: '黑名单', color: 'error' },
};

const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onAdd, onEdit, onDelete }) => {
  const [filterQuadrant, setFilterQuadrant] = useState<KraljicQuadrant | undefined>();
  const [filterGrade, setFilterGrade] = useState<PerformanceGrade | undefined>();
  const [filterStatus, setFilterStatus] = useState<SupplierStatus | undefined>();
  const [searchText, setSearchText] = useState('');

  const filtered = suppliers.filter((s) => {
    if (filterQuadrant && s.kraljicQuadrant !== filterQuadrant) return false;
    if (filterGrade && s.performanceGrade !== filterGrade) return false;
    if (filterStatus && s.status !== filterStatus) return false;
    if (searchText && !s.name.includes(searchText) && !(s.shortName || '').includes(searchText)) return false;
    return true;
  });

  const activeCount = suppliers.filter((s) => s.status === 'active').length;
  const trialCount = suppliers.filter((s) => s.status === 'trial').length;
  const riskCount = suppliers.filter((s) => s.status === 'suspended' || s.status === 'blacklisted').length;

  const columns = [
    { title: '供应商名称', dataIndex: 'name', key: 'name', render: (text: string, record: Supplier) => <a onClick={() => onEdit(record)}>{text}</a> },
    { title: '简称', dataIndex: 'shortName', key: 'shortName' },
    { title: '矩阵分类', dataIndex: 'kraljicQuadrant', key: 'kraljicQuadrant', render: (q: KraljicQuadrant) => q ? <Tag color={quadrantColors[q]}>{quadrantLabels[q]}</Tag> : '-' },
    { title: '绩效等级', dataIndex: 'performanceGrade', key: 'performanceGrade', render: (g: PerformanceGrade) => g ? <Tag color={gradeColors[g]}>{g}级</Tag> : '-' },
    { title: '综合得分', dataIndex: 'overallScore', key: 'overallScore', sorter: (a: Supplier, b: Supplier) => a.overallScore - b.overallScore },
    { title: '质量', dataIndex: 'qualityScore', key: 'qualityScore' },
    { title: '成本', dataIndex: 'costScore', key: 'costScore' },
    { title: '交付', dataIndex: 'deliveryScore', key: 'deliveryScore' },
    { title: '服务', dataIndex: 'serviceScore', key: 'serviceScore' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: SupplierStatus) => <Tag color={statusMap[s].color}>{statusMap[s].label}</Tag> },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: any, record: Supplier) => (
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>编辑</Button>
          {onDelete && <Button size="small" danger onClick={() => onDelete(record)}>删除</Button>}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small"><Statistic title="合格供应商" value={activeCount} prefix={<CheckCircleOutlined style={{ color: '#52C41A' }} />} /></Card>
        </Col>
        <Col span={8}>
          <Card size="small"><Statistic title="试用中" value={trialCount} prefix={<ExclamationCircleOutlined style={{ color: '#1677FF' }} />} /></Card>
        </Col>
        <Col span={8}>
          <Card size="small"><Statistic title="风险供应商" value={riskCount} prefix={<CloseCircleOutlined style={{ color: '#FF4D4F' }} />} /></Card>
        </Col>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search placeholder="搜索供应商名称" allowClear style={{ width: 240 }} onSearch={setSearchText} onChange={(e) => !e.target.value && setSearchText('')} />
          <Select placeholder="矩阵分类" allowClear style={{ width: 140 }} value={filterQuadrant} onChange={setFilterQuadrant}
            options={Object.entries(quadrantLabels).map(([k, v]) => ({ value: k, label: v }))} />
          <Select placeholder="绩效等级" allowClear style={{ width: 120 }} value={filterGrade} onChange={setFilterGrade}
            options={['A', 'B', 'C', 'D', 'F'].map((g) => ({ value: g, label: `${g}级` }))} />
          <Select placeholder="状态" allowClear style={{ width: 120 }} value={filterStatus} onChange={setFilterStatus}
            options={Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.label }))} />
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>新增供应商</Button>
        </Space>
      </Card>

      <Table rowKey="id" dataSource={filtered} columns={columns} size="small" pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }} />
    </div>
  );
};

export default SupplierList;
