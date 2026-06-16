import { Router } from 'express';
import { getDb } from '../database';

const router = Router();

// 合并建议 - 基于同一供应商的多个物料
router.get('/', (_req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT ms.supplier_id, s.name as supplier_name,
        COUNT(ms.material_id) as material_count,
        SUM(ms.unit_price * ms.min_order_qty) as estimated_savings,
        GROUP_CONCAT(m.name, ', ') as materials
      FROM material_suppliers ms
      LEFT JOIN suppliers s ON ms.supplier_id = s.id
      LEFT JOIN materials m ON ms.material_id = m.id
      GROUP BY ms.supplier_id
      HAVING material_count > 1
      ORDER BY material_count DESC
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
