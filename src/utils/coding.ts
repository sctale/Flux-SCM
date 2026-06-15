interface MaterialCodeInput {
  category: string;
  materialType: string;
  specification: string;
  supplierCode?: string;
  batch?: string;
}

export function generateMaterialCode(input: MaterialCodeInput): string {
  const parts = [input.category, input.materialType, input.specification];
  if (input.supplierCode) parts.push(input.supplierCode);
  if (input.batch) parts.push(input.batch);
  return parts.join('-');
}

export const categoryCodeMap: Record<string, string> = {
  '齿轮类': 'CL', '元件类': 'YJ', '弹簧类': 'TH', '磁钢类': 'CG',
  '机加类': 'JJ', '试验类': 'SY', '橡胶类': 'XJ', '电机类': 'DJ',
  '包装箱': 'BZ', '电刷类': 'DS', '印制板': 'YZ', '灌胶类': 'GJ',
};

export const materialTypeCodeMap: Record<string, string> = {
  '不锈钢': 'SS', '碳钢': 'CS', '铝合金': 'AL', '铜': 'CU',
  '橡胶': 'RB', '塑料': 'PL', '陶瓷': 'CE', '磁材': 'MG',
};
