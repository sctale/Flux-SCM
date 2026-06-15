import { describe, it, expect } from 'vitest';
import { generateMaterialCode } from '@/utils/coding';

describe('generateMaterialCode', () => {
  it('should generate 5-level code', () => {
    expect(generateMaterialCode({ category: 'JJ', materialType: 'ST', specification: 'M8', supplierCode: 'JM', batch: '001' })).toBe('JJ-ST-M8-JM-001');
  });
  it('should handle missing optional parts', () => {
    expect(generateMaterialCode({ category: 'YJ', materialType: 'CU', specification: 'R10' })).toBe('YJ-CU-R10');
  });
});
