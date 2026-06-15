import type { KraljicQuadrant, PerformanceGrade, RiskLevel, AlertType } from './common';

export type SupplierStatus = 'pending' | 'trial' | 'active' | 'suspended' | 'blacklisted';

export interface Supplier {
  id: string;
  name: string;
  shortName?: string;
  unifiedCode?: string;
  category?: string;
  kraljicQuadrant?: KraljicQuadrant;
  profitImpactScore: number;
  supplyRiskScore: number;
  performanceGrade?: PerformanceGrade;
  overallScore: number;
  qualityScore: number;
  costScore: number;
  deliveryScore: number;
  serviceScore: number;
  status: SupplierStatus;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  bankName?: string;
  bankAccount?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierQualification {
  id: string;
  supplierId: string;
  certType: string;
  certNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  filePath?: string;
  status: 'valid' | 'expiring' | 'expired';
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierContact {
  id: string;
  supplierId: string;
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  isPrimary: boolean;
  remark?: string;
}

export interface RiskAlert {
  id: string;
  supplierId?: string;
  alertType: AlertType;
  level: RiskLevel;
  title: string;
  description?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  resolvedAt?: string;
  createdAt: string;
}

export interface SupplierFormData {
  name: string;
  shortName?: string;
  unifiedCode?: string;
  category?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  bankName?: string;
  bankAccount?: string;
  remark?: string;
}
