import { Router } from 'express';
import { getDb } from '../database';

const router = Router();

// 安全库存建议 - 基于 ABC-XYZ 分类和提前期
// 计算逻辑：建议安全库存天数 = 提前期 × 服务水平系数
// 服务水平系数基于 ABC-XYZ 分类（高价值高波动需要更多缓冲）
router.get('/', (_req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT m.id, m.code, m.name, m.category, m.abc_class, m.xyz_class,
        m.safety_stock as current_safety_stock,
        m.lead_time, m.annual_consumption_value, m.coefficient_of_variation,
        CASE
          WHEN m.abc_class = 'A' AND m.xyz_class = 'Z' THEN ROUND(m.lead_time * 1.5)
          WHEN m.abc_class = 'A' AND m.xyz_class = 'Y' THEN ROUND(m.lead_time * 1.2)
          WHEN m.abc_class = 'A' AND m.xyz_class = 'X' THEN ROUND(m.lead_time * 1.0)
          WHEN m.abc_class = 'B' AND m.xyz_class = 'Z' THEN ROUND(m.lead_time * 1.3)
          WHEN m.abc_class = 'B' AND m.xyz_class = 'Y' THEN ROUND(m.lead_time * 1.1)
          WHEN m.abc_class = 'B' AND m.xyz_class = 'X' THEN ROUND(m.lead_time * 0.9)
          WHEN m.abc_class = 'C' AND m.xyz_class = 'Z' THEN ROUND(m.lead_time * 1.0)
          WHEN m.abc_class = 'C' AND m.xyz_class = 'Y' THEN ROUND(m.lead_time * 0.8)
          WHEN m.abc_class = 'C' AND m.xyz_class = 'X' THEN ROUND(m.lead_time * 0.7)
          ELSE ROUND(m.lead_time * 1.0)
        END as suggested_safety_days,
        CASE
          WHEN m.abc_class = 'A' AND m.xyz_class = 'Z' THEN '高缓冲(高价值高波动)'
          WHEN m.abc_class = 'A' AND m.xyz_class = 'Y' THEN '较高缓冲'
          WHEN m.abc_class = 'A' AND m.xyz_class = 'X' THEN '标准缓冲'
          WHEN m.abc_class = 'B' AND m.xyz_class = 'Z' THEN '较高缓冲'
          WHEN m.abc_class = 'B' AND m.xyz_class = 'Y' THEN '标准缓冲'
          WHEN m.abc_class = 'B' AND m.xyz_class = 'X' THEN '低缓冲'
          WHEN m.abc_class = 'C' AND m.xyz_class = 'Z' THEN '标准缓冲'
          WHEN m.abc_class = 'C' AND m.xyz_class = 'Y' THEN '低缓冲'
          WHEN m.abc_class = 'C' AND m.xyz_class = 'X' THEN '极低缓冲'
          ELSE '标准缓冲'
        END as policy
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
    console.error('[safetyStock] 错误:', e.message);
    res.status(500).json({ error: '服务器内部错误', detail: e.message });
  }
});

export default router;
