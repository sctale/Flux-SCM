import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Modal, Form, Select, InputNumber, Input, Row, Col, Statistic, Tag, message } from 'antd';
import { AuditOutlined, PlusOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const API = '/api/should-cost';

interface ShouldCostRecord {
  id: string; supplier_id: string; supplier_name: string;
  material_id: string; material_name: string; material_code: string;
  material_cost: number; labor_cost: number; overhead_cost: number;
  equipment_cost: number; logistics_cost: number; profit_margin: number;
  should_cost_total: number; quoted_price: number; variance_pct: number; remark: string;
}

const ShouldCost: React.FC = () => {
  const [data, setData] = useState<ShouldCostRecord[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchData = () => { fetch(API).then(r => r.json()).then(setData).catch(() => message.error('加载失败')); };
  const fetchOptions = () => {
    fetch('/api/suppliers').then(r => r.json()).then(setSuppliers);
    fetch('/api/materials').then(r => r.json()).then(setMaterials);
  };
  useEffect(() => { fetchData(); fetchOptions(); }, []);

  // 汇总统计
  const stats = useMemo(() => {
    const avgVariance = data.length ? (data.reduce((s, d) => s + d.variance_pct, 0) / data.length) : 0;
    const overPriced = data.filter(d => d.variance_pct > 5).length;
    const reasonable = data.filter(d => Math.abs(d.variance_pct) <= 5).length;
    return { avgVariance, overPriced, reasonable };
  }, [data]);

  // 应该成本 vs 报价对比柱状图
  const compareBarOption = useMemo(() => ({
    title: { text: '应该成本 vs 报价对比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, data: ['应该成本', '报价'] },
    xAxis: { type: 'category', data: data.map(d => d.material_name?.substring(0, 6) || '') },
    yAxis: { type: 'value' },
    series: [
      { name: '应该成本', type: 'bar', data: data.map(d => d.should_cost_total), itemStyle: { color: '#52c41a' } },
      { name: '报价', type: 'bar', data: data.map(d => d.quoted_price), itemStyle: { color: '#ff4d4f' } },
    ]
  }), [data]);

  // 偏差率分布图
  const varianceOption = useMemo(() => ({
    title: { text: '偏差率分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map(d => d.material_name?.substring(0, 6) || '') },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: [{
      type: 'bar', data: data.map(d => ({
        value: +d.variance_pct.toFixed(1),
        itemStyle: { color: d.variance_pct > 5 ? '#ff4d4f' : d.variance_pct < -5 ? '#52c41a' : '#faad14' }
      })),
      label: { show: true, formatter: '{c}%' }
    }]
  }), [data]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('创建失败');
      message.success('应该成本分析已创建');
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (e: any) {
      if (e.errorFields) return;
      message.error(e.message || '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条应该成本分析记录吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('删除失败');
          message.success('已删除');
          fetchData();
        } catch (e: any) {
          message.error(e.message || '删除失败');
        }
      },
    });
  };

  const columns = [
    { title: '供应商', dataIndex: 'supplier_name', key: 's' },
    { title: '物料', dataIndex: 'material_name', key: 'm' },
    { title: '应该成本', dataIndex: 'should_cost_total', key: 'sc', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '报价', dataIndex: 'quoted_price', key: 'qp', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '偏差率', dataIndex: 'variance_pct', key: 'vp', render: (v: number) => {
      const color = v > 5 ? 'red' : v < -5 ? 'green' : 'orange';
      return <Tag color={color}>{v.toFixed(1)}%</Tag>;
    }},
    { title: '备注', dataIndex: 'remark', key: 'r', ellipsis: true },
    {
      title: '操作', key: 'action',
      render: (_: any, record: ShouldCostRecord) => <Button size="small" danger onClick={() => handleDelete(record.id)}>删除</Button>
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="分析数" value={data.length} prefix={<AuditOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="平均偏差率" value={stats.avgVariance.toFixed(1)} suffix="%" valueStyle={{ color: stats.avgVariance > 5 ? '#ff4d4f' : '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="报价偏高数" value={stats.overPriced} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="合理报价数" value={stats.reasonable} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}><Card size="small"><ReactECharts option={compareBarOption} style={{ height: 280 }} /></Card></Col>
        <Col span={12}><Card size="small"><ReactECharts option={varianceOption} style={{ height: 280 }} /></Card></Col>
      </Row>

      <Card title="应该成本分析明细" size="small" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建分析</Button>}>
        <Table dataSource={data} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          expandable={{
            expandedRowRender: (record: ShouldCostRecord) => {
              const costs = [
                { name: '材料', value: record.material_cost },
                { name: '人工', value: record.labor_cost },
                { name: '间接费', value: record.overhead_cost },
                { name: '设备', value: record.equipment_cost },
                { name: '物流', value: record.logistics_cost },
                { name: '利润', value: record.profit_margin },
              ];
              const pieOption = {
                tooltip: { trigger: 'item' },
                series: [{ type: 'pie', radius: '60%', data: costs.filter(c => c.value > 0), label: { formatter: '{b}: ¥{c}' } }]
              };
              return <Row gutter={16}>
                <Col span={12}><ReactECharts option={pieOption} style={{ height: 200 }} /></Col>
                <Col span={12}>
                  {costs.map(c => <div key={c.name}>{c.name}: ¥{c.value.toFixed(2)}</div>)}
                  <div style={{ fontWeight: 'bold', marginTop: 8 }}>应该成本合计: ¥{record.should_cost_total.toFixed(2)}</div>
                  <div>报价: ¥{record.quoted_price.toFixed(2)} (偏差 {record.variance_pct.toFixed(1)}%)</div>
                </Col>
              </Row>;
            }
          }}
        />
      </Card>

      <Modal title="新建应该成本分析" open={modalVisible} onOk={handleSubmit} confirmLoading={submitting} onCancel={() => { setModalVisible(false); form.resetFields(); }} width={600}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="supplier_id" label="供应商" rules={[{ required: true }]}><Select options={suppliers.map((s: any) => ({ value: s.id, label: s.name }))} placeholder="选择供应商" /></Form.Item></Col>
            <Col span={12}><Form.Item name="material_id" label="物料" rules={[{ required: true }]}><Select options={materials.map((m: any) => ({ value: m.id, label: `${m.code} - ${m.name}` }))} placeholder="选择物料" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="material_cost" label="材料成本" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="labor_cost" label="人工成本" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="overhead_cost" label="间接费用" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="equipment_cost" label="设备成本" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="logistics_cost" label="物流成本" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="profit_margin" label="合理利润" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="quoted_price" label="供应商报价" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} addonAfter="元" /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} placeholder="可选" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ShouldCost;
