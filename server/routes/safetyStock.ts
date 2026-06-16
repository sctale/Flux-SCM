import { Router } from 'express';
import { getDb } from '../database';

const router = Router();

// 安全库存建议 - 基于ABC-XYZ分类
router.get('/', (_req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT m.id, m.code, m.name, m.category, m.abc_class, m.xyz_class,
        m.safety_stock as current_safety_stock,
        m.lead_time, m.annual_consumption_value, m.coefficient_of_variation,
        CASE
          WHEN m.abc_class = 'A' AND m.xyz_class = 'Z' THEN ROUND(m.annual_consumption_value * 0.05)
          WHEN m.abc_class = 'A' AND m.xyz_class = 'Y' THEN ROUND(m.annual_consumption_value * 0.03)
          WHEN m.abc_class = 'B' AND m.xyz_class = 'Z' THEN ROUND(m.annual_consumption_value * 0.04)
          WHEN m.abc_class = 'B' AND m.xyz_class = 'Y' THEN ROUND(m.annual_consumption_value * 0.02)
          ELSE ROUND(m.annual_consumption_value * 0.01)
        END as suggested_safety_stock
      FROM materials m
      WHERE m.abc_class IS NOT NULL AND m.xyz_class IS NOT NULL
      ORDER BY m.abc_class, m.xyz_class
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
