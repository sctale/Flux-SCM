import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined, ShopOutlined, AppstoreOutlined,
  ShoppingCartOutlined, SettingOutlined, FundOutlined,
  DollarOutlined, TrophyOutlined, ThunderboltOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import useModuleStore from '../../stores/moduleStore';

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderManagement, procurementOptimization } = useModuleStore();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // 构建菜单项
  const menuItems: any[] = [
    { key: '/', icon: <DashboardOutlined />, label: '决策看板' },
    { key: '/suppliers', icon: <ShopOutlined />, label: '供应商管理' },
    { key: '/materials', icon: <AppstoreOutlined />, label: '物料管理' },
    {
      key: 'cost-analysis',
      icon: <FundOutlined />,
      label: '成本分析',
      children: [
        { key: '/cost/tco', icon: <DollarOutlined />, label: 'TCO分析' },
        { key: '/cost/should-cost', icon: <FundOutlined />, label: '应该成本分析' },
        { key: '/cost/scorecards', icon: <TrophyOutlined />, label: '供应商积分卡' },
      ],
    },
  ];

  // 订单管理 - 默认关闭，受设置控制
  if (orderManagement) {
    menuItems.splice(3, 0, { key: '/orders', icon: <ShoppingCartOutlined />, label: '订单管理' });
  }

  // 采购优化 - 受设置控制
  if (procurementOptimization) {
    menuItems.push({
      key: 'procurement',
      icon: <ThunderboltOutlined />,
      label: '采购优化',
      children: [
        { key: '/procurement/optimization', icon: <ThunderboltOutlined />, label: '优化建议' },
        { key: '/procurement/strategy', icon: <CompassOutlined />, label: '采购策略' },
      ],
    });
  }

  menuItems.push({ key: '/settings', icon: <SettingOutlined />, label: '系统设置' });

  // 自动展开当前路径所属的子菜单
  React.useEffect(() => {
    if (location.pathname.startsWith('/cost/')) {
      setOpenKeys(prev => prev.includes('cost-analysis') ? prev : [...prev, 'cost-analysis']);
    }
    if (location.pathname.startsWith('/procurement/')) {
      setOpenKeys(prev => prev.includes('procurement') ? prev : [...prev, 'procurement']);
    }
  }, [location.pathname]);

  return (
    <Sider width={220} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }} theme="dark">
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>Flux-SCM</span>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar;
