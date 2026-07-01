import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spin, message } from 'antd';
import KpiCards from '@/components/dashboard/KpiCards';
import KraljicView from '@/components/supplier/KraljicView';
import PerformanceRadar from '@/components/supplier/PerformanceRadar';
import RiskAlertList from '@/components/dashboard/RiskAlertList';
import CostTrend from '@/components/dashboard/CostTrend';
import type { Supplier } from '@/types/supplier';
import type { RiskAlert } from '@/types/supplier';

interface KpiStats {
  supplierCount: number;
  pendingOrders: number;
  totalAmount: number;
  riskCount: number;
}

const defaultStats: KpiStats = {
  supplierCount: 0,
  pendingOrders: 0,
  totalAmount: 0,
  riskCount: 0,
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<KpiStats>(defaultStats);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [costTrend, setCostTrend] = useState<{ month: string; amount: number }[]>([]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, supplierRes, alertRes, trendRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/suppliers'),
        fetch('/api/risk-alerts'),
        fetch('/api/dashboard/cost-trend'),
      ]);

      const statsJson = await statsRes.json();
      const supplierJson = await supplierRes.json();
      const alertJson = await alertRes.json();
      const trendJson = await trendRes.json();

      setStats(statsJson.data || defaultStats);
      setSuppliers((supplierJson.data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        shortName: s.short_name,
        unifiedCode: s.unified_code,
        category: s.category,
        kraljicQuadrant: s.kraljic_quadrant,
        profitImpactScore: s.profit_impact_score ?? 0,
        supplyRiskScore: s.supply_risk_score ?? 0,
        performanceGrade: s.performance_grade,
        overallScore: s.overall_score ?? 0,
        qualityScore: s.quality_score ?? 0,
        costScore: s.cost_score ?? 0,
        deliveryScore: s.delivery_score ?? 0,
        serviceScore: s.service_score ?? 0,
        status: s.status,
        address: s.address,
        contactPerson: s.contact_person,
        contactPhone: s.contact_phone,
        contactEmail: s.contact_email,
        bankName: s.bank_name,
        bankAccount: s.bank_account,
        remark: s.remark,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      })));
      setAlerts((alertJson.data || []).map((a: any) => ({
        id: a.id,
        supplierId: a.supplier_id,
        alertType: a.alert_type,
        level: a.level,
        title: a.title,
        description: a.description,
        status: a.status,
        createdAt: a.created_at,
      })));
      setCostTrend(trendJson.data || []);
    } catch (e) {
      console.error('加载仪表盘数据失败', e);
      message.error('仪表盘数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <Spin spinning={loading} tip="数据加载中...">
      <div>
        <KpiCards
          totalPurchase={stats.totalAmount}
          supplierCount={stats.supplierCount}
          pendingOrders={stats.pendingOrders}
          riskAlerts={stats.riskCount}
        />
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={14}>
            <Card title="卡拉杰克矩阵" size="small">
              <KraljicView suppliers={suppliers} />
            </Card>
          </Col>
          <Col span={10}>
            <Card title="供应商绩效对比 (QCDS)" size="small">
              <PerformanceRadar suppliers={suppliers} />
            </Card>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={14}>
            <Card title="采购成本趋势" size="small">
              <CostTrend data={costTrend.length ? costTrend : undefined} />
            </Card>
          </Col>
          <Col span={10}>
            <Card title="风险预警" size="small">
              <RiskAlertList alerts={alerts} />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default Dashboard;
