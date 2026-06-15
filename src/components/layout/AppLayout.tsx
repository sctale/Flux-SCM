import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppHeader from './Header';

const AppLayout: React.FC = () => (
  <Layout style={{ minHeight: '100vh' }}>
    <Sidebar />
    <Layout style={{ marginLeft: 220 }}>
      <AppHeader />
      <Layout.Content style={{ margin: 16, padding: 24, background: '#fff', borderRadius: 8, overflow: 'auto', minHeight: 'calc(100vh - 56px - 32px)' }}>
        <Outlet />
      </Layout.Content>
    </Layout>
  </Layout>
);

export default AppLayout;
