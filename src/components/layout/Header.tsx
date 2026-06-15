import React from 'react';
import { Layout, Input, Avatar, Space, Badge } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;

const AppHeader: React.FC = () => (
  <AntHeader style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', height: 56, lineHeight: '56px' }}>
    <div style={{ flex: 1, maxWidth: 400 }}>
      <Input placeholder="搜索供应商、物料、订单..." prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} style={{ borderRadius: 6 }} allowClear />
    </div>
    <Space size={20}>
      <Badge count={3} size="small"><BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} /></Badge>
      <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677FF' }} />
    </Space>
  </AntHeader>
);

export default AppHeader;
