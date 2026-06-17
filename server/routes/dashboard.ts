import { Router, Request, Response } from 'express';
import { queryAll, queryOne } from '../dbHelper';

const router = Router();

// 统一错误处理包装器
const asyncHandler = (fn: (req: Request, res: Response) => void) => (req: Request, res: Response) => {
  try {
    fn(req, res);
  } catch (e: any) {
    console.error('[dashboard] 错误:', e.message);
    res.status(500).json({ error: '服务器内部错误', detail: e.message });
  }
};

router.get('/stats', asyncHandler((req, res) => {
  const supplierCount = (queryOne('SELECT COUNT(*) as c FROM suppliers') as any)?.c || 0;
  const activeSupplierCount = (queryOne("SELECT COUNT(*) as c FROM suppliers WHERE status = 'active'") as any)?.c || 0;
  const orderCount = (queryOne('SELECT COUNT(*) as c FROM purchase_orders') as any)?.c || 0;
  const pendingOrders = (queryOne("SELECT COUNT(*) as c FROM purchase_orders WHERE status IN ('draft', 'submitted', 'confirmed')") as any)?.c || 0;
  const totalAmount = (queryOne('SELECT COALESCE(SUM(total_amount), 0) as a FROM purchase_orders') as any)?.a || 0;
  const riskCount = (queryOne("SELECT COUNT(*) as c FROM risk_alerts WHERE status = 'active'") as any)?.c || 0;

  res.json({ data: { supplierCount, activeSupplierCount, orderCount, pendingOrders, totalAmount, riskCount } });
}));

router.get('/cost-trend', asyncHandler((req, res) => {
  const data = queryAll("SELECT strftime('%Y-%m', order_date) as month, SUM(total_amount) as amount FROM purchase_orders WHERE order_date IS NOT NULL GROUP BY strftime('%Y-%m', order_date) ORDER BY month");
  res.json({ data });
}));

export default router;
