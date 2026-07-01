import { Router, Request, Response } from 'express';
import { queryAll, queryOne, run } from '../dbHelper';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 统一错误处理包装器
const asyncHandler = (fn: (req: Request, res: Response) => void) => (req: Request, res: Response) => {
  try {
    fn(req, res);
  } catch (e: any) {
    console.error('[orders] 错误:', e.message);
    res.status(500).json({ error: '服务器内部错误', detail: e.message });
  }
};

// 订单状态流转白名单（状态机）
const statusTransitions: Record<string, string[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['confirmed', 'cancelled'],
  confirmed: ['partial_delivered', 'delivered', 'cancelled'],
  partial_delivered: ['delivered', 'cancelled'],
  delivered: ['closed'],
  closed: [],
  cancelled: [],
};

router.get('/', asyncHandler((req, res) => {
  const { status } = req.query;
  let sql = 'SELECT po.*, s.name as supplier_name FROM purchase_orders po LEFT JOIN suppliers s ON po.supplier_id = s.id WHERE 1=1';
  const params: any[] = [];
  if (status) { sql += ' AND po.status = ?'; params.push(status); }
  sql += ' ORDER BY po.created_at DESC';
  const orders = queryAll(sql, params);
  res.json({ data: orders, total: orders.length });
}));

router.get('/:id', asyncHandler((req, res) => {
  const order = queryOne('SELECT po.*, s.name as supplier_name FROM purchase_orders po LEFT JOIN suppliers s ON po.supplier_id = s.id WHERE po.id = ?', [req.params.id]);
  if (!order) return res.status(404).json({ error: '未找到订单' });
  const items = queryAll('SELECT oi.*, m.name as material_name, m.code as material_code FROM order_items oi LEFT JOIN materials m ON oi.material_id = m.id WHERE oi.order_id = ?', [req.params.id]);
  res.json({ data: { ...order, items } });
}));

router.post('/', asyncHandler((req, res) => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const b = req.body;
  // 参数校验
  if (!b.orderNo) return res.status(400).json({ error: '订单编号不能为空' });
  if (!b.supplierId) return res.status(400).json({ error: '供应商不能为空' });
  const supplier = queryOne('SELECT id FROM suppliers WHERE id = ?', [b.supplierId]);
  if (!supplier) return res.status(400).json({ error: '供应商不存在' });

  run(`INSERT INTO purchase_orders (id, order_no, supplier_id, title, status, total_amount, order_date, expected_date, payment_term, remark, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, b.orderNo, b.supplierId, b.title || null, b.status || 'draft', b.totalAmount || 0, b.orderDate || null, b.expectedDate || null, b.paymentTerm || null, b.remark || null, b.createdBy || null, now, now]);

  // 创建物料明细
  if (b.items && Array.isArray(b.items) && b.items.length > 0) {
    for (const item of b.items) {
      if (!item.materialId || !item.quantity || item.quantity <= 0) continue;
      const material = queryOne('SELECT id FROM materials WHERE id = ?', [item.materialId]);
      if (!material) continue;
      const itemId = uuidv4();
      const unitPrice = item.unitPrice || 0;
      const amount = item.quantity * unitPrice;
      run(`INSERT INTO order_items (id, order_id, material_id, quantity, unit_price, amount, delivered_qty, qualified_qty, expected_date, remark) VALUES (?,?,?,?,?,?,0,0,?,?)`,
        [itemId, id, item.materialId, item.quantity, unitPrice, amount, item.expectedDate || null, item.remark || null]);
    }
    // 重新汇总订单金额
    const sumResult = queryOne('SELECT COALESCE(SUM(amount), 0) as total FROM order_items WHERE order_id = ?', [id]) as any;
    run('UPDATE purchase_orders SET total_amount = ? WHERE id = ?', [sumResult?.total || 0, id]);
  }

  const order = queryOne('SELECT * FROM purchase_orders WHERE id = ?', [id]);
  res.status(201).json({ data: order });
}));

router.put('/:id', asyncHandler((req, res) => {
  const now = new Date().toISOString();
  const b = req.body;
  const existing = queryOne('SELECT id, status FROM purchase_orders WHERE id = ?', [req.params.id]) as any;
  if (!existing) return res.status(404).json({ error: '未找到订单' });

  // 状态流转校验
  if (b.status && b.status !== existing.status) {
    const allowed = statusTransitions[existing.status] || [];
    if (!allowed.includes(b.status)) {
      return res.status(400).json({ error: `订单状态不允许从「${existing.status}」变更为「${b.status}」` });
    }
    run('UPDATE purchase_orders SET status=?, updated_at=? WHERE id=?', [b.status, now, req.params.id]);
  } else {
    // 已取消/已关闭的订单不允许编辑主表信息
    if (['cancelled', 'closed'].includes(existing.status)) {
      return res.status(400).json({ error: '已取消或已关闭的订单不允许编辑' });
    }
    run(`UPDATE purchase_orders SET title=?, total_amount=?, expected_date=?, payment_term=?, remark=?, updated_at=? WHERE id=?`,
      [b.title || null, b.totalAmount || 0, b.expectedDate || null, b.paymentTerm || null, b.remark || null, now, req.params.id]);
  }
  const order = queryOne('SELECT * FROM purchase_orders WHERE id = ?', [req.params.id]);
  res.json({ data: order });
}));

// 级联删除：订单明细 + 交付记录
router.delete('/:id', asyncHandler((req, res) => {
  const exists = queryOne('SELECT id FROM purchase_orders WHERE id = ?', [req.params.id]);
  if (!exists) return res.status(404).json({ error: '未找到订单' });
  run('DELETE FROM deliveries WHERE order_id = ?', [req.params.id]);
  run('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
  run('DELETE FROM purchase_orders WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

export default router;
