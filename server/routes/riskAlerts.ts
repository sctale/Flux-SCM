import { Router, Request, Response } from 'express';
import { queryAll, queryOne, run } from '../dbHelper';

const router = Router();

// 统一错误处理包装器
const asyncHandler = (fn: (req: Request, res: Response) => void) => (req: Request, res: Response) => {
  try {
    fn(req, res);
  } catch (e: any) {
    console.error('[riskAlerts] 错误:', e.message);
    res.status(500).json({ error: '服务器内部错误', detail: e.message });
  }
};

router.get('/', asyncHandler((req, res) => {
  const alerts = queryAll("SELECT ra.*, s.name as supplier_name FROM risk_alerts ra LEFT JOIN suppliers s ON ra.supplier_id = s.id ORDER BY CASE WHEN ra.level = 'high' THEN 1 WHEN ra.level = 'medium' THEN 2 ELSE 3 END, ra.created_at DESC");
  res.json({ data: alerts, total: alerts.length });
}));

router.put('/:id/acknowledge', asyncHandler((req, res) => {
  const exists = queryOne('SELECT id FROM risk_alerts WHERE id = ?', [req.params.id]);
  if (!exists) return res.status(404).json({ error: '未找到风险预警' });
  run("UPDATE risk_alerts SET status = 'acknowledged' WHERE id = ?", [req.params.id]);
  const alert = queryOne('SELECT * FROM risk_alerts WHERE id = ?', [req.params.id]);
  res.json({ data: alert });
}));

router.put('/:id/resolve', asyncHandler((req, res) => {
  const exists = queryOne('SELECT id FROM risk_alerts WHERE id = ?', [req.params.id]);
  if (!exists) return res.status(404).json({ error: '未找到风险预警' });
  const now = new Date().toISOString();
  run("UPDATE risk_alerts SET status = 'resolved', resolved_at = ? WHERE id = ?", [now, req.params.id]);
  const alert = queryOne('SELECT * FROM risk_alerts WHERE id = ?', [req.params.id]);
  res.json({ data: alert });
}));

export default router;
