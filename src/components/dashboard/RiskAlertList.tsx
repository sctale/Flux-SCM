import React from 'react';
import { List, Tag, Space } from 'antd';
import type { RiskAlert } from '@/types/supplier';
import type { RiskLevel, AlertType } from '@/types/common';

interface RiskAlertListProps {
  alerts: RiskAlert[];
}

const levelMap: Record<RiskLevel, { label: string; color: string }> = {
  high: { label: '高风险', color: 'red' },
  medium: { label: '中风险', color: 'orange' },
  low: { label: '低风险', color: 'blue' },
};

const alertTypeMap: Record<AlertType, string> = {
  cert_expiry: '资质到期',
  delivery_delay: '交付延迟',
  quality_abnormal: '质量异常',
  performance_drop: '绩效下降',
  single_source: '独家供应',
  concentration: '集中度风险',
};

const RiskAlertList: React.FC<RiskAlertListProps> = ({ alerts }) => (
  <List
    size="small"
    dataSource={alerts}
    renderItem={(alert) => (
      <List.Item>
        <List.Item.Meta
          title={
            <Space size={8}>
              <Tag color={levelMap[alert.level].color}>{levelMap[alert.level].label}</Tag>
              <Tag>{alertTypeMap[alert.alertType]}</Tag>
              <span>{alert.title}</span>
            </Space>
          }
          description={alert.description}
        />
      </List.Item>
    )}
  />
);

export default RiskAlertList;
