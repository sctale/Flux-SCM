import { Router } from 'express';
import { getDb } from '../database';
import crypto from 'crypto';

const router = Router();

// 获取应该成本分析列表
router.get('/', (_req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT sc.*, s.name as supplier_name, m.name as material_name, m.code as material_code
      FROM should_cost_analyses sc
      LEFT JOIN suppliers s ON sc.supplier_id = s.id
      LEFT JOIN materials m ON sc.material_id = m.id
      ORDER BY sc.created_at DESC
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

// 创建应该成本分析
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const d = req.body;

    const materialCost = d.material_cost || 0;
    const laborCost = d.labor_cost || 0;
    const overheadCost = d.overhead_cost || 0;
    const equipmentCost = d.equipment_cost || 0;
    const logisticsCost = d.logistics_cost || 0;
    const profitMargin = d.profit_margin || 0;
    const quotedPrice = d.quoted_price || 0;

    const shouldCostTotal = materialCost + laborCost + overheadCost + equipmentCost + logisticsCost + profitMargin;
    const variancePct = shouldCostTotal > 0 ? ((quotedPrice - shouldCostTotal) / shouldCostTotal * 100) : 0;

    db.run(`INSERT INTO should_cost_analyses (id, supplier_id, material_id, material_cost, labor_cost, overhead_cost, equipment_cost, logistics_cost, profit_margin, should_cost_total, quoted_price, variance_pct, remark, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, d.supplier_id, d.material_id, materialCost, laborCost, overheadCost, equipmentCost, logisticsCost, profitMargin, shouldCostTotal, quotedPrice, variancePct, d.remark || '', now, now]);

    res.json({ id, should_cost_total: shouldCostTotal, variance_pct: variancePct });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 更新应该成本分析
router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const d = req.body;

    const materialCost = d.material_cost || 0;
    const laborCost = d.labor_cost || 0;
    const overheadCost = d.overhead_cost || 0;
    const equipmentCost = d.equipment_cost || 0;
    const logisticsCost = d.logistics_cost || 0;
    const profitMargin = d.profit_margin || 0;
    const quotedPrice = d.quoted_price || 0;

    const shouldCostTotal = materialCost + laborCost + overheadCost + equipmentCost + logisticsCost + profitMargin;
    const variancePct = shouldCostTotal > 0 ? ((quotedPrice - shouldCostTotal) / shouldCostTotal * 100) : 0;

    db.run(`UPDATE should_cost_analyses SET material_cost=?, labor_cost=?, overhead_cost=?, equipment_cost=?, logistics_cost=?, profit_margin=?, should_cost_total=?, quoted_price=?, variance_pct=?, remark=?, updated_at=?
      WHERE id=?`,
      [materialCost, laborCost, overheadCost, equipmentCost, logisticsCost, profitMargin, shouldCostTotal, quotedPrice, variancePct, d.remark || '', now, req.params.id]);

    res.json({ should_cost_total: shouldCostTotal, variance_pct: variancePct });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 删除应该成本分析
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.run('DELETE FROM should_cost_analyses WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
