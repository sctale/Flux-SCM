import type { ABCClass, XYZClass } from '@/types/common';

interface ABCXYZStrategy {
  name: string;
  description: string;
  safetyStockPolicy: string;
  replenishmentPolicy: string;
  monitoringLevel: string;
}

/**
 * ABC分类：按年消耗金额占比
 * A类: 累计金额占比前70-80%的物料
 * B类: 累计金额占比70-90%之间的物料
 * C类: 累计金额占比90-100%之间的物料
 */
export function classifyABC(
  items: { id: string; annualConsumptionValue: number }[]
): Map<string, ABCClass> {
  const result = new Map<string, ABCClass>();
  if (items.length === 0) return result;

  const sorted = [...items].sort((a, b) => b.annualConsumptionValue - a.annualConsumptionValue);
  const totalValue = sorted.reduce((sum, item) => sum + item.annualConsumptionValue, 0);

  if (totalValue === 0) {
    sorted.forEach(item => result.set(item.id, 'C'));
    return result;
  }

  let cumulativeValue = 0;
  for (const item of sorted) {
    cumulativeValue += item.annualConsumptionValue;
    const cumulativeRatio = cumulativeValue / totalValue;
    if (cumulativeRatio <= 0.80) {
      result.set(item.id, 'A');
    } else if (cumulativeRatio <= 0.95) {
      result.set(item.id, 'B');
    } else {
      result.set(item.id, 'C');
    }
  }
  return result;
}

/**
 * XYZ分类：按需求变异系数(CV)
 * X类: CV < 0.5 (需求稳定)
 * Y类: 0.5 <= CV < 1.0 (需求波动)
 * Z类: CV >= 1.0 (需求不规律)
 */
export function classifyXYZ(
  items: { id: string; monthlyDemands: number[] }[]
): Map<string, XYZClass> {
  const result = new Map<string, XYZClass>();
  for (const item of items) {
    const cv = calculateCV(item.monthlyDemands);
    if (cv < 0.5) {
      result.set(item.id, 'X');
    } else if (cv < 1.0) {
      result.set(item.id, 'Y');
    } else {
      result.set(item.id, 'Z');
    }
  }
  return result;
}

/**
 * 计算变异系数 (Coefficient of Variation)
 * CV = 标准差 / 平均值
 */
export function calculateCV(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return stdDev / mean;
}

/**
 * 获取ABC-XYZ九宫格策略
 */
export function getABCXYZStrategy(abc: ABCClass, xyz: XYZClass): ABCXYZStrategy {
  const strategies: Record<string, ABCXYZStrategy> = {
    AX: {
      name: 'AX - 高价值·需求稳定',
      description: '高价值且需求稳定，是库存优化的最佳对象',
      safetyStockPolicy: '低安全库存',
      replenishmentPolicy: '高频小批量补货(JIT)，周度采购',
      monitoringLevel: '重点监控，精确预测',
    },
    AY: {
      name: 'AY - 高价值·需求波动',
      description: '高价值且需求有波动，需平衡库存与缺货风险',
      safetyStockPolicy: '中等安全库存',
      replenishmentPolicy: '周度补货，结合季节性调整',
      monitoringLevel: '重点监控，定期审核预测模型',
    },
    AZ: {
      name: 'AZ - 高价值·需求不规律',
      description: '高价值但需求极不规律，管理难度最大',
      safetyStockPolicy: '少量战略缓冲',
      replenishmentPolicy: '按订单采购(MTO)，零库存策略',
      monitoringLevel: '最高级别关注，与客户紧密沟通',
    },
    BX: {
      name: 'BX - 中价值·需求稳定',
      description: '中等价值且需求稳定，适合常规管理',
      safetyStockPolicy: '常规安全库存',
      replenishmentPolicy: '月度批量补货，EOQ模型',
      monitoringLevel: '常规监控，月度回顾',
    },
    BY: {
      name: 'BY - 中价值·需求波动',
      description: '中等价值且需求有波动，需弹性管理',
      safetyStockPolicy: '弹性安全库存',
      replenishmentPolicy: '季度调整补货，结合趋势预测',
      monitoringLevel: '常规监控，季度调整',
    },
    BZ: {
      name: 'BZ - 中价值·需求不规律',
      description: '中等价值但需求不规律，需灵活应对',
      safetyStockPolicy: '低安全库存',
      replenishmentPolicy: '订单驱动补货，小批量试采',
      monitoringLevel: '加强监控，按需调整',
    },
    CX: {
      name: 'CX - 低价值·需求稳定',
      description: '低价值且需求稳定，适合自动化管理',
      safetyStockPolicy: '高安全库存(资金占用低)',
      replenishmentPolicy: '批量采购，季度/半年补货',
      monitoringLevel: '简化管理，自动化补货',
    },
    CY: {
      name: 'CY - 低价值·需求波动',
      description: '低价值且需求有波动，适度关注即可',
      safetyStockPolicy: '宽松安全库存',
      replenishmentPolicy: '季度补货，设置再订货点',
      monitoringLevel: '简化管理，季度回顾',
    },
    CZ: {
      name: 'CZ - 低价值·需求不规律',
      description: '低价值且需求不规律，严控库存风险',
      safetyStockPolicy: '极简库存',
      replenishmentPolicy: '按需零星采购，紧急采购机制',
      monitoringLevel: '简化管理，关注呆滞风险',
    },
  };
  return strategies[abc + xyz];
}

export const abcLabels: Record<ABCClass, string> = { A: 'A类(高价值)', B: 'B类(中价值)', C: 'C类(低价值)' };
export const xyzLabels: Record<XYZClass, string> = { X: 'X类(稳定)', Y: 'Y类(波动)', Z: 'Z类(不规律)' };

export const abcColors: Record<ABCClass, string> = { A: '#FF4D4F', B: '#FAAD14', C: '#52C41A' };
export const xyzColors: Record<XYZClass, string> = { X: '#1677FF', Y: '#FAAD14', Z: '#FF4D4F' };

/**
 * 九宫格颜色映射 (AX=最关键, CZ=最不关键)
 */
export const matrixCellColors: Record<string, string> = {
  AX: '#1677FF', AY: '#4096FF', AZ: '#FAAD14',
  BX: '#597EF7', BY: '#73D13D', BZ: '#FFC53D',
  CX: '#95DE64', CY: '#BAE637', CZ: '#D9D9D9',
};
