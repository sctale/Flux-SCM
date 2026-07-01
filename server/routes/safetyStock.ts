import { Router } from 'express';
import { queryAll } from '../dbHelper';

const router = Router();

// ABC-XYZ 矩阵对应的缓冲系数（价值维度 × 波动性维度）
// A=高价值 → 越需关注；Z=高波动 → 越需缓冲
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

// 安全库存建议 - 基于 ABC-XYZ 分类 + 采购提前期 + 日均需求量
// 算法：
//   suggested_qty = ROUND(daily_demand_qty × suggested_days)
//   daily_demand_qty = 年消耗金额 / 250(年工作日) / 平均单价
//   suggested_days = ROUND(lead_time × buffer_factor)
// 单位说明：annual_consumption_value 是金额(元)，safety_stock 是数量(件/个)
// 必须通过平均单价把"金额"换算成"数量"，否则单位混淆
router.get('/', (_req, res) => {
  try {
    const rows = queryAll(`
      SELECT m.id, m.code, m.name, m.category, m.abc_class, m.xyz_class,
        m.safety_stock as current_safety_stock,
        m.lead_time, m.annual_consumption_value, m.coefficient_of_variation,
        avg_price.avg_unit_price
      FROM materials m
      LEFT JOIN (
        SELECT material_id, AVG(unit_price) as avg_unit_price
        FROM material_suppliers
        WHERE unit_price IS NOT NULL AND unit_price > 0
        GROUP BY material_id
      ) avg_price ON avg_price.material_id = m.id
      WHERE m.abc_class IS NOT NULL AND m.xyz_class IS NOT NULL
      ORDER BY m.abc_class, m.xyz_class
    `);

    // 在 JS 中计算建议安全库存（金额→数量的单位换算）
    const data = rows.map((row: any) => {
      const key = `${row.abc_class}-${row.xyz_class}`;
      const policy = bufferPolicy[key] || { factor: 1.0, label: '标准缓冲' };
      const avgPrice = row.avg_unit_price;
      const annualValue = row.annual_consumption_value || 0;
      const leadTime = row.lead_time || 0;

      const suggestedDays = Math.round(leadTime * policy.factor);
      let suggestedSafetyStock: number | null = null;
      let dailyDemandQty: number | null = null;

      // 必须有平均单价才能把金额换算成数量
      if (avgPrice && avgPrice > 0 && annualValue > 0) {
        dailyDemandQty = annualValue / 250 / avgPrice;
        suggestedSafetyStock = Math.round(dailyDemandQty * suggestedDays);
      }

      return {
        ...row,
        buffer_factor: policy.factor,
        buffer_label: policy.label,
        avg_unit_price: avgPrice || null,
        daily_demand_qty: dailyDemandQty ? Math.round(dailyDemandQty * 100) / 100 : null,
        suggested_days: suggestedDays,
        suggested_safety_stock: suggestedSafetyStock,
        unit_warning: !avgPrice || avgPrice <= 0 ? '缺少供应商报价，无法计算建议数量' : null,
      };
    });

    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
