import React from 'react';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, ShopOutlined, AppstoreOutlined, ShoppingCartOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '决策看板' },
  { key: '/suppliers', icon: <ShopOutlined />, label: '供应商管理' },
  { key: '/materials', icon: <AppstoreOutlined />, label: '物料管理' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '采购管理' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Sider width={220} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }} theme="dark">
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>Flux-SCM</span>
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} style={{ borderRight: 0 }} />
    </Sider>
  );
};

export default Sidebar;
