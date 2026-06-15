import { Router, Request, Response } from 'express';
import { getDb } from '../database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/orders
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { status, supplier_id } = req.query;

  let sql = `SELECT po.*, s.name as supplier_name, s.short_name as supplier_short_name
    FROM purchase_orders po
    LEFT JOIN suppliers s ON po.supplier_id = s.id
    WHERE 1=1`;
  const params: any[] = [];

  if (status) { sql += ' AND po.status = ?'; params.push(status); }
  if (supplier_id) { sql += ' AND po.supplier_id = ?'; params.push(supplier_id); }

  sql += ' ORDER BY po.created_at DESC';

  const orders = db.prepare(sql).all(...params);
  res.json({ data: orders, total: orders.length });
});

// GET /api/orders/:id
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const order = db.prepare(`
    SELECT po.*, s.name as supplier_name, s.short_name as supplier_short_name
    FROM purchase_orders po
    LEFT JOIN suppliers s ON po.supplier_id = s.id
    WHERE po.id = ?
  `).get(req.params.id);
  if (!order) return res.status(404).json({ error: '未找到订单' });

  const items = db.prepare(`
    SELECT oi.*, m.code as material_code, m.name as material_name, m.specification as material_specification, m.unit as material_unit
    FROM order_items oi
    LEFT JOIN materials m ON oi.material_id = m.id
    WHERE oi.order_id = ?
  `).all(req.params.id);

  const deliveries = db.prepare(`
    SELECT d.* FROM deliveries d
    WHERE d.order_id = ?
    ORDER BY d.delivery_date DESC
  `).all(req.params.id);

  res.json({ data: { ...order, items, deliveries } });
});

// POST /api/orders
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const body = req.body;

  const countResult = db.prepare('SELECT COUNT(*) as c FROM purchase_orders').get() as any;
  const orderNo = body.orderNo || `PO-${new Date().getFullYear()}-${String(countResult.c + 1).padStart(4, '0')}`;

  db.prepare(`INSERT INTO purchase_orders (id, order_no, supplier_id, title, status, total_amount, order_date, expected_date, payment_term, remark, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, orderNo, body.supplierId, body.title || null,
    body.status || 'draft', body.totalAmount || 0,
    body.orderDate || null, body.expectedDate || null,
    body.paymentTerm || null, body.remark || null,
    body.createdBy || null, now, now
  );

  // Insert order items if provided
  if (body.items && Array.isArray(body.items)) {
    const insertItem = db.prepare(`INSERT INTO order_items (id, order_id, material_id, quantity, unit_price, amount, delivered_qty, qualified_qty, expected_date, remark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    const insertItems = db.transaction((items: any[]) => {
      for (const item of items) {
        insertItem.run(
          uuidv4(), id, item.materialId, item.quantity, item.unitPrice,
          item.amount || (item.quantity * item.unitPrice),
          0, 0, item.expectedDate || null, item.remark || null
        );
      }
    });
    insertItems(body.items);
  }

  const order = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id);
  res.status(201).json({ data: order });
});

// PUT /api/orders/:id
router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const now = new Date().toISOString();
  const body = req.body;

  if (body.status) {
    db.prepare('UPDATE purchase_orders SET status = ?, updated_at = ? WHERE id = ?').run(body.status, now, req.params.id);
  } else {
    db.prepare(`UPDATE purchase_orders SET title=?, total_amount=?, expected_date=?, payment_term=?, remark=?, updated_at=? WHERE id=?`).run(
      body.title || null, body.totalAmount || 0,
      body.expectedDate || null, body.paymentTerm || null,
      body.remark || null, now, req.params.id
    );
  }

  const order = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(req.params.id);
  res.json({ data: order });
});

// DELETE /api/orders/:id
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM deliveries WHERE order_id = ?').run(req.params.id);
  db.prepare('DELETE FROM order_items WHERE order_id = ?').run(req.params.id);
  db.prepare('DELETE FROM purchase_orders WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
