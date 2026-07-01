import { Router } from 'express';
import { getDb } from '../database';

const router = Router();

// 安全库存建议 - 基于 ABC-XYZ 分类和提前期
// 计算逻辑：
// 1. 缓冲系数 = f(ABC, XYZ)，高价值且高波动取高缓冲
// 2. 建议安全库存天数 = ROUND(提前期 × 缓冲系数)
// 3. 日需求数量 = 年消耗金额 / 250 / 平均单价（避免金额与数量单位混淆）
// 4. 建议安全库存数量 = ROUND(日需求数量 × 建议安全库存天数)
const bufferPolicy: Record<string, { factor: number; label: string }> = {
  'A-X': { factor: 1.0, label: '标准缓冲' },
  'A-Y': { factor: 1.5, label: '较高缓冲' },
  'A-Z': { factor: 2.5, label: '高缓冲(高价值高波动)' },
  'B-X': { factor: 1.2, label: '低缓冲' },
  'B-Y': { factor: 1.8, label: '标准缓冲' },
  'B-Z': { factor: 2.2, label: '较高缓冲' },
  'C-X': { factor: 1.5, label: '极低缓冲' },
  'C-Y': { factor: 2.0, label: '低缓冲' },
  'C-Z': { factor: 3.0, label: '标准缓冲' },
};

router.get('/', (_req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT
        m.id, m.code, m.name, m.category, m.abc_class, m.xyz_class,
        m.safety_stock as current_safety_stock,
        m.lead_time, m.annual_consumption_value, m.coefficient_of_variation,
        COALESCE((SELECT AVG(ms.unit_price) FROM material_suppliers ms WHERE ms.material_id = m.id), 0) as avg_unit_price
      FROM materials m
      WHERE m.abc_class IS NOT NULL AND m.xyz_class IS NOT NULL
      ORDER BY m.abc_class, m.xyz_class
    `);
    const columns = result[0]?.columns || [];
    const rows = result[0]?.values || [];
    const data = rows.map(row => {
      const obj: any = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      const key = `${obj.abc_class}-${obj.xyz_class}`;
      const policy = bufferPolicy[key] || { factor: 1.0, label: '标准缓冲' };
      const leadTime = obj.lead_time || 0;
      const suggestedDays = Math.round(leadTime * policy.factor);
      // 年工作天数按 250 天估算
      const dailyDemandQty = obj.avg_unit_price > 0
        ? obj.annual_consumption_value / 250 / obj.avg_unit_price
        : 0;
      obj.suggested_safety_days = suggestedDays;
      obj.suggested_safety_stock = dailyDemandQty > 0 ? Math.round(dailyDemandQty * suggestedDays) : 0;
      obj.policy = policy.label;
      // 删除中间计算字段，保持接口简洁
      delete obj.avg_unit_price;
      return obj;
    });
    res.json(data);
  } catch (e: any) {
    console.error('[safetyStock] 错误:', e.message);
    res.status(500).json({ error: '服务器内部错误', detail: e.message });
  }
});

export default router;
