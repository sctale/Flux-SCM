import type { PerformanceGrade } from '@/types/common';

interface QCDSInput {
  qualityScore: number;
  costScore: number;
  deliveryScore: number;
  serviceScore: number;
}

interface QCDSWeights {
  quality: number;
  cost: number;
  delivery: number;
  service: number;
}

interface QCDSResult {
  overallScore: number;
  grade: PerformanceGrade;
  weights: QCDSWeights;
}

const DEFAULT_WEIGHTS: QCDSWeights = {
  quality: 0.30,
  cost: 0.25,
  delivery: 0.30,
  service: 0.15,
};

export function calculateQCDS(input: QCDSInput, weights: Partial<QCDSWeights> = {}): QCDSResult {
  const w = { ...DEFAULT_WEIGHTS, ...weights };
  const overallScore = input.qualityScore * w.quality + input.costScore * w.cost + input.deliveryScore * w.delivery + input.serviceScore * w.service;
  const roundedScore = Math.round(overallScore * 10) / 10;
  return { overallScore: roundedScore, grade: getPerformanceGrade(roundedScore), weights: w };
}

export function getPerformanceGrade(score: number): PerformanceGrade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  return 'D';
}

export function calculateDeliveryScore(totalOrders: number, onTimeOrders: number): number {
  if (totalOrders === 0) return 100;
  return Math.round((onTimeOrders / totalOrders) * 100);
}

export function calculateQualityScore(totalDeliveries: number, qualifiedDeliveries: number): number {
  if (totalDeliveries === 0) return 100;
  return Math.round((qualifiedDeliveries / totalDeliveries) * 100);
}

export const gradeColors: Record<PerformanceGrade, string> = {
  A: '#52C41A',
  B: '#1677FF',
  C: '#FAAD14',
  D: '#FF4D4F',
};
