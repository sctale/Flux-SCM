import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Statistic, Row, Col, Tag, message } from 'antd';
import { MergeCellsOutlined, WarningOutlined, SwapOutlined, SafetyCertificateOutlined, PieChartOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const ProcurementOptimization: React.FC = () => {
  const [consolidation, setConsolidation] = useState<any[]>([]);
  const [moqConflicts, setMoqConflicts] = useState<any[]>([]);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [safetyStock, setSafetyStock] = useState<any[]>([]);
  const [concentration, setConcentration] = useState<any>({ hhi: 0, cr3: 0, cr5: 0, concentration_level: '', suppliers: [] });

  useEffect(() => {
    fetch('/api/consolidation').then(r => r.json()).then(setConsolidation).catch(() => message.error('加载合并建议失败'));
    fetch('/api/moq-conflicts').then(r => r.json()).then(setMoqConflicts).catch(() => message.error('加载MOQ冲突失败'));
    fetch('/api/alternatives').then(r => r.json()).then(setAlternatives).catch(() => message.error('加载替代建议失败'));
    fetch('/api/safety-stock').then(r => r.json()).then(setSafetyStock).catch(() => message.error('加载安全库存失败'));
    fetch('/api/concentration').then(r => r.json()).then(setConcentration).catch(() => message.error('加载集中度分析失败'));
  }, []);

  // 汇总卡片
  const totalSavings = consolidation.reduce((s: number, c: any) => s + (c.estimated_savings || 0), 0);
  const totalOverageCost = moqConflicts.reduce((s: number, c: any) => s + (c.overage_cost || 0), 0);

  // HHI仪表盘
  const hhiGaugeOption = {
    title: { text: 'HHI集中度指数', left: 'center', textStyle: { fontSize: 14 } },
    series: [{
      type: 'gauge', min: 0, max: 5000,
      detail: { formatter: '{value}' },
      data: [{ value: concentration.hhi, name: concentration.concentration_level }],
      axisLine: { lineStyle: { color: [[0.3, '#52c41a'], [0.5, '#faad14'], [1, '#ff4d4f']] } }
    }]
  };

  // 供应商份额饼图
  const sharePieOption = {
    title: { text: '供应商采购份额', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['35%', '65%'],
      data: (concentration.suppliers || []).map((s: any) => ({ name: s.name?.substring(0, 4), value: +(s.share?.toFixed(1) || 0) })),
      label: { formatter: '{b}: {c}%' }
    }]
  };

  const consolidationColumns = [
    { title: '供应商', dataIndex: 'supplier_name', key: 's' },
    { title: '物料数', dataIndex: 'material_count', key: 'mc' },
    { title: '预估节省', dataIndex: 'estimated_savings', key: 'es', render: (v: number) => <Tag color="green">¥{(v || 0).toFixed(0)}</Tag> },
    { title: '涉及物料', dataIndex: 'materials', key: 'm', ellipsis: true },
  ];

  const moqColumns = [
    { title: '物料', dataIndex: 'name', key: 'n' },
    { title: '供应商', dataIndex: 'supplier_name', key: 's' },
    { title: '安全库存', dataIndex: 'safety_stock', key: 'ss' },
    { title: '最小起订量', dataIndex: 'min_order_qty', key: 'moq' },
    { title: '超量数', dataIndex: 'overage_qty', key: 'oq' },
    { title: '超量成本', dataIndex: 'overage_cost', key: 'oc', render: (v: number) => <Tag color="red">¥{(v || 0).toFixed(2)}</Tag> },
  ];

  const altColumns = [
    { title: '物料', dataIndex: 'name', key: 'n' },
    { title: '类别', dataIndex: 'category', key: 'cat' },
    { title: '替代物料', dataIndex: 'alt_name', key: 'an' },
    { title: '替代价格', dataIndex: 'alt_price', key: 'ap', render: (v: number) => v ? `¥${v.toFixed(2)}` : '-' },
    { title: '替代供应商', dataIndex: 'alt_supplier_name', key: 'as' },
  ];

  const ssColumns = [
    { title: '物料', dataIndex: 'name', key: 'n' },
    { title: 'ABC', dataIndex: 'abc_class', key: 'abc', render: (v: string) => <Tag color={v === 'A' ? 'red' : v === 'B' ? 'orange' : 'green'}>{v}</Tag> },
    { title: 'XYZ', dataIndex: 'xyz_class', key: 'xyz', render: (v: string) => <Tag>{v}</Tag> },
    { title: '提前期(天)', dataIndex: 'lead_time', key: 'lt' },
    { title: '当前安全库存', dataIndex: 'current_safety_stock', key: 'css' },
    { title: '建议库存天数', dataIndex: 'suggested_safety_days', key: 'ssd', render: (v: number) => <Tag color="blue">{v}天</Tag> },
    { title: '策略', dataIndex: 'policy', key: 'p', render: (v: string) => <Tag color="cyan">{v}</Tag> },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={5}><Card size="small"><Statistic title="合并建议" value={consolidation.length} prefix={<MergeCellsOutlined />} /><div style={{ fontSize: 12, color: '#888' }}>可节省 ¥{totalSavings.toFixed(0)}</div></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="MOQ冲突" value={moqConflicts.length} prefix={<WarningOutlined />} valueStyle={{ color: moqConflicts.length > 0 ? '#ff4d4f' : '#52c41a' }} /><div style={{ fontSize: 12, color: '#888' }}>超量成本 ¥{totalOverageCost.toFixed(0)}</div></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="替代建议" value={alternatives.length} prefix={<SwapOutlined />} /></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="安全库存建议" value={safetyStock.length} prefix={<SafetyCertificateOutlined />} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="HHI指数" value={concentration.hhi} prefix={<PieChartOutlined />} valueStyle={{ color: concentration.hhi > 2500 ? '#ff4d4f' : concentration.hhi > 1500 ? '#faad14' : '#52c41a' }} /><div style={{ fontSize: 12, color: '#888' }}>{concentration.concentration_level}</div></Card></Col>
      </Row>

      <Tabs items={[
        {
          key: 'consolidation', label: '合并建议',
          children: <Table dataSource={consolidation} columns={consolidationColumns} rowKey="supplier_id" size="small" pagination={false} />,
        },
        {
          key: 'moq', label: 'MOQ冲突',
          children: <Table dataSource={moqConflicts} columns={moqColumns} rowKey="material_id" size="small" pagination={false} />,
        },
        {
          key: 'alternatives', label: '替代物料',
          children: <Table dataSource={alternatives} columns={altColumns} rowKey="material_id" size="small" pagination={{ pageSize: 10 }} />,
        },
        {
          key: 'safety', label: '安全库存',
          children: <Table dataSource={safetyStock} columns={ssColumns} rowKey="id" size="small" pagination={false} />,
        },
        {
          key: 'concentration', label: '集中度分析',
          children: <Row gutter={16}>
            <Col span={12}><Card size="small"><ReactECharts option={hhiGaugeOption} style={{ height: 280 }} /></Card></Col>
            <Col span={12}><Card size="small"><ReactECharts option={sharePieOption} style={{ height: 280 }} /></Card></Col>
          </Row>,
        },
      ]} />
    </div>
  );
};

export default ProcurementOptimization;
