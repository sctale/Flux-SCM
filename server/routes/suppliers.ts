import { Router, Request, Response } from 'express';
import { getDb } from '../database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/suppliers
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { search, quadrant, grade, status } = req.query;

  let sql = 'SELECT * FROM suppliers WHERE 1=1';
  const params: any[] = [];

  if (search) { sql += ' AND (name LIKE ? OR short_name LIKE ? OR unified_code LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (quadrant) { sql += ' AND kraljic_quadrant = ?'; params.push(quadrant); }
  if (grade) { sql += ' AND performance_grade = ?'; params.push(grade); }
  if (status) { sql += ' AND status = ?'; params.push(status); }

  sql += ' ORDER BY created_at DESC';

  const suppliers = db.prepare(sql).all(...params);
  res.json({ data: suppliers, total: suppliers.length });
});

// GET /api/suppliers/kraljic
router.get('/kraljic', (req: Request, res: Response) => {
  const db = getDb();
  const suppliers = db.prepare('SELECT id, name, short_name, kraljic_quadrant, profit_impact_score, supply_risk_score, performance_grade, overall_score FROM suppliers WHERE kraljic_quadrant IS NOT NULL').all();
  res.json({ data: suppliers });
});

// GET /api/suppliers/:id
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
  if (!supplier) return res.status(404).json({ error: '未找到供应商' });

  const qualifications = db.prepare('SELECT * FROM supplier_qualifications WHERE supplier_id = ?').all(req.params.id);
  const contacts = db.prepare('SELECT * FROM supplier_contacts WHERE supplier_id = ?').all(req.params.id);

  res.json({ data: { ...supplier, qualifications, contacts } });
});

// POST /api/suppliers
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const body = req.body;

  db.prepare(`INSERT INTO suppliers (id, name, short_name, unified_code, category, status, address, contact_person, contact_phone, contact_email, bank_name, bank_account, remark, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, body.name, body.shortName || null, body.unifiedCode || null, body.category || null,
    body.status || 'pending', body.address || null, body.contactPerson || null,
    body.contactPhone || null, body.contactEmail || null, body.bankName || null,
    body.bankAccount || null, body.remark || null, now, now
  );

  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
  res.status(201).json({ data: supplier });
});

// PUT /api/suppliers/:id
router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const now = new Date().toISOString();
  const body = req.body;

  db.prepare(`UPDATE suppliers SET name=?, short_name=?, unified_code=?, category=?, address=?, contact_person=?, contact_phone=?, contact_email=?, bank_name=?, bank_account=?, remark=?, updated_at=? WHERE id=?`).run(
    body.name, body.shortName || null, body.unifiedCode || null, body.category || null,
    body.address || null, body.contactPerson || null, body.contactPhone || null,
    body.contactEmail || null, body.bankName || null, body.bankAccount || null,
    body.remark || null, now, req.params.id
  );

  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
  res.json({ data: supplier });
});

// DELETE /api/suppliers/:id
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM supplier_qualifications WHERE supplier_id = ?').run(req.params.id);
  db.prepare('DELETE FROM supplier_contacts WHERE supplier_id = ?').run(req.params.id);
  db.prepare('DELETE FROM suppliers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
