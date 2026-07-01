import React from 'react';
import { Card, Tabs, Form, Input, Select, InputNumber, Button, Slider, Space, Switch, message, Row, Col } from 'antd';
import useModuleStore from '../stores/moduleStore';

const Settings: React.FC = () => (
  <Card>
    <Tabs
      defaultActiveKey="basic"
      items={[
        {
          key: 'basic',
          label: '基本设置',
          children: <BasicSettings />,
        },
        {
          key: 'modules',
          label: '模块管理',
          children: <ModuleSettings />,
        },
        {
          key: 'scoring',
          label: '评分权重',
          children: <ScoringSettings />,
        },
        {
          key: 'data',
          label: '数据管理',
          children: <DataManagement />,
        },
      ]}
    />
  </Card>
);

const ModuleSettings: React.FC = () => {
  const { orderManagement, procurementOptimization, toggleModule } = useModuleStore();

  return (
    <div style={{ maxWidth: 600 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card size="small" title="功能模块开关" styles={{ body: { padding: 16 } }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>订单管理</div>
                  <div style={{ fontSize: 12, color: '#888' }}>管理采购订单、交付跟踪等（选装模块，默认关闭）</div>
                </div>
                <Switch checked={orderManagement} onChange={() => toggleModule('orderManagement')} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>采购优化</div>
                  <div style={{ fontSize: 12, color: '#888' }}>合并建议、MOQ冲突、替代物料、安全库存、集中度分析</div>
                </div>
                <Switch checked={procurementOptimization} onChange={() => toggleModule('procurementOptimization')} />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const BasicSettings: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = () => {
    form.validateFields().then(() => {
      message.success('设置已保存');
    });
  };

  return (
    <Form form={form} layout="vertical" style={{ maxWidth: 600 }}
      initialValues={{ companyName: 'Flux-SCM 供应链管理', currency: 'CNY', autoBackup: true, backupInterval: 24 }}>
      <Form.Item name="companyName" label="公司名称" rules={[{ required: true }]}>
        <Input placeholder="请输入公司名称" />
      </Form.Item>
      <Form.Item name="currency" label="默认币种">
        <Select options={[
          { value: 'CNY', label: '人民币 (CNY)' },
          { value: 'USD', label: '美元 (USD)' },
          { value: 'EUR', label: '欧元 (EUR)' },
        ]} />
      </Form.Item>
      <Form.Item name="autoBackup" label="自动备份">
        <Select options={[
          { value: true, label: '开启' },
          { value: false, label: '关闭' },
        ]} />
      </Form.Item>
      <Form.Item name="backupInterval" label="备份间隔(小时)">
        <InputNumber min={1} max={168} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" onClick={handleSave}>保存设置</Button>
      </Form.Item>
    </Form>
  );
};

const ScoringSettings: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = () => {
    form.validateFields().then((values) => {
      // 滑块输入是百分比(0-100)，权重总和必须为100%
      const total = values.quality + values.cost + values.delivery + values.service;
      if (total !== 100) {
        message.error(`权重总和必须为100%，当前为${total}%`);
        return;
      }
      message.success('评分权重已保存');
    });
  };

  return (
    <Form form={form} layout="vertical" style={{ maxWidth: 600 }}
      initialValues={{ quality: 30, cost: 25, delivery: 30, service: 15 }}>
      <Form.Item name="quality" label="质量权重 (%)" rules={[{ required: true }]}>
        <Slider min={0} max={100} marks={{ 0: '0%', 30: '30%', 50: '50%', 100: '100%' }} />
      </Form.Item>
      <Form.Item name="cost" label="成本权重 (%)" rules={[{ required: true }]}>
        <Slider min={0} max={100} marks={{ 0: '0%', 25: '25%', 50: '50%', 100: '100%' }} />
      </Form.Item>
      <Form.Item name="delivery" label="交付权重 (%)" rules={[{ required: true }]}>
        <Slider min={0} max={100} marks={{ 0: '0%', 30: '30%', 50: '50%', 100: '100%' }} />
      </Form.Item>
      <Form.Item name="service" label="服务权重 (%)" rules={[{ required: true }]}>
        <Slider min={0} max={100} marks={{ 0: '0%', 15: '15%', 50: '50%', 100: '100%' }} />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" onClick={handleSave}>保存权重</Button>
          <Button onClick={() => form.resetFields()}>恢复默认</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

const DataManagement: React.FC = () => (
  <div style={{ maxWidth: 600 }}>
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Card size="small" title="数据导出" styles={{ body: { padding: 16 } }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block>导出供应商数据</Button>
            <Button block>导出物料数据</Button>
            <Button block>导出订单数据</Button>
            <Button block type="primary">导出全部数据</Button>
          </Space>
        </Card>
      </Col>
      <Col span={12}>
        <Card size="small" title="数据导入" styles={{ body: { padding: 16 } }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block>导入供应商数据</Button>
            <Button block>导入物料数据</Button>
            <Button block>导入订单数据</Button>
            <Button block danger>清空全部数据</Button>
          </Space>
        </Card>
      </Col>
    </Row>
  </div>
);

export default Settings;
