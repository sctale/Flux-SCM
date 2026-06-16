import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Row, Col, Statistic, message } from 'antd';
import { AimOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const ProcurementStrategy: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/procurement-strategy').then(r => r.json()).then(setData).catch(() => message.error('加载策略失败'));
  }, []);

  const highCount = data.filter(d => d.priority === 'high').length;
  const mediumCount = data.filter(d => d.priority === 'medium').length;
  const lowCount = data.filter(d => d.priority === 'low').length;

  // 象限分布饼图
  const quadrantPieOption = {
    title: { text: '卡拉杰克象限分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['40%', '70%'],
      data: [
        { name: '战略型', value: data.filter(d => d.quadrant === 'strategic').length, itemStyle: { color: '#ff4d4f' } },
        { name: '杠杆型', value: data.filter(d => d.quadrant === 'leverage').length, itemStyle: { color: '#1890ff' } },
        { name: '瓶颈型', value: data.filter(d => d.quadrant === 'bottleneck').length, itemStyle: { color: '#faad14' } },
        { name: '非关键型', value: data.filter(d => d.quadrant === 'non_critical').length, itemStyle: { color: '#52c41a' } },
      ].filter(d => d.value > 0),
      label: { formatter: '{b}: {c}' }
    }]
  };

  const priorityColor = (p: string) => p === 'high' ? 'red' : p === 'medium' ? 'orange' : 'green';
  const quadrantColor = (q: string) => q === 'strategic' ? 'red' : q === 'leverage' ? 'blue' : q === 'bottleneck' ? 'orange' : 'green';

  const columns = [
    { title: '供应商', dataIndex: 'supplier_name', key: 's' },
    { title: '象限', dataIndex: 'quadrant_name', key: 'qn', render: (v: string, r: any) => <Tag color={quadrantColor(r.quadrant)}>{v}</Tag> },
    { title: '策略', dataIndex: 'strategy', key: 'st' },
    { title: '优先级', dataIndex: 'priority', key: 'p', render: (v: string) => <Tag color={priorityColor(v)}>{v === 'high' ? '高' : v === 'medium' ? '中' : '低'}</Tag> },
    { title: '综合评分', dataIndex: 'overall_score', key: 'os', render: (v: number) => v?.toFixed(1) || '-' },
    { title: '采购额', dataIndex: 'total_purchase', key: 'tp', render: (v: number) => v ? `¥${v.toLocaleString()}` : '-' },
    {
      title: '行动建议', dataIndex: 'actions', key: 'a',
      render: (actions: string[]) => actions?.map((a, i) => <div key={i} style={{ fontSize: 12 }}>• {a}</div>)
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="策略总数" value={data.length} prefix={<AimOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="高优先级" value={highCount} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="中优先级" value={mediumCount} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="低优先级" value={lowCount} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}><Card size="small"><ReactECharts option={quadrantPieOption} style={{ height: 250 }} /></Card></Col>
        <Col span={16}>
          <Card size="small" title="策略建议汇总">
            {data.map((d, i) => (
              <div key={i} style={{ marginBottom: 8, padding: '8px 12px', background: '#fafafa', borderRadius: 4 }}>
                <strong>{d.supplier_name}</strong> <Tag color={quadrantColor(d.quadrant)}>{d.quadrant_name}</Tag>
                <span style={{ color: '#666' }}> → {d.strategy}</span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Card title="采购策略明细" size="small">
        <Table dataSource={data} columns={columns} rowKey="supplier_id" size="small" pagination={false} />
      </Card>
    </div>
  );
};

export default ProcurementStrategy;
