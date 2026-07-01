import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Modal, Form, Select, InputNumber, Input, Row, Col, Statistic, Tag, message } from 'antd';
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
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchData = () => { fetch(API).then(r => r.json()).then(setData).catch(() => message.error('加载失败')); };
  const fetchOptions = () => {
    fetch('/api/suppliers').then(r => r.json()).then(setSuppliers);
    fetch('/api/materials').then(r => r.json()).then(setMaterials);
  };
  useEffect(() => { fetchData(); fetchOptions(); }, []);

  // 汇总统计（useMemo缓存避免重复计算）
  const stats = useMemo(() => {
    const totalTco = data.reduce((s, d) => s + d.total_tco, 0);
    const totalPurchase = data.reduce((s, d) => s + d.purchase_price, 0);
    const avgPremium = data.length && totalPurchase ? ((totalTco - totalPurchase) / totalPurchase * 100).toFixed(1) : '0';
    return { totalTco, totalPurchase, avgPremium };
  }, [data]);

  // 采购价 vs TCO 对比柱状图
  const compareBarOption = useMemo(() => ({
    title: { text: '采购价 vs TCO 对比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, data: ['采购价', 'TCO'] },
    xAxis: { type: 'category', data: data.map(d => d.material_name?.substring(0, 6) || '') },
    yAxis: { type: 'value' },
    series: [
      { name: '采购价', type: 'bar', data: data.map(d => d.purchase_price), itemStyle: { color: '#1890ff' } },
      { name: 'TCO', type: 'bar', data: data.map(d => d.total_tco), itemStyle: { color: '#ff4d4f' } },
    ]
  }), [data]);

  // 隐性成本占比饼图
  const hiddenCostOption = useMemo(() => {
    const costs = data.reduce((acc, d) => {
      acc.freight += d.freight_cost; acc.inspection += d.inspection_cost;
      acc.storage += d.storage_cost; acc.quality += d.quality_loss_cost;
      acc.delay += d.delay_cost; acc.admin += d.admin_cost;
      acc.ret += d.return_cost; acc.warranty += d.warranty_cost;
      acc.opportunity += d.opportunity_cost;
      return acc;
    }, { freight: 0, inspection: 0, storage: 0, quality: 0, delay: 0, admin: 0, ret: 0, warranty: 0, opportunity: 0 });
    return {
      title: { text: '隐性成本构成', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie', radius: ['40%', '70%'],
        data: [
          { name: '运费', value: costs.freight },
          { name: '检验', value: costs.inspection },
          { name: '仓储', value: costs.storage },
          { name: '质量损失', value: costs.quality },
          { name: '延迟', value: costs.delay },
          { name: '管理', value: costs.admin },
          { name: '退货', value: costs.ret },
          { name: '质保', value: costs.warranty },
          { name: '机会成本', value: costs.opportunity },
        ].filter(d => d.value > 0),
        label: { formatter: '{b}: {c}' }
      }]
    };
  }, [data]);

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
      message.success('TCO分析已创建');
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (e: any) {
      if (e.errorFields) return; // 表单校验错误，不提示
      message.error(e.message || '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条TCO分析记录吗？此操作不可恢复。',
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
        <Col span={6}><Card><Statistic title="平均TCO溢价" value={stats.avgPremium} suffix="%" valueStyle={{ color: parseFloat(stats.avgPremium) > 15 ? '#ff4d4f' : '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="总TCO" value={stats.totalTco.toFixed(0)} prefix="¥" /></Card></Col>
        <Col span={6}><Card><Statistic title="总采购价" value={stats.totalPurchase.toFixed(0)} prefix="¥" valueStyle={{ color: '#1890ff' }} /></Card></Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}><Card size="small"><ReactECharts option={compareBarOption} style={{ height: 280 }} /></Card></Col>
        <Col span={12}><Card size="small"><ReactECharts option={hiddenCostOption} style={{ height: 280 }} /></Card></Col>
      </Row>

      <Card title="TCO分析明细" size="small" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建分析</Button>}>
        <Table dataSource={data} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
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

      <Modal title="新建TCO分析" open={modalVisible} onOk={handleSubmit} confirmLoading={submitting} onCancel={() => { setModalVisible(false); form.resetFields(); }} width={600}>
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
          </Row>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} placeholder="可选" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TCO;
