import express from 'express';
import cors from 'cors';
import { getDb } from './database';
import suppliersRouter from './routes/suppliers';
import materialsRouter from './routes/materials';
import ordersRouter from './routes/orders';
import dashboardRouter from './routes/dashboard';
import riskAlertsRouter from './routes/riskAlerts';

const app = express();
const PORT = process.env.PORT || 3456;

app.use(cors());
app.use(express.json());

// 初始化数据库
getDb();

// 挂载路由
app.use('/api/suppliers', suppliersRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/risk-alerts', riskAlertsRouter);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.6.0', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Flux-SCM Server running on http://localhost:${PORT}`);
});

export default app;
