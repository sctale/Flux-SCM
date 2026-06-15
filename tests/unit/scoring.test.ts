import { describe, it, expect } from 'vitest';
import { calculateQCDS, getPerformanceGrade } from '@/utils/scoring';

describe('calculateQCDS', () => {
  it('should calculate weighted score correctly', () => {
    const result = calculateQCDS({ qualityScore: 90, costScore: 80, deliveryScore: 85, serviceScore: 70 });
    expect(result.overallScore).toBe(83);
  });
  it('should return 100 for perfect scores', () => {
    const result = calculateQCDS({ qualityScore: 100, costScore: 100, deliveryScore: 100, serviceScore: 100 });
    expect(result.overallScore).toBe(100);
  });
});

describe('getPerformanceGrade', () => {
  it('should return A for >= 90', () => expect(getPerformanceGrade(90)).toBe('A'));
  it('should return B for 80-89', () => expect(getPerformanceGrade(80)).toBe('B'));
  it('should return C for 70-79', () => expect(getPerformanceGrade(70)).toBe('C'));
  it('should return D for < 70', () => expect(getPerformanceGrade(69)).toBe('D'));
});
