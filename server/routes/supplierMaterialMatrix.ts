import { Router } from 'express';
import { getDb } from '../database';

const router = Router();

// 供应商-物料矩阵 - 交叉分析
router.get('/', (_req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT ms.id, ms.supplier_id, ms.material_id,
        s.name as supplier_name, s.kraljic_quadrant,
        m.code as material_code, m.name as material_name, m.abc_class, m.xyz_class,
        ms.unit_price, ms.min_order_qty, ms.is_preferred
      FROM material_suppliers ms
      LEFT JOIN suppliers s ON ms.supplier_id = s.id
      LEFT JOIN materials m ON ms.material_id = m.id
      ORDER BY s.name, m.name
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
