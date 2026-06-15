import { Router, Request, Response } from 'express';
import { queryAll, queryOne, run } from '../dbHelper';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const alerts = queryAll("SELECT ra.*, s.name as supplier_name FROM risk_alerts ra LEFT JOIN suppliers s ON ra.supplier_id = s.id ORDER BY CASE WHEN ra.level = 'high' THEN 1 WHEN ra.level = 'medium' THEN 2 ELSE 3 END, ra.created_at DESC");
  res.json({ data: alerts, total: alerts.length });
});

router.put('/:id/acknowledge', (req: Request, res: Response) => {
  run("UPDATE risk_alerts SET status = 'acknowledged' WHERE id = ?", [req.params.id]);
  const alert = queryOne('SELECT * FROM risk_alerts WHERE id = ?', [req.params.id]);
  res.json({ data: alert });
});

router.put('/:id/resolve', (req: Request, res: Response) => {
  const now = new Date().toISOString();
  run("UPDATE risk_alerts SET status = 'resolved', resolved_at = ? WHERE id = ?", [now, req.params.id]);
  const alert = queryOne('SELECT * FROM risk_alerts WHERE id = ?', [req.params.id]);
  res.json({ data: alert });
});

export default router;
