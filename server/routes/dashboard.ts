import { Router, Request, Response } from 'express';
import { getDb } from '../database';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', (req: Request, res: Response) => {
  const db = getDb();

  const supplierCount = (db.prepare('SELECT COUNT(*) as c FROM suppliers WHERE status = ?').get('active') as any).c;
  const materialCount = (db.prepare('SELECT COUNT(*) as c FROM materials').get() as any).c;
  const orderCount = (db.prepare('SELECT COUNT(*) as c FROM purchase_orders').get() as any).c;
  const totalAmount = (db.prepare('SELECT COALESCE(SUM(total_amount), 0) as t FROM purchase_orders').get() as any).t;

  const activeAlerts = (db.prepare("SELECT COUNT(*) as c FROM risk_alerts WHERE status = 'active'").get() as any).c;
  const highAlerts = (db.prepare("SELECT COUNT(*) as c FROM risk_alerts WHERE status = 'active' AND level = 'high'").get() as any).c;

  const ordersByStatus = db.prepare('SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as amount FROM purchase_orders GROUP BY status').all();

  const suppliersByGrade = db.prepare('SELECT performance_grade, COUNT(*) as count FROM suppliers WHERE status = ? GROUP BY performance_grade').all('active');

  const suppliersByQuadrant = db.prepare('SELECT kraljic_quadrant, COUNT(*) as count FROM suppliers WHERE status = ? GROUP BY kraljic_quadrant').all('active');

  const materialsByAbc = db.prepare('SELECT abc_class, COUNT(*) as count, COALESCE(SUM(annual_consumption_value), 0) as total_value FROM materials GROUP BY abc_class').all();

  const topSuppliersByAmount = db.prepare(`
    SELECT s.id, s.name, s.short_name, s.performance_grade, s.overall_score, COALESCE(SUM(po.total_amount), 0) as total_purchase_amount
    FROM suppliers s
    LEFT JOIN purchase_orders po ON s.id = po.supplier_id
    WHERE s.status = 'active'
    GROUP BY s.id
    ORDER BY total_purchase_amount DESC
    LIMIT 5
  `).all();

  res.json({
    data: {
      supplierCount,
      materialCount,
      orderCount,
      totalAmount,
      activeAlerts,
      highAlerts,
      ordersByStatus,
      suppliersByGrade,
      suppliersByQuadrant,
      materialsByAbc,
      topSuppliersByAmount,
    }
  });
});

// GET /api/dashboard/cost-trend
router.get('/cost-trend', (req: Request, res: Response) => {
  const db = getDb();

  const monthlySpend = db.prepare(`
    SELECT
      strftime('%Y-%m', order_date) as month,
      COUNT(*) as order_count,
      COALESCE(SUM(total_amount), 0) as total_amount
    FROM purchase_orders
    WHERE order_date IS NOT NULL
    GROUP BY strftime('%Y-%m', order_date)
    ORDER BY month
  `).all();

  const categorySpend = db.prepare(`
    SELECT
      s.category,
      COALESCE(SUM(po.total_amount), 0) as total_amount,
      COUNT(*) as order_count
    FROM purchase_orders po
    LEFT JOIN suppliers s ON po.supplier_id = s.id
    GROUP BY s.category
    ORDER BY total_amount DESC
  `).all();

  res.json({
    data: {
      monthlySpend,
      categorySpend,
    }
  });
});

// GET /api/dashboard/risk-alerts
router.get('/risk-alerts', (req: Request, res: Response) => {
  const db = getDb();

  const alerts = db.prepare(`
    SELECT ra.*, s.name as supplier_name, s.short_name as supplier_short_name
    FROM risk_alerts ra
    LEFT JOIN suppliers s ON ra.supplier_id = s.id
    WHERE ra.status = 'active'
    ORDER BY
      CASE ra.level
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
      END,
      ra.created_at DESC
  `).all();

  const alertsByType = db.prepare(`
    SELECT alert_type, COUNT(*) as count
    FROM risk_alerts
    WHERE status = 'active'
    GROUP BY alert_type
  `).all();

  const alertsByLevel = db.prepare(`
    SELECT level, COUNT(*) as count
    FROM risk_alerts
    WHERE status = 'active'
    GROUP BY level
  `).all();

  res.json({
    data: {
      alerts,
      alertsByType,
      alertsByLevel,
    }
  });
});

export default router;
