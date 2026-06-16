import { Router } from 'express';
import { getDb } from '../database';

const router = Router();

// 供应商集中度分析 - HHI / CR3 / CR5
router.get('/', (_req, res) => {
  try {
    const db = getDb();

    // 获取各供应商采购额
    const result = db.exec(`
      SELECT s.id, s.name, s.kraljic_quadrant,
        COALESCE(SUM(po.total_amount), 0) as total_purchase
      FROM suppliers s
      LEFT JOIN purchase_orders po ON s.id = po.supplier_id
      GROUP BY s.id
      ORDER BY total_purchase DESC
    `);
    const columns = result[0]?.columns || [];
    const rows = result[0]?.values || [];
    const suppliers = rows.map(row => {
      const obj: any = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });

    const totalPurchase = suppliers.reduce((sum: number, s: any) => sum + (s.total_purchase || 0), 0);
    if (totalPurchase === 0) {
      res.json({ hhi: 0, cr3: 0, cr5: 0, concentration_level: 'unknown', suppliers: [] });
      return;
    }

    // 计算市场份额百分比
    const withShare = suppliers.map((s: any) => ({
      ...s,
      share: ((s.total_purchase || 0) / totalPurchase) * 100
    }));

    // HHI指数
    const hhi = withShare.reduce((sum: number, s: any) => sum + Math.pow(s.share, 2), 0);

    // CR3 / CR5
    const sorted = [...withShare].sort((a: any, b: any) => b.total_purchase - a.total_purchase);
    const cr3 = sorted.slice(0, 3).reduce((sum: number, s: any) => sum + s.share, 0);
    const cr5 = sorted.slice(0, 5).reduce((sum: number, s: any) => sum + s.share, 0);

    let concentrationLevel = '竞争型';
    if (hhi > 2500) concentrationLevel = '寡占型';
    else if (hhi > 1500) concentrationLevel = '中等集中';

    res.json({
      hhi: Math.round(hhi * 10) / 10,
      cr3: Math.round(cr3 * 10) / 10,
      cr5: Math.round(cr5 * 10) / 10,
      concentration_level: concentrationLevel,
      suppliers: withShare
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
