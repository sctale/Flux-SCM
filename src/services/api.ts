const API_BASE = 'http://localhost:3456/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// snake_case -> camelCase 转换
export function toCamelCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = toCamelCase(obj[key]);
  }
  return result;
}

// camelCase -> snake_case 转换
export function toSnakeCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
    result[snakeKey] = toSnakeCase(obj[key]);
  }
  return result;
}

// 供应商 API
export const supplierApi = {
  list: (params?: { search?: string; quadrant?: string; grade?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.quadrant) query.set('quadrant', params.quadrant);
    if (params?.grade) query.set('grade', params.grade);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<{ data: any[]; total: number }>(`/suppliers${qs ? '?' + qs : ''}`);
  },
  get: (id: string) => request<{ data: any }>(`/suppliers/${id}`),
  create: (data: any) => request<{ data: any }>('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<{ data: any }>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<{ success: boolean }>(`/suppliers/${id}`, { method: 'DELETE' }),
  kraljic: () => request<{ data: any[] }>('/suppliers/kraljic'),
};

// 物料 API
export const materialApi = {
  list: (params?: { search?: string; abcClass?: string; xyzClass?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.abcClass) query.set('abc', params.abcClass);
    if (params?.xyzClass) query.set('xyz', params.xyzClass);
    const qs = query.toString();
    return request<{ data: any[]; total: number }>(`/materials${qs ? '?' + qs : ''}`);
  },
  get: (id: string) => request<{ data: any }>(`/materials/${id}`),
  create: (data: any) => request<{ data: any }>('/materials', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<{ data: any }>(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<{ success: boolean }>(`/materials/${id}`, { method: 'DELETE' }),
  abcxyz: () => request<{ data: any[] }>('/materials/abcxyz'),
};

// 订单 API
export const orderApi = {
  list: (params?: { status?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<{ data: any[]; total: number }>(`/orders${qs ? '?' + qs : ''}`);
  },
  get: (id: string) => request<{ data: any }>(`/orders/${id}`),
  create: (data: any) => request<{ data: any }>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<{ data: any }>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<{ success: boolean }>(`/orders/${id}`, { method: 'DELETE' }),
};

// 看板 API
export const dashboardApi = {
  stats: () => request<{ data: any }>('/dashboard/stats'),
  costTrend: () => request<{ data: any }>('/dashboard/cost-trend'),
  riskAlerts: () => request<{ data: any }>('/dashboard/risk-alerts'),
};

// 风险预警 API
export const riskAlertApi = {
  list: () => request<{ data: any[] }>('/risk-alerts'),
  acknowledge: (id: string) => request<{ data: any }>(`/risk-alerts/${id}/acknowledge`, { method: 'PUT' }),
  resolve: (id: string) => request<{ data: any }>(`/risk-alerts/${id}/resolve`, { method: 'PUT' }),
};
