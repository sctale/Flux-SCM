import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { DollarOutlined, ShopOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';

interface KpiCardsProps {
  totalPurchase: number;
  supplierCount: number;
  pendingOrders: number;
  riskAlerts: number;
}

const KpiCards: React.FC<KpiCardsProps> = ({ totalPurchase, supplierCount, pendingOrders, riskAlerts }) => (
  <Row gutter={16}>
    <Col span={6}>
      <Card size="small">
        <Statistic title="采购总额" value={totalPurchase} precision={0} valueStyle={{ color: '#1677FF' }} prefix={<DollarOutlined />} />
      </Card>
    </Col>
    <Col span={6}>
      <Card size="small">
        <Statistic title="供应商数量" value={supplierCount} prefix={<ShopOutlined />} valueStyle={{ color: '#52C41A' }} />
      </Card>
    </Col>
    <Col span={6}>
      <Card size="small">
        <Statistic title="待处理订单" value={pendingOrders} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#FAAD14' }} />
      </Card>
    </Col>
    <Col span={6}>
      <Card size="small">
        <Statistic title="风险预警" value={riskAlerts} prefix={<WarningOutlined />} valueStyle={{ color: '#FF4D4F' }} />
      </Card>
    </Col>
  </Row>
);

export default KpiCards;
