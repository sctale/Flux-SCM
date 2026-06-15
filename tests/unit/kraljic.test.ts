import { describe, it, expect } from 'vitest';
import { classifyKraljic, calculateProfitImpact, calculateSupplyRisk, getQuadrantStrategy } from '@/utils/kraljic';

describe('calculateProfitImpact', () => {
  it('should return 0 for zero spend', () => {
    expect(calculateProfitImpact(0, 100000)).toBe(0);
  });
  it('should return high score for high spend ratio', () => {
    const score = calculateProfitImpact(50000, 100000);
    expect(score).toBeGreaterThan(70);
  });
  it('should return low score for low spend ratio', () => {
    const score = calculateProfitImpact(500, 100000);
    expect(score).toBeLessThan(30);
  });
});

describe('calculateSupplyRisk', () => {
  it('should return high risk for single supplier', () => {
    const score = calculateSupplyRisk({ alternativeCount: 1, switchingCost: 8, replacementLeadTime: 120, productComplexity: 9 });
    expect(score).toBeGreaterThan(70);
  });
  it('should return low risk for many alternatives', () => {
    const score = calculateSupplyRisk({ alternativeCount: 15, switchingCost: 1, replacementLeadTime: 7, productComplexity: 2 });
    expect(score).toBeLessThan(30);
  });
});

describe('classifyKraljic', () => {
  it('should classify as strategic', () => expect(classifyKraljic(85, 80)).toBe('strategic'));
  it('should classify as leverage', () => expect(classifyKraljic(75, 25)).toBe('leverage'));
  it('should classify as bottleneck', () => expect(classifyKraljic(20, 85)).toBe('bottleneck'));
  it('should classify as non_critical', () => expect(classifyKraljic(15, 10)).toBe('non_critical'));
});

describe('getQuadrantStrategy', () => {
  it('should return correct strategies', () => {
    expect(getQuadrantStrategy('strategic').name).toBe('深度合作');
    expect(getQuadrantStrategy('leverage').name).toBe('竞争性招标');
    expect(getQuadrantStrategy('bottleneck').name).toBe('保障供应');
    expect(getQuadrantStrategy('non_critical').name).toBe('简化流程');
  });
});
