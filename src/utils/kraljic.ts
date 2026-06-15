import type { KraljicQuadrant } from '@/types/common';

interface SupplyRiskInput {
  alternativeCount: number;
  switchingCost: number;
  replacementLeadTime: number;
  productComplexity: number;
}

interface QuadrantStrategy {
  name: string;
  description: string;
  tactics: string[];
  kpis: string[];
}

export function calculateProfitImpact(annualSpend: number, totalSpend: number): number {
  if (totalSpend === 0) return 0;
  const ratio = annualSpend / totalSpend;
  const score = Math.min(100, Math.max(0, ratio * 100 * 5 + Math.log10(ratio * 100 + 1) * 20));
  return Math.round(score * 10) / 10;
}

export function calculateSupplyRisk(input: SupplyRiskInput): number {
  const { alternativeCount, switchingCost, replacementLeadTime, productComplexity } = input;
  const countScore = alternativeCount <= 1 ? 25 : alternativeCount <= 3 ? 20 : alternativeCount <= 10 ? 10 : 3;
  const switchScore = (switchingCost / 10) * 25;
  const leadScore = replacementLeadTime <= 7 ? 3 : replacementLeadTime <= 30 ? 10 : replacementLeadTime <= 90 ? 18 : 25;
  const complexScore = (productComplexity / 10) * 25;
  return Math.round(Math.min(100, countScore + switchScore + leadScore + complexScore) * 10) / 10;
}

export function classifyKraljic(profitImpact: number, supplyRisk: number): KraljicQuadrant {
  const profitThreshold = 50;
  const riskThreshold = 50;
  if (profitImpact >= profitThreshold && supplyRisk >= riskThreshold) return 'strategic';
  if (profitImpact >= profitThreshold && supplyRisk < riskThreshold) return 'leverage';
  if (profitImpact < profitThreshold && supplyRisk >= riskThreshold) return 'bottleneck';
  return 'non_critical';
}

export function getQuadrantStrategy(quadrant: KraljicQuadrant): QuadrantStrategy {
  const strategies: Record<KraljicQuadrant, QuadrantStrategy> = {
    strategic: {
      name: '深度合作',
      description: '高利润影响 + 高供应风险，需建立战略联盟关系',
      tactics: ['建立长期战略合作协议', '联合研发与技术共享', '供应商联合实验室', '共享生产计划与需求预测', '高层定期互访与沟通'],
      kpis: ['战略合作项目数', '联合研发成果数', '供应保障率 ≥ 98%'],
    },
    leverage: {
      name: '竞争性招标',
      description: '高利润影响 + 低供应风险，充分利用买方市场地位',
      tactics: ['竞争性招标采购', '集中采购提升议价能力', '签订长期固定价格合同', '多供应商竞价机制', '监控市场价格波动'],
      kpis: ['采购成本降低率', '合同价格竞争力', '供应商响应速度'],
    },
    bottleneck: {
      name: '保障供应',
      description: '低利润影响 + 高供应风险，确保供应连续性',
      tactics: ['建立安全库存机制', '开发替代供应商', '签订保障性供应协议', '提前锁定产能', '产品标准化减少定制'],
      kpis: ['供应中断次数 = 0', '安全库存达标率', '替代供应商开发数'],
    },
    non_critical: {
      name: '简化流程',
      description: '低利润影响 + 低供应风险，最小化管理成本',
      tactics: ['电子采购目录自助下单', '长期框架协议简化流程', '1-2家供应商集中采购', '低层级审批授权', '自动化采购流程'],
      kpis: ['采购处理时间 < 24h', '交易成本 < ¥50/单', '目录采购率 > 90%'],
    },
  };
  return strategies[quadrant];
}

export const quadrantLabels: Record<KraljicQuadrant, string> = {
  strategic: '战略型',
  leverage: '杠杆型',
  bottleneck: '瓶颈型',
  non_critical: '非关键型',
};

export const quadrantColors: Record<KraljicQuadrant, string> = {
  strategic: '#1677FF',
  leverage: '#52C41A',
  bottleneck: '#FAAD14',
  non_critical: '#8C8C8C',
};
