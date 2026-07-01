export type KraljicQuadrant = 'strategic' | 'leverage' | 'bottleneck' | 'non_critical';
export type PerformanceGrade = 'A' | 'B' | 'C' | 'D' | 'F';
export type RiskLevel = 'high' | 'medium' | 'low';
export type AlertType = 'cert_expiry' | 'delivery_delay' | 'quality_abnormal' | 'performance_drop' | 'single_source' | 'concentration';
export type ABCClass = 'A' | 'B' | 'C';
export type XYZClass = 'X' | 'Y' | 'Z';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
