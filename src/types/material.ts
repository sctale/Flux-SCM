import type { ABCClass, XYZClass } from './common';

export interface Material {
  id: string;
  code: string;
  name: string;
  specification?: string;
  unit: string;
  category?: string;
  materialType?: string;
  safetyStock: number;
  leadTime: number;
  drawingNo?: string;
  abcClass?: ABCClass;
  xyzClass?: XYZClass;
  annualConsumptionValue?: number;
  coefficientOfVariation?: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialSupplier {
  id: string;
  materialId: string;
  supplierId: string;
  unitPrice?: number;
  minOrderQty: number;
  leadTimeDays?: number;
  isPreferred: boolean;
  lastQuoteDate?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialFormData {
  code?: string;
  name: string;
  specification?: string;
  unit: string;
  category?: string;
  materialType?: string;
  safetyStock?: number;
  leadTime?: number;
  drawingNo?: string;
  remark?: string;
}

export interface MaterialDemandRecord {
  id: string;
  materialId: string;
  month: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}
