import express from 'express';
import cors from 'cors';
import { initDb, getDb, saveDb } from './database';
import suppliersRouter from './routes/suppliers';
import materialsRouter from './routes/materials';
import ordersRouter from './routes/orders';
import dashboardRouter from './routes/dashboard';
import riskAlertsRouter from './routes/riskAlerts';

const app = express();
const PORT = process.env.PORT || 3456;

app.use(cors());
app.use(express.json());

// 每次写操作后自动保存
app.use((req, res, next) => {
  const originalEnd = res.end.bind(res);
  res.end = function(...args: any[]) {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      try { saveDb(); } catch(e) { console.error('Failed to save db:', e); }
    }
    return originalEnd(...args);
  } as any;
  next();
});

// 挂载路由
app.use('/api/suppliers', suppliersRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/risk-alerts', riskAlertsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.6.0', timestamp: new Date().toISOString() });
});

async function start() {
  await initDb();
  console.log('Database initialized');

  app.listen(PORT, () => {
    console.log(`Flux-SCM Server running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
