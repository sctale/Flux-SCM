import { Router } from 'express';
import { getDb } from '../database';
import crypto from 'crypto';

const router = Router();

// 获取TCO列表
router.get('/', (_req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT t.*, s.name as supplier_name, m.name as material_name, m.code as material_code
      FROM tco_analyses t
      LEFT JOIN suppliers s ON t.supplier_id = s.id
      LEFT JOIN materials m ON t.material_id = m.id
      ORDER BY t.created_at DESC
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

// 创建TCO分析
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const d = req.body;

    const purchasePrice = d.purchase_price || 0;
    const freightCost = d.freight_cost || 0;
    const inspectionCost = d.inspection_cost || 0;
    const storageCost = d.storage_cost || 0;
    const qualityLossCost = d.quality_loss_cost || 0;
    const delayCost = d.delay_cost || 0;
    const adminCost = d.admin_cost || 0;
    const returnCost = d.return_cost || 0;
    const warrantyCost = d.warranty_cost || 0;
    const opportunityCost = d.opportunity_cost || 0;

    const totalTco = purchasePrice + freightCost + inspectionCost + storageCost +
      qualityLossCost + delayCost + adminCost + returnCost + warrantyCost + opportunityCost;

    db.run(`INSERT INTO tco_analyses (id, supplier_id, material_id, purchase_price, freight_cost, inspection_cost, storage_cost, quality_loss_cost, delay_cost, admin_cost, return_cost, warranty_cost, opportunity_cost, total_tco, remark, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, d.supplier_id, d.material_id, purchasePrice, freightCost, inspectionCost, storageCost, qualityLossCost, delayCost, adminCost, returnCost, warrantyCost, opportunityCost, totalTco, d.remark || '', now, now]);

    res.json({ id, total_tco: totalTco });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 更新TCO分析
router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const d = req.body;

    const purchasePrice = d.purchase_price || 0;
    const freightCost = d.freight_cost || 0;
    const inspectionCost = d.inspection_cost || 0;
    const storageCost = d.storage_cost || 0;
    const qualityLossCost = d.quality_loss_cost || 0;
    const delayCost = d.delay_cost || 0;
    const adminCost = d.admin_cost || 0;
    const returnCost = d.return_cost || 0;
    const warrantyCost = d.warranty_cost || 0;
    const opportunityCost = d.opportunity_cost || 0;

    const totalTco = purchasePrice + freightCost + inspectionCost + storageCost +
      qualityLossCost + delayCost + adminCost + returnCost + warrantyCost + opportunityCost;

    db.run(`UPDATE tco_analyses SET purchase_price=?, freight_cost=?, inspection_cost=?, storage_cost=?, quality_loss_cost=?, delay_cost=?, admin_cost=?, return_cost=?, warranty_cost=?, opportunity_cost=?, total_tco=?, remark=?, updated_at=?
      WHERE id=?`,
      [purchasePrice, freightCost, inspectionCost, storageCost, qualityLossCost, delayCost, adminCost, returnCost, warrantyCost, opportunityCost, totalTco, d.remark || '', now, req.params.id]);

    res.json({ total_tco: totalTco });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 删除TCO分析
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.run('DELETE FROM tco_analyses WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
