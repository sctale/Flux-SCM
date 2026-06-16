import { Router } from 'express';
import { getDb } from '../database';

const router = Router();

// 采购策略建议 - 基于卡拉杰克矩阵
router.get('/', (_req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT s.id, s.name, s.kraljic_quadrant, s.overall_score, s.performance_grade,
        s.profit_impact_score, s.supply_risk_score,
        COALESCE(SUM(po.total_amount), 0) as total_purchase,
        COUNT(po.id) as order_count
      FROM suppliers s
      LEFT JOIN purchase_orders po ON s.id = po.supplier_id
      GROUP BY s.id
      ORDER BY s.kraljic_quadrant, s.overall_score DESC
    `);
    const columns = result[0]?.columns || [];
    const rows = result[0]?.values || [];
    const suppliers = rows.map(row => {
      const obj: any = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });

    // 根据卡拉杰克象限生成策略建议
    const strategies: any[] = [];
    const quadrantMap: Record<string, { name: string; strategy: string; priority: string; actions: string[] }> = {
      'strategic': { name: '战略供应商', strategy: '战略合作伙伴关系', priority: 'high', actions: ['建立长期战略合作协议', '联合开发与技术创新', '共享需求预测与产能规划', '定期高层互访与绩效评审'] },
      'leverage': { name: '杠杆供应商', strategy: '竞争性招标与价格优化', priority: 'medium', actions: ['定期竞标引入竞争', '批量采购争取折扣', '缩短合同周期保持灵活性', '开发备选供应商'] },
      'bottleneck': { name: '瓶颈供应商', strategy: '供应保障与风险缓解', priority: 'high', actions: ['建立安全库存缓冲', '开发替代供应商', '签订长期保障协议', '建立联合应急预案'] },
      'non_critical': { name: '非关键供应商', strategy: '流程简化与效率提升', priority: 'low', actions: ['简化采购流程', '推行电子化自动采购', '合并订单降低管理成本', '定期评估是否可替代'] },
    };

    for (const s of suppliers) {
      const q = quadrantMap[s.kraljic_quadrant];
      if (q) {
        strategies.push({
          supplier_id: s.id,
          supplier_name: s.name,
          quadrant: s.kraljic_quadrant,
          quadrant_name: q.name,
          strategy: q.strategy,
          priority: q.priority,
          actions: q.actions,
          overall_score: s.overall_score,
          total_purchase: s.total_purchase,
        });
      }
    }

    res.json(strategies);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
