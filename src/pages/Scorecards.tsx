import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Slider, Row, Col, Statistic, Tag, Space, message } from 'antd';
import { TrophyOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const API = '/api/scorecards';

interface Scorecard {
  id: string; supplier_id: string; supplier_name: string;
  quality_score: number; quality_weight: number;
  cost_score: number; cost_weight: number;
  delivery_score: number; delivery_weight: number;
  service_score: number; service_weight: number;
  innovation_score: number; innovation_weight: number;
  weighted_total: number; grade: string; period: string; remark: string;
}

const Scorecards: React.FC = () => {
  const [data, setData] = useState<Scorecard[]>([]);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Scorecard | null>(null);
  const [weights, setWeights] = useState({ quality: 30, cost: 25, delivery: 25, service: 10, innovation: 10 });

  const fetchData = () => {
    fetch(API).then(r => r.json()).then(setData).catch(() => message.error('加载失败'));
  };
  useEffect(() => { fetchData(); }, []);

  // 等级分布饼图
  const gradePieOption = {
    title: { text: '等级分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['40%', '70%'],
      data: ['A', 'B', 'C', 'D', 'F'].map(g => ({
        name: g + '级', value: data.filter(d => d.grade === g).length,
        itemStyle: { color: g === 'A' ? '#52c41a' : g === 'B' ? '#1890ff' : g === 'C' ? '#faad14' : '#ff4d4f' }
      })).filter(d => d.value > 0),
      label: { formatter: '{b}: {c}' }
    }]
  };

  // 维度平均雷达图
  const radarOption = {
    title: { text: '维度平均分', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: {},
    radar: { indicator: [
      { name: '质量', max: 100 }, { name: '成本', max: 100 },
      { name: '交付', max: 100 }, { name: '服务', max: 100 }, { name: '创新', max: 100 }
    ]},
    series: [{ type: 'radar', data: [{ value: [
      Math.round(data.reduce((s, d) => s + d.quality_score, 0) / (data.length || 1)),
      Math.round(data.reduce((s, d) => s + d.cost_score, 0) / (data.length || 1)),
      Math.round(data.reduce((s, d) => s + d.delivery_score, 0) / (data.length || 1)),
      Math.round(data.reduce((s, d) => s + d.service_score, 0) / (data.length || 1)),
      Math.round(data.reduce((s, d) => s + d.innovation_score, 0) / (data.length || 1)),
    ], name: '平均分' }] }]
  };

  // 供应商评分对比堆叠柱状图
  const stackBarOption = {
    title: { text: '供应商评分对比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, data: ['质量', '成本', '交付', '服务', '创新'] },
    xAxis: { type: 'category', data: data.map(d => d.supplier_name?.substring(0, 4) || '') },
    yAxis: { type: 'value' },
    series: [
      { name: '质量', type: 'bar', stack: 'total', data: data.map(d => +(d.quality_score * d.quality_weight).toFixed(1)), itemStyle: { color: '#1890ff' } },
      { name: '成本', type: 'bar', stack: 'total', data: data.map(d => +(d.cost_score * d.cost_weight).toFixed(1)), itemStyle: { color: '#52c41a' } },
      { name: '交付', type: 'bar', stack: 'total', data: data.map(d => +(d.delivery_score * d.delivery_weight).toFixed(1)), itemStyle: { color: '#faad14' } },
      { name: '服务', type: 'bar', stack: 'total', data: data.map(d => +(d.service_score * d.service_weight).toFixed(1)), itemStyle: { color: '#722ed1' } },
      { name: '创新', type: 'bar', stack: 'total', data: data.map(d => +(d.innovation_score * d.innovation_weight).toFixed(1)), itemStyle: { color: '#13c2c2' } },
    ]
  };

  const gradeColor = (g: string) => g === 'A' ? 'green' : g === 'B' ? 'blue' : g === 'C' ? 'orange' : 'red';

  const columns = [
    { title: '供应商', dataIndex: 'supplier_name', key: 'supplier_name' },
    { title: '质量', dataIndex: 'quality_score', key: 'q', render: (v: number, r: Scorecard) => `${v} (${(r.quality_weight * 100).toFixed(0)}%)` },
    { title: '成本', dataIndex: 'cost_score', key: 'c', render: (v: number, r: Scorecard) => `${v} (${(r.cost_weight * 100).toFixed(0)}%)` },
    { title: '交付', dataIndex: 'delivery_score', key: 'd', render: (v: number, r: Scorecard) => `${v} (${(r.delivery_weight * 100).toFixed(0)}%)` },
    { title: '服务', dataIndex: 'service_score', key: 's', render: (v: number, r: Scorecard) => `${v} (${(r.service_weight * 100).toFixed(0)}%)` },
    { title: '创新', dataIndex: 'innovation_score', key: 'i', render: (v: number, r: Scorecard) => `${v} (${(r.innovation_weight * 100).toFixed(0)}%)` },
    { title: '加权总分', dataIndex: 'weighted_total', key: 'wt', render: (v: number) => v.toFixed(1) },
    { title: '等级', dataIndex: 'grade', key: 'grade', render: (v: string) => <Tag color={gradeColor(v)}>{v}</Tag> },
    { title: '期间', dataIndex: 'period', key: 'period' },
    {
      title: '操作', key: 'action',
      render: (_: any, record: Scorecard) => (
        <Button size="small" icon={<SettingOutlined />} onClick={() => {
          setEditingRecord(record);
          setWeights({
            quality: Math.round(record.quality_weight * 100),
            cost: Math.round(record.cost_weight * 100),
            delivery: Math.round(record.delivery_weight * 100),
            service: Math.round(record.service_weight * 100),
            innovation: Math.round(record.innovation_weight * 100),
          });
          setWeightModalVisible(true);
        }}>设置权重</Button>
      )
    },
  ];

  const handleWeightSave = async () => {
    if (!editingRecord) return;
    const total = weights.quality + weights.cost + weights.delivery + weights.service + weights.innovation;
    if (total !== 100) { message.error(`权重总和必须为100%，当前为${total}%`); return; }

    await fetch(`${API}/${editingRecord.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editingRecord,
        quality_weight: weights.quality / 100,
        cost_weight: weights.cost / 100,
        delivery_weight: weights.delivery / 100,
        service_weight: weights.service / 100,
        innovation_weight: weights.innovation / 100,
      }),
    });
    message.success('权重已更新');
    setWeightModalVisible(false);
    fetchData();
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="评分供应商数" value={data.length} prefix={<TrophyOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="A级供应商" value={data.filter(d => d.grade === 'A').length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="平均加权分" value={data.length ? (data.reduce((s, d) => s + d.weighted_total, 0) / data.length).toFixed(1) : 0} /></Card></Col>
        <Col span={6}><Card><Statistic title="B级及以上" value={data.filter(d => ['A', 'B'].includes(d.grade)).length} valueStyle={{ color: '#1890ff' }} /></Card></Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}><Card size="small"><ReactECharts option={gradePieOption} style={{ height: 250 }} /></Card></Col>
        <Col span={8}><Card size="small"><ReactECharts option={radarOption} style={{ height: 250 }} /></Card></Col>
        <Col span={8}><Card size="small"><ReactECharts option={stackBarOption} style={{ height: 250 }} /></Card></Col>
      </Row>

      <Card title="供应商积分卡明细" size="small">
        <Table dataSource={data} columns={columns} rowKey="id" size="small" pagination={false} />
      </Card>

      <Modal title="设置评分权重" open={weightModalVisible} onOk={handleWeightSave} onCancel={() => setWeightModalVisible(false)} width={500}>
        <p style={{ marginBottom: 16, color: '#888' }}>调整各维度权重，总和必须为100%</p>
        {[
          { key: 'quality' as const, label: '质量' },
          { key: 'cost' as const, label: '成本' },
          { key: 'delivery' as const, label: '交付' },
          { key: 'service' as const, label: '服务' },
          { key: 'innovation' as const, label: '创新' },
        ].map(item => (
          <Row key={item.key} align="middle" style={{ marginBottom: 8 }}>
            <Col span={4}><strong>{item.label}</strong></Col>
            <Col span={16}><Slider min={0} max={100} value={weights[item.key]} onChange={v => setWeights({ ...weights, [item.key]: v })} /></Col>
            <Col span={4} style={{ textAlign: 'right' }}>{weights[item.key]}%</Col>
          </Row>
        ))}
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 16 }}>
          总计：<span style={{ color: weights.quality + weights.cost + weights.delivery + weights.service + weights.innovation === 100 ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
            {weights.quality + weights.cost + weights.delivery + weights.service + weights.innovation}%
          </span>
        </div>
      </Modal>
    </div>
  );
};

export default Scorecards;
