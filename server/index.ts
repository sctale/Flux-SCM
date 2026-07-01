import express from 'express';
import cors from 'cors';
import { initDb, getDb, saveDb } from './database';
import suppliersRouter from './routes/suppliers';
import materialsRouter from './routes/materials';
import ordersRouter from './routes/orders';
import dashboardRouter from './routes/dashboard';
import riskAlertsRouter from './routes/riskAlerts';
import scorecardsRouter from './routes/scorecards';
import tcoRouter from './routes/tco';
import shouldCostRouter from './routes/shouldCost';
import consolidationRouter from './routes/consolidation';
import moqConflictsRouter from './routes/moqConflicts';
import alternativesRouter from './routes/alternatives';
import safetyStockRouter from './routes/safetyStock';
import concentrationRouter from './routes/concentration';
import procurementStrategyRouter from './routes/procurementStrategy';
import supplierMaterialMatrixRouter from './routes/supplierMaterialMatrix';

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
app.use('/api/scorecards', scorecardsRouter);
app.use('/api/tco', tcoRouter);
app.use('/api/should-cost', shouldCostRouter);
app.use('/api/consolidation', consolidationRouter);
app.use('/api/moq-conflicts', moqConflictsRouter);
app.use('/api/alternatives', alternativesRouter);
app.use('/api/safety-stock', safetyStockRouter);
app.use('/api/concentration', concentrationRouter);
app.use('/api/procurement-strategy', procurementStrategyRouter);
app.use('/api/supplier-material-matrix', supplierMaterialMatrixRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.7.7', timestamp: new Date().toISOString() });
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
