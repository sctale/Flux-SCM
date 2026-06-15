import { Router, Request, Response } from 'express';
import { getDb } from '../database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/materials/abcxyz
router.get('/abcxyz', (req: Request, res: Response) => {
  const db = getDb();
  const materials = db.prepare('SELECT id, code, name, abc_class, xyz_class, annual_consumption_value, coefficient_of_variation, category FROM materials WHERE abc_class IS NOT NULL').all();
  res.json({ data: materials });
});

// GET /api/materials
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { search, abc, xyz, category } = req.query;

  let sql = 'SELECT * FROM materials WHERE 1=1';
  const params: any[] = [];

  if (search) { sql += ' AND (name LIKE ? OR code LIKE ? OR specification LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (abc) { sql += ' AND abc_class = ?'; params.push(abc); }
  if (xyz) { sql += ' AND xyz_class = ?'; params.push(xyz); }
  if (category) { sql += ' AND category = ?'; params.push(category); }

  sql += ' ORDER BY created_at DESC';

  const materials = db.prepare(sql).all(...params);
  res.json({ data: materials, total: materials.length });
});

// GET /api/materials/:id
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);
  if (!material) return res.status(404).json({ error: '未找到物料' });

  const suppliers = db.prepare(`
    SELECT ms.*, s.name as supplier_name, s.short_name as supplier_short_name
    FROM material_suppliers ms
    LEFT JOIN suppliers s ON ms.supplier_id = s.id
    WHERE ms.material_id = ?
  `).all(req.params.id);

  res.json({ data: { ...material, suppliers } });
});

// POST /api/materials
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const body = req.body;

  db.prepare(`INSERT INTO materials (id, code, name, specification, unit, category, material_type,
    safety_stock, lead_time, drawing_no, abc_class, xyz_class, annual_consumption_value, coefficient_of_variation,
    remark, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, body.code, body.name, body.specification || null, body.unit,
    body.category || null, body.materialType || null,
    body.safetyStock || 0, body.leadTime || 0,
    body.drawingNo || null, body.abcClass || null, body.xyzClass || null,
    body.annualConsumptionValue || 0, body.coefficientOfVariation || 0,
    body.remark || null, now, now
  );

  const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(id);
  res.status(201).json({ data: material });
});

// PUT /api/materials/:id
router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const now = new Date().toISOString();
  const body = req.body;

  db.prepare(`UPDATE materials SET code=?, name=?, specification=?, unit=?, category=?, material_type=?,
    safety_stock=?, lead_time=?, drawing_no=?, abc_class=?, xyz_class=?,
    annual_consumption_value=?, coefficient_of_variation=?, remark=?, updated_at=? WHERE id=?`).run(
    body.code, body.name, body.specification || null, body.unit,
    body.category || null, body.materialType || null,
    body.safetyStock || 0, body.leadTime || 0,
    body.drawingNo || null, body.abcClass || null, body.xyzClass || null,
    body.annualConsumptionValue || 0, body.coefficientOfVariation || 0,
    body.remark || null, now, req.params.id
  );

  const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);
  res.json({ data: material });
});

// DELETE /api/materials/:id
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM material_suppliers WHERE material_id = ?').run(req.params.id);
  db.prepare('DELETE FROM materials WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
