import { describe, it, expect } from 'vitest';
import { classifyABC, classifyXYZ, calculateCV, getABCXYZStrategy } from '@/utils/abcxyz';

describe('classifyABC', () => {
  it('should classify items by cumulative value', () => {
    const items = [
      { id: '1', annualConsumptionValue: 70000 },
      { id: '2', annualConsumptionValue: 20000 },
      { id: '3', annualConsumptionValue: 5000 },
      { id: '4', annualConsumptionValue: 3000 },
      { id: '5', annualConsumptionValue: 2000 },
    ];
    const result = classifyABC(items);
    expect(result.get('1')).toBe('A');
    expect(result.get('5')).toBe('C');
  });
  it('should handle empty array', () => {
    expect(classifyABC([]).size).toBe(0);
  });
});

describe('classifyXYZ', () => {
  it('should classify X for stable demand', () => {
    const items = [{ id: '1', monthlyDemands: [100, 102, 98, 101, 99, 100] }];
    const result = classifyXYZ(items);
    expect(result.get('1')).toBe('X');
  });
  it('should classify Z for erratic demand', () => {
    const items = [{ id: '1', monthlyDemands: [0, 0, 500, 0, 0, 10] }];
    const result = classifyXYZ(items);
    expect(result.get('1')).toBe('Z');
  });
});

describe('calculateCV', () => {
  it('should return 0 for constant values', () => {
    expect(calculateCV([100, 100, 100])).toBe(0);
  });
  it('should return 0 for empty array', () => {
    expect(calculateCV([])).toBe(0);
  });
});

describe('getABCXYZStrategy', () => {
  it('should return strategy for each cell', () => {
    const strategy = getABCXYZStrategy('A', 'X');
    expect(strategy.name).toContain('AX');
    expect(strategy.safetyStockPolicy).toBeTruthy();
  });
});
