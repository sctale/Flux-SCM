import { Router } from 'express';
import { getDb } from '../database';
import crypto from 'crypto';

const router = Router();

// 获取积分卡列表
router.get('/', (_req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT sc.*, s.name as supplier_name
      FROM supplier_scorecards sc
      LEFT JOIN suppliers s ON sc.supplier_id = s.id
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

// 创建积分卡
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const d = req.body;

    const q = d.quality_score || 0, qw = d.quality_weight ?? 0.30;
    const c = d.cost_score || 0, cw = d.cost_weight ?? 0.25;
    const dl = d.delivery_score || 0, dw = d.delivery_weight ?? 0.25;
    const sv = d.service_score || 0, sw = d.service_weight ?? 0.10;
    const inn = d.innovation_score || 0, iw = d.innovation_weight ?? 0.10;

    const weightedTotal = q * qw + c * cw + dl * dw + sv * sw + inn * iw;
    let grade = 'C';
    if (weightedTotal >= 90) grade = 'A';
    else if (weightedTotal >= 80) grade = 'B';
    else if (weightedTotal >= 70) grade = 'C';
    else if (weightedTotal >= 60) grade = 'D';
    else grade = 'F';

    db.run(`INSERT INTO supplier_scorecards (id, supplier_id, quality_score, quality_weight, cost_score, cost_weight, delivery_score, delivery_weight, service_score, service_weight, innovation_score, innovation_weight, weighted_total, grade, period, remark, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, d.supplier_id, q, qw, c, cw, dl, dw, sv, sw, inn, iw, weightedTotal, grade, d.period || '', d.remark || '', now, now]);

    res.json({ id, weighted_total: weightedTotal, grade });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 更新积分卡
router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const d = req.body;

    const q = d.quality_score || 0, qw = d.quality_weight ?? 0.30;
    const c = d.cost_score || 0, cw = d.cost_weight ?? 0.25;
    const dl = d.delivery_score || 0, dw = d.delivery_weight ?? 0.25;
    const sv = d.service_score || 0, sw = d.service_weight ?? 0.10;
    const inn = d.innovation_score || 0, iw = d.innovation_weight ?? 0.10;

    const weightedTotal = q * qw + c * cw + dl * dw + sv * sw + inn * iw;
    let grade = 'C';
    if (weightedTotal >= 90) grade = 'A';
    else if (weightedTotal >= 80) grade = 'B';
    else if (weightedTotal >= 70) grade = 'C';
    else if (weightedTotal >= 60) grade = 'D';
    else grade = 'F';

    db.run(`UPDATE supplier_scorecards SET quality_score=?, quality_weight=?, cost_score=?, cost_weight=?, delivery_score=?, delivery_weight=?, service_score=?, service_weight=?, innovation_score=?, innovation_weight=?, weighted_total=?, grade=?, period=?, remark=?, updated_at=?
      WHERE id=?`,
      [q, qw, c, cw, dl, dw, sv, sw, inn, iw, weightedTotal, grade, d.period || '', d.remark || '', now, req.params.id]);

    res.json({ weighted_total: weightedTotal, grade });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 删除积分卡
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.run('DELETE FROM supplier_scorecards WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
