import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, message } from 'antd';
import KpiCards from '@/components/dashboard/KpiCards';
import KraljicView from '@/components/supplier/KraljicView';
import PerformanceRadar from '@/components/supplier/PerformanceRadar';
import RiskAlertList from '@/components/dashboard/RiskAlertList';
import CostTrend from '@/components/dashboard/CostTrend';
import { dashboardApi, supplierApi, toCamelCase } from '@/services/api';
import type { Supplier } from '@/types/supplier';
import type { RiskAlert } from '@/types/supplier';

interface DashboardStats {
  supplierCount: number;
  materialCount: number;
  orderCount: number;
  totalAmount: number;
  activeAlerts: number;
  highAlerts: number;
}

interface CostTrendData {
  monthlySpend: { month: string; total_amount: number; order_count: number }[];
  categorySpend: { category: string; total_amount: number; order_count: number }[];
}

const Dashboard: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [costTrendData, setCostTrendData] = useState<{ month: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, suppliersRes, costTrendRes, riskAlertsRes] = await Promise.all([
          dashboardApi.stats(),
          supplierApi.list(),
          dashboardApi.costTrend(),
          dashboardApi.riskAlerts(),
        ]);

        const statsData = toCamelCase(statsRes.data) as DashboardStats;
        setStats(statsData);
        setSuppliers(suppliersRes.data.map(toCamelCase));

        const ctData = toCamelCase(costTrendRes.data) as CostTrendData;
        setCostTrendData(
          (ctData.monthlySpend || []).map((item: any) => ({
            month: item.month,
            amount: item.totalAmount || item.total_amount || 0,
          }))
        );

        const riskData = toCamelCase(riskAlertsRes.data) as { alerts: any[] };
        setAlerts((riskData.alerts || []).map(toCamelCase) as RiskAlert[]);
      } catch (e: any) {
        message.error('获取看板数据失败: ' + e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <KpiCards
        totalPurchase={stats?.totalAmount || 0}
        supplierCount={stats?.supplierCount || 0}
        pendingOrders={stats?.orderCount || 0}
        riskAlerts={stats?.activeAlerts || 0}
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
            <CostTrend data={costTrendData} />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="风险预警" size="small">
            <RiskAlertList alerts={alerts} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
