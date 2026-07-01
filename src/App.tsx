import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import Materials from './pages/Materials';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import TCO from './pages/TCO';
import ShouldCost from './pages/ShouldCost';
import Scorecards from './pages/Scorecards';
import ProcurementOptimization from './pages/ProcurementOptimization';
import ProcurementStrategy from './pages/ProcurementStrategy';

const NotFound: React.FC = () => (
  <Result
    status="404"
    title="404"
    subTitle="抱歉，您访问的页面不存在。"
    extra={<Button type="primary" onClick={() => window.location.hash = '#/'}>返回首页</Button>}
  />
);

const App: React.FC = () => (
  <HashRouter>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/cost/tco" element={<TCO />} />
        <Route path="/cost/should-cost" element={<ShouldCost />} />
        <Route path="/cost/scorecards" element={<Scorecards />} />
        <Route path="/procurement/optimization" element={<ProcurementOptimization />} />
        <Route path="/procurement/strategy" element={<ProcurementStrategy />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </HashRouter>
);

export default App;
