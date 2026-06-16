import { Router } from 'express';
import { getDb } from '../database';

const router = Router();

// 替代物料建议 - 同类别物料可互替
router.get('/', (_req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT m1.id as material_id, m1.code, m1.name, m1.category,
        m1.abc_class, m1.xyz_class,
        m2.id as alt_material_id, m2.code as alt_code, m2.name as alt_name,
        ms2.unit_price as alt_price, ms2.supplier_id,
        s.name as alt_supplier_name
      FROM materials m1
      JOIN materials m2 ON m1.category = m2.category AND m1.id != m2.id
      LEFT JOIN material_suppliers ms2 ON m2.id = ms2.material_id
      LEFT JOIN suppliers s ON ms2.supplier_id = s.id
      WHERE m1.abc_class IN ('A', 'B')
      ORDER BY m1.category, m1.name
    `);
    const columns = result[0]?.columns || [];
    const rows = result[0]?.values || [];
    const data = rows.map(row => {
      const obj: any = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
