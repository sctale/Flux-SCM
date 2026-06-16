import { Router } from 'express';
import { getDb } from '../database';

const router = Router();

// MOQ冲突检测 - 物料需求量低于最小起订量
router.get('/', (_req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT m.id as material_id, m.code, m.name, m.safety_stock,
        ms.supplier_id, s.name as supplier_name,
        ms.min_order_qty, ms.unit_price,
        (ms.min_order_qty - m.safety_stock) as overage_qty,
        (ms.min_order_qty - m.safety_stock) * ms.unit_price as overage_cost
      FROM material_suppliers ms
      LEFT JOIN materials m ON ms.material_id = m.id
      LEFT JOIN suppliers s ON ms.supplier_id = s.id
      WHERE ms.min_order_qty > m.safety_stock AND m.safety_stock > 0
      ORDER BY overage_cost DESC
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
