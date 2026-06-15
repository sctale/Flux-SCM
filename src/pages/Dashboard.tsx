import React from 'react';
import { Row, Col, Card } from 'antd';
import KpiCards from '@/components/dashboard/KpiCards';
import KraljicView from '@/components/supplier/KraljicView';
import PerformanceRadar from '@/components/supplier/PerformanceRadar';
import RiskAlertList from '@/components/dashboard/RiskAlertList';
import CostTrend from '@/components/dashboard/CostTrend';
import type { Supplier } from '@/types/supplier';
import type { RiskAlert } from '@/types/supplier';

const mockSuppliers: Supplier[] = [
  {
    id: '1', name: '华信精密科技有限公司', shortName: '华信精密', category: '零部件',
    kraljicQuadrant: 'strategic', profitImpactScore: 78, supplyRiskScore: 72,
    performanceGrade: 'A', overallScore: 92, qualityScore: 95, costScore: 88, deliveryScore: 93, serviceScore: 90,
    status: 'active', contactPerson: '张伟', contactPhone: '13800138001',
    createdAt: '2024-01-15', updatedAt: '2025-06-01',
  },
  {
    id: '2', name: '东方钢铁集团', shortName: '东方钢铁', category: '原材料',
    kraljicQuadrant: 'leverage', profitImpactScore: 65, supplyRiskScore: 35,
    performanceGrade: 'B', overallScore: 82, qualityScore: 85, costScore: 80, deliveryScore: 82, serviceScore: 78,
    status: 'active', contactPerson: '李明', contactPhone: '13800138002',
    createdAt: '2024-03-20', updatedAt: '2025-05-28',
  },
  {
    id: '3', name: '瑞德电子科技', shortName: '瑞德电子', category: '零部件',
    kraljicQuadrant: 'bottleneck', profitImpactScore: 42, supplyRiskScore: 68,
    performanceGrade: 'C', overallScore: 74, qualityScore: 78, costScore: 70, deliveryScore: 72, serviceScore: 75,
    status: 'trial', contactPerson: '王芳', contactPhone: '13800138003',
    createdAt: '2024-06-10', updatedAt: '2025-06-05',
  },
  {
    id: '4', name: '鑫达包装材料厂', shortName: '鑫达包装', category: '包装材料',
    kraljicQuadrant: 'non_critical', profitImpactScore: 25, supplyRiskScore: 20,
    performanceGrade: 'B', overallScore: 85, qualityScore: 88, costScore: 82, deliveryScore: 86, serviceScore: 83,
    status: 'active', contactPerson: '赵刚', contactPhone: '13800138004',
    createdAt: '2024-08-05', updatedAt: '2025-05-30',
  },
];

const mockAlerts: RiskAlert[] = [
  {
    id: '1', supplierId: '3', alertType: 'delivery_delay', level: 'high',
    title: '瑞德电子交付延迟预警', description: '近3次交付均延迟2天以上，建议关注交付能力',
    status: 'active', createdAt: '2025-06-10',
  },
  {
    id: '2', supplierId: '1', alertType: 'cert_expiry', level: 'medium',
    title: '华信精密ISO认证即将到期', description: 'ISO 9001认证将于2025年8月到期，需提醒续期',
    status: 'active', createdAt: '2025-06-08',
  },
  {
    id: '3', supplierId: '2', alertType: 'single_source', level: 'low',
    title: '东方钢铁为特种钢材独家供应商', description: '建议开发备选供应商降低供应风险',
    status: 'active', createdAt: '2025-06-05',
  },
];

const Dashboard: React.FC = () => (
  <div>
    <KpiCards totalPurchase={18470000} supplierCount={48} pendingOrders={12} riskAlerts={3} />
    <Row gutter={16} style={{ marginTop: 16 }}>
      <Col span={14}>
        <Card title="卡拉杰克矩阵" size="small">
          <KraljicView suppliers={mockSuppliers} />
        </Card>
      </Col>
      <Col span={10}>
        <Card title="供应商绩效对比 (QCDS)" size="small">
          <PerformanceRadar suppliers={mockSuppliers} />
        </Card>
      </Col>
    </Row>
    <Row gutter={16} style={{ marginTop: 16 }}>
      <Col span={14}>
        <Card title="采购成本趋势" size="small">
          <CostTrend />
        </Card>
      </Col>
      <Col span={10}>
        <Card title="风险预警" size="small">
          <RiskAlertList alerts={mockAlerts} />
        </Card>
      </Col>
    </Row>
  </div>
);

export default Dashboard;
