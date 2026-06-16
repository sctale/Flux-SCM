import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Select, InputNumber, Row, Col, Statistic, Tag, message } from 'antd';
import { DollarOutlined, PlusOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const API = '/api/tco';

interface TCORecord {
  id: string; supplier_id: string; supplier_name: string;
  material_id: string; material_name: string; material_code: string;
  purchase_price: number; freight_cost: number; inspection_cost: number;
  storage_cost: number; quality_loss_cost: number; delay_cost: number;
  admin_cost: number; return_cost: number; warranty_cost: number;
  opportunity_cost: number; total_tco: number; remark: string;
}

const TCO: React.FC = () => {
  const [data, setData] = useState<TCORecord[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = () => { fetch(API).then(r => r.json()).then(setData).catch(() => message.error('加载失败')); };
  const fetchOptions = () => {
    fetch('/api/suppliers').then(r => r.json()).then(setSuppliers);
    fetch('/api/materials').then(r => r.json()).then(setMaterials);
  };
  useEffect(() => { fetchData(); fetchOptions(); }, []);

  // 汇总统计
  const avgTcoPremium = data.length ? ((data.reduce((s, d) => s + (d.total_tco - d.purchase_price), 0) / data.reduce((s, d) => s + d.purchase_price, 0)) * 100).toFixed(1) : '0';

  // 采购价 vs TCO 对比柱状图
  const compareBarOption = {
    title: { text: '采购价 vs TCO 对比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, data: ['采购价', 'TCO'] },
    xAxis: { type: 'category', data: data.map(d => d.material_name?.substring(0, 6) || '') },
    yAxis: { type: 'value' },
    series: [
      { name: '采购价', type: 'bar', data: data.map(d => d.purchase_price), itemStyle: { color: '#1890ff' } },
      { name: 'TCO', type: 'bar', data: data.map(d => d.total_tco), itemStyle: { color: '#ff4d4f' } },
    ]
  };

  // 隐性成本占比饼图
  const hiddenCostOption = {
    title: { text: '隐性成本构成', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['40%', '70%'],
      data: [
        { name: '运费', value: data.reduce((s, d) => s + d.freight_cost, 0) },
        { name: '检验', value: data.reduce((s, d) => s + d.inspection_cost, 0) },
        { name: '仓储', value: data.reduce((s, d) => s + d.storage_cost, 0) },
        { name: '质量损失', value: data.reduce((s, d) => s + d.quality_loss_cost, 0) },
        { name: '延迟', value: data.reduce((s, d) => s + d.delay_cost, 0) },
        { name: '管理', value: data.reduce((s, d) => s + d.admin_cost, 0) },
        { name: '退货', value: data.reduce((s, d) => s + d.return_cost, 0) },
        { name: '质保', value: data.reduce((s, d) => s + d.warranty_cost, 0) },
        { name: '机会成本', value: data.reduce((s, d) => s + d.opportunity_cost, 0) },
      ].filter(d => d.value > 0),
      label: { formatter: '{b}: {c}' }
    }]
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    message.success('TCO分析已创建');
    setModalVisible(false);
    form.resetFields();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    message.success('已删除');
    fetchData();
  };

  const columns = [
    { title: '供应商', dataIndex: 'supplier_name', key: 's' },
    { title: '物料', dataIndex: 'material_name', key: 'm' },
    { title: '采购价', dataIndex: 'purchase_price', key: 'pp', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: 'TCO', dataIndex: 'total_tco', key: 'tco', render: (v: number) => <Tag color="red">¥{v.toFixed(2)}</Tag> },
    { title: '溢价率', key: 'premium', render: (_: any, r: TCORecord) => `${((r.total_tco - r.purchase_price) / r.purchase_price * 100).toFixed(1)}%` },
    { title: '备注', dataIndex: 'remark', key: 'r', ellipsis: true },
    {
      title: '操作', key: 'action',
      render: (_: any, record: TCORecord) => <Button size="small" danger onClick={() => handleDelete(record.id)}>删除</Button>
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="TCO分析数" value={data.length} prefix={<DollarOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="平均TCO溢价" value={avgTcoPremium} suffix="%" valueStyle={{ color: parseFloat(avgTcoPremium) > 15 ? '#ff4d4f' : '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="总TCO" value={data.reduce((s, d) => s + d.total_tco, 0).toFixed(0)} prefix="¥" /></Card></Col>
        <Col span={6}><Card><Statistic title="总采购价" value={data.reduce((s, d) => s + d.purchase_price, 0).toFixed(0)} prefix="¥" valueStyle={{ color: '#1890ff' }} /></Card></Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}><Card size="small"><ReactECharts option={compareBarOption} style={{ height: 280 }} /></Card></Col>
        <Col span={12}><Card size="small"><ReactECharts option={hiddenCostOption} style={{ height: 280 }} /></Card></Col>
      </Row>

      <Card title="TCO分析明细" size="small" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建分析</Button>}>
        <Table dataSource={data} columns={columns} rowKey="id" size="small" pagination={false}
          expandable={{
            expandedRowRender: (record: TCORecord) => {
              const costs = [
                { name: '运费', value: record.freight_cost },
                { name: '检验', value: record.inspection_cost },
                { name: '仓储', value: record.storage_cost },
                { name: '质量损失', value: record.quality_loss_cost },
                { name: '延迟', value: record.delay_cost },
                { name: '管理', value: record.admin_cost },
                { name: '退货', value: record.return_cost },
                { name: '质保', value: record.warranty_cost },
                { name: '机会成本', value: record.opportunity_cost },
              ];
              const pieOption = {
                tooltip: { trigger: 'item' },
                series: [{ type: 'pie', radius: '60%', data: costs.filter(c => c.value > 0), label: { formatter: '{b}: ¥{c}' } }]
              };
              return <Row gutter={16}>
                <Col span={12}><ReactECharts option={pieOption} style={{ height: 200 }} /></Col>
                <Col span={12}>
                  {costs.map(c => <div key={c.name}>{c.name}: ¥{c.value.toFixed(2)}</div>)}
                  <div style={{ fontWeight: 'bold', marginTop: 8 }}>隐性成本合计: ¥{(record.total_tco - record.purchase_price).toFixed(2)}</div>
                </Col>
              </Row>;
            }
          }}
        />
      </Card>

      <Modal title="新建TCO分析" open={modalVisible} onOk={handleSubmit} onCancel={() => { setModalVisible(false); form.resetFields(); }} width={600}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="supplier_id" label="供应商" rules={[{ required: true }]}><Select options={suppliers.map((s: any) => ({ value: s.id, label: s.name }))} placeholder="选择供应商" /></Form.Item></Col>
            <Col span={12}><Form.Item name="material_id" label="物料" rules={[{ required: true }]}><Select options={materials.map((m: any) => ({ value: m.id, label: `${m.code} - ${m.name}` }))} placeholder="选择物料" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="purchase_price" label="采购单价" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} addonAfter="元" /></Form.Item></Col>
            <Col span={12}><Form.Item name="freight_cost" label="运费" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} addonAfter="元" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="inspection_cost" label="检验费" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="storage_cost" label="仓储费" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="quality_loss_cost" label="质量损失" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="delay_cost" label="延迟成本" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="admin_cost" label="管理成本" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="return_cost" label="退货成本" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="warranty_cost" label="质保成本" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="opportunity_cost" label="机会成本" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="remark" label="备注"><div /></Form.Item></Col>
          </Row>
          <Form.Item name="remark" label="备注"><div /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TCO;
