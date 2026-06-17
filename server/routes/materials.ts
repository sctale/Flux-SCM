import { Router, Request, Response } from 'express';
import { queryAll, queryOne, run } from '../dbHelper';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 统一错误处理包装器
const asyncHandler = (fn: (req: Request, res: Response) => void) => (req: Request, res: Response) => {
  try {
    fn(req, res);
  } catch (e: any) {
    console.error('[materials] 错误:', e.message);
    res.status(500).json({ error: '服务器内部错误', detail: e.message });
  }
};

router.get('/', asyncHandler((req, res) => {
  const { search, abcClass, xyzClass } = req.query;
  let sql = 'SELECT * FROM materials WHERE 1=1';
  const params: any[] = [];
  if (search) { sql += ' AND (name LIKE ? OR code LIKE ? OR specification LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (abcClass) { sql += ' AND abc_class = ?'; params.push(abcClass); }
  if (xyzClass) { sql += ' AND xyz_class = ?'; params.push(xyzClass); }
  sql += ' ORDER BY created_at DESC';
  const materials = queryAll(sql, params);
  res.json({ data: materials, total: materials.length });
}));

router.get('/abcxyz', asyncHandler((req, res) => {
  const materials = queryAll('SELECT id, name, code, abc_class, xyz_class, annual_consumption_value, coefficient_of_variation FROM materials WHERE abc_class IS NOT NULL');
  res.json({ data: materials });
}));

router.get('/:id', asyncHandler((req, res) => {
  const material = queryOne('SELECT * FROM materials WHERE id = ?', [req.params.id]);
  if (!material) return res.status(404).json({ error: '未找到物料' });
  res.json({ data: material });
}));

router.post('/', asyncHandler((req, res) => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const b = req.body;
  if (!b.name || !b.unit) return res.status(400).json({ error: '物料名称和单位不能为空' });
  run(`INSERT INTO materials (id, code, name, specification, unit, category, material_type, safety_stock, lead_time, drawing_no, abc_class, xyz_class, annual_consumption_value, coefficient_of_variation, remark, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, b.code || null, b.name, b.specification || null, b.unit, b.category || null, b.materialType || null, b.safetyStock || 0, b.leadTime || 0, b.drawingNo || null, b.abcClass || null, b.xyzClass || null, b.annualConsumptionValue || 0, b.coefficientOfVariation || 0, b.remark || null, now, now]);
  const material = queryOne('SELECT * FROM materials WHERE id = ?', [id]);
  res.status(201).json({ data: material });
}));

router.put('/:id', asyncHandler((req, res) => {
  const now = new Date().toISOString();
  const b = req.body;
  const exists = queryOne('SELECT id FROM materials WHERE id = ?', [req.params.id]);
  if (!exists) return res.status(404).json({ error: '未找到物料' });
  run(`UPDATE materials SET name=?, specification=?, unit=?, category=?, material_type=?, safety_stock=?, lead_time=?, drawing_no=?, remark=?, updated_at=? WHERE id=?`,
    [b.name, b.specification || null, b.unit, b.category || null, b.materialType || null, b.safetyStock || 0, b.leadTime || 0, b.drawingNo || null, b.remark || null, now, req.params.id]);
  const material = queryOne('SELECT * FROM materials WHERE id = ?', [req.params.id]);
  res.json({ data: material });
}));

// 级联删除：物料关联的所有数据
router.delete('/:id', asyncHandler((req, res) => {
  const exists = queryOne('SELECT id FROM materials WHERE id = ?', [req.params.id]);
  if (!exists) return res.status(404).json({ error: '未找到物料' });
  // 按依赖顺序清理
  run('DELETE FROM tco_analyses WHERE material_id = ?', [req.params.id]);
  run('DELETE FROM should_cost_analyses WHERE material_id = ?', [req.params.id]);
  run('DELETE FROM material_suppliers WHERE material_id = ?', [req.params.id]);
  // 订单明细：删除引用此物料的 order_items
  run('DELETE FROM order_items WHERE material_id = ?', [req.params.id]);
  run('DELETE FROM materials WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

export default router;
