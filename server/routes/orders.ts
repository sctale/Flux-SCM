import { Router, Request, Response } from 'express';
import { queryAll, queryOne, run } from '../dbHelper';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { status } = req.query;
  let sql = 'SELECT po.*, s.name as supplier_name FROM purchase_orders po LEFT JOIN suppliers s ON po.supplier_id = s.id WHERE 1=1';
  const params: any[] = [];
  if (status) { sql += ' AND po.status = ?'; params.push(status); }
  sql += ' ORDER BY po.created_at DESC';
  const orders = queryAll(sql, params);
  res.json({ data: orders, total: orders.length });
});

router.get('/:id', (req: Request, res: Response) => {
  const order = queryOne('SELECT po.*, s.name as supplier_name FROM purchase_orders po LEFT JOIN suppliers s ON po.supplier_id = s.id WHERE po.id = ?', [req.params.id]);
  if (!order) return res.status(404).json({ error: '未找到订单' });
  const items = queryAll('SELECT oi.*, m.name as material_name, m.code as material_code FROM order_items oi LEFT JOIN materials m ON oi.material_id = m.id WHERE oi.order_id = ?', [req.params.id]);
  res.json({ data: { ...order, items } });
});

router.post('/', (req: Request, res: Response) => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const b = req.body;
  run(`INSERT INTO purchase_orders (id, order_no, supplier_id, title, status, total_amount, order_date, expected_date, payment_term, remark, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, b.orderNo, b.supplierId, b.title || null, b.status || 'draft', b.totalAmount || 0, b.orderDate || null, b.expectedDate || null, b.paymentTerm || null, b.remark || null, b.createdBy || null, now, now]);
  const order = queryOne('SELECT * FROM purchase_orders WHERE id = ?', [id]);
  res.status(201).json({ data: order });
});

router.put('/:id', (req: Request, res: Response) => {
  const now = new Date().toISOString();
  const b = req.body;
  if (b.status) {
    run('UPDATE purchase_orders SET status=?, updated_at=? WHERE id=?', [b.status, now, req.params.id]);
  } else {
    run(`UPDATE purchase_orders SET title=?, total_amount=?, expected_date=?, payment_term=?, remark=?, updated_at=? WHERE id=?`,
      [b.title || null, b.totalAmount || 0, b.expectedDate || null, b.paymentTerm || null, b.remark || null, now, req.params.id]);
  }
  const order = queryOne('SELECT * FROM purchase_orders WHERE id = ?', [req.params.id]);
  res.json({ data: order });
});

router.delete('/:id', (req: Request, res: Response) => {
  run('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
  run('DELETE FROM deliveries WHERE order_id = ?', [req.params.id]);
  run('DELETE FROM purchase_orders WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

export default router;
