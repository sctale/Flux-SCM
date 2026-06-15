import { Router, Request, Response } from 'express';
import { queryAll, queryOne, run } from '../dbHelper';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (req: Request, res: Response) => {
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
});

router.get('/kraljic', (req: Request, res: Response) => {
  const suppliers = queryAll('SELECT id, name, short_name, kraljic_quadrant, profit_impact_score, supply_risk_score, performance_grade, overall_score FROM suppliers WHERE kraljic_quadrant IS NOT NULL');
  res.json({ data: suppliers });
});

router.get('/:id', (req: Request, res: Response) => {
  const supplier = queryOne('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
  if (!supplier) return res.status(404).json({ error: '未找到供应商' });
  const qualifications = queryAll('SELECT * FROM supplier_qualifications WHERE supplier_id = ?', [req.params.id]);
  const contacts = queryAll('SELECT * FROM supplier_contacts WHERE supplier_id = ?', [req.params.id]);
  res.json({ data: { ...supplier, qualifications, contacts } });
});

router.post('/', (req: Request, res: Response) => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const b = req.body;
  run(`INSERT INTO suppliers (id, name, short_name, unified_code, category, status, address, contact_person, contact_phone, contact_email, bank_name, bank_account, remark, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, b.name, b.shortName || null, b.unifiedCode || null, b.category || null, b.status || 'pending', b.address || null, b.contactPerson || null, b.contactPhone || null, b.contactEmail || null, b.bankName || null, b.bankAccount || null, b.remark || null, now, now]);
  const supplier = queryOne('SELECT * FROM suppliers WHERE id = ?', [id]);
  res.status(201).json({ data: supplier });
});

router.put('/:id', (req: Request, res: Response) => {
  const now = new Date().toISOString();
  const b = req.body;
  run(`UPDATE suppliers SET name=?, short_name=?, unified_code=?, category=?, address=?, contact_person=?, contact_phone=?, contact_email=?, bank_name=?, bank_account=?, remark=?, updated_at=? WHERE id=?`,
    [b.name, b.shortName || null, b.unifiedCode || null, b.category || null, b.address || null, b.contactPerson || null, b.contactPhone || null, b.contactEmail || null, b.bankName || null, b.bankAccount || null, b.remark || null, now, req.params.id]);
  const supplier = queryOne('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
  res.json({ data: supplier });
});

router.delete('/:id', (req: Request, res: Response) => {
  run('DELETE FROM supplier_qualifications WHERE supplier_id = ?', [req.params.id]);
  run('DELETE FROM supplier_contacts WHERE supplier_id = ?', [req.params.id]);
  run('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

export default router;
