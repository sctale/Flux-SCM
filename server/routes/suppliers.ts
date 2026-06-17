import { Router, Request, Response } from 'express';
import { queryAll, queryOne, run } from '../dbHelper';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 统一错误处理包装器
const asyncHandler = (fn: (req: Request, res: Response) => void) => (req: Request, res: Response) => {
  try {
    fn(req, res);
  } catch (e: any) {
    console.error('[suppliers] 错误:', e.message);
    res.status(500).json({ error: '服务器内部错误', detail: e.message });
  }
};

router.get('/', asyncHandler((req, res) => {
  const { search, quadrant, grade, status } = req.query;
  let sql = 'SELECT * FROM suppliers WHERE 1=1';
  const params: any[] = [];
  if (search) { sql += ' AND (name LIKE ? OR short_name LIKE ? OR unified_code LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (quadrant) { sql += ' AND kraljic_quadrant = ?'; params.push(quadrant); }
  if (grade) { sql += ' AND performance_grade = ?'; params.push(grade); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY created_at DESC';
  const suppliers = queryAll(sql, params);
  res.json({ data: suppliers, total: suppliers.length });
}));

router.get('/kraljic', asyncHandler((req, res) => {
  const suppliers = queryAll('SELECT id, name, short_name, kraljic_quadrant, profit_impact_score, supply_risk_score, performance_grade, overall_score FROM suppliers WHERE kraljic_quadrant IS NOT NULL');
  res.json({ data: suppliers });
}));

router.get('/:id', asyncHandler((req, res) => {
  const supplier = queryOne('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
  if (!supplier) return res.status(404).json({ error: '未找到供应商' });
  const qualifications = queryAll('SELECT * FROM supplier_qualifications WHERE supplier_id = ?', [req.params.id]);
  const contacts = queryAll('SELECT * FROM supplier_contacts WHERE supplier_id = ?', [req.params.id]);
  res.json({ data: { ...supplier, qualifications, contacts } });
}));

router.post('/', asyncHandler((req, res) => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const b = req.body;
  if (!b.name) return res.status(400).json({ error: '供应商名称不能为空' });
  run(`INSERT INTO suppliers (id, name, short_name, unified_code, category, status, address, contact_person, contact_phone, contact_email, bank_name, bank_account, remark, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, b.name, b.shortName || null, b.unifiedCode || null, b.category || null, b.status || 'pending', b.address || null, b.contactPerson || null, b.contactPhone || null, b.contactEmail || null, b.bankName || null, b.bankAccount || null, b.remark || null, now, now]);
  const supplier = queryOne('SELECT * FROM suppliers WHERE id = ?', [id]);
  res.status(201).json({ data: supplier });
}));

router.put('/:id', asyncHandler((req, res) => {
  const now = new Date().toISOString();
  const b = req.body;
  const exists = queryOne('SELECT id FROM suppliers WHERE id = ?', [req.params.id]);
  if (!exists) return res.status(404).json({ error: '未找到供应商' });
  run(`UPDATE suppliers SET name=?, short_name=?, unified_code=?, category=?, address=?, contact_person=?, contact_phone=?, contact_email=?, bank_name=?, bank_account=?, remark=?, updated_at=? WHERE id=?`,
    [b.name, b.shortName || null, b.unifiedCode || null, b.category || null, b.address || null, b.contactPerson || null, b.contactPhone || null, b.contactEmail || null, b.bankName || null, b.bankAccount || null, b.remark || null, now, req.params.id]);
  const supplier = queryOne('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
  res.json({ data: supplier });
}));

// 级联删除：供应商关联的所有数据
router.delete('/:id', asyncHandler((req, res) => {
  const exists = queryOne('SELECT id FROM suppliers WHERE id = ?', [req.params.id]);
  if (!exists) return res.status(404).json({ error: '未找到供应商' });
  // 按依赖顺序清理
  run('DELETE FROM supplier_qualifications WHERE supplier_id = ?', [req.params.id]);
  run('DELETE FROM supplier_contacts WHERE supplier_id = ?', [req.params.id]);
  run('DELETE FROM tco_analyses WHERE supplier_id = ?', [req.params.id]);
  run('DELETE FROM should_cost_analyses WHERE supplier_id = ?', [req.params.id]);
  run('DELETE FROM supplier_scorecards WHERE supplier_id = ?', [req.params.id]);
  run('DELETE FROM risk_alerts WHERE supplier_id = ?', [req.params.id]);
  run('DELETE FROM material_suppliers WHERE supplier_id = ?', [req.params.id]);
  // 订单：先删子表再删主表
  const orderIds = queryAll('SELECT id FROM purchase_orders WHERE supplier_id = ?', [req.params.id]).map((o: any) => o.id);
  for (const oid of orderIds) {
    run('DELETE FROM order_items WHERE order_id = ?', [oid]);
    run('DELETE FROM deliveries WHERE order_id = ?', [oid]);
  }
  run('DELETE FROM purchase_orders WHERE supplier_id = ?', [req.params.id]);
  run('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

export default router;
