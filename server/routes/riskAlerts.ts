import { Router, Request, Response } from 'express';
import { getDb } from '../database';

const router = Router();

// GET /api/risk-alerts
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { level, type, status } = req.query;

  let sql = `
    SELECT ra.*, s.name as supplier_name, s.short_name as supplier_short_name
    FROM risk_alerts ra
    LEFT JOIN suppliers s ON ra.supplier_id = s.id
    WHERE 1=1`;
  const params: any[] = [];

  if (level) { sql += ' AND ra.level = ?'; params.push(level); }
  if (type) { sql += ' AND ra.alert_type = ?'; params.push(type); }
  if (status) { sql += ' AND ra.status = ?'; params.push(status); }

  sql += ' ORDER BY ra.created_at DESC';

  const alerts = db.prepare(sql).all(...params);
  res.json({ data: alerts, total: alerts.length });
});

// PUT /api/risk-alerts/:id/acknowledge
router.put('/:id/acknowledge', (req: Request, res: Response) => {
  const db = getDb();

  const alert = db.prepare('SELECT * FROM risk_alerts WHERE id = ?').get(req.params.id);
  if (!alert) return res.status(404).json({ error: '未找到预警' });

  db.prepare("UPDATE risk_alerts SET status = 'acknowledged' WHERE id = ?").run(req.params.id);

  const updated = db.prepare('SELECT * FROM risk_alerts WHERE id = ?').get(req.params.id);
  res.json({ data: updated });
});

// PUT /api/risk-alerts/:id/resolve
router.put('/:id/resolve', (req: Request, res: Response) => {
  const db = getDb();
  const now = new Date().toISOString();

  const alert = db.prepare('SELECT * FROM risk_alerts WHERE id = ?').get(req.params.id);
  if (!alert) return res.status(404).json({ error: '未找到预警' });

  db.prepare("UPDATE risk_alerts SET status = 'resolved', resolved_at = ? WHERE id = ?").run(now, req.params.id);

  const updated = db.prepare('SELECT * FROM risk_alerts WHERE id = ?').get(req.params.id);
  res.json({ data: updated });
});

export default router;
