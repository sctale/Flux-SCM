import React from 'react';
import ReactECharts from 'echarts-for-react';

interface CostTrendProps {
  data?: { month: string; amount: number }[];
}

const defaultData = [
  { month: '2025-01', amount: 1280000 },
  { month: '2025-02', amount: 1150000 },
  { month: '2025-03', amount: 1420000 },
  { month: '2025-04', amount: 1380000 },
  { month: '2025-05', amount: 1560000 },
  { month: '2025-06', amount: 1490000 },
  { month: '2025-07', amount: 1620000 },
  { month: '2025-08', amount: 1580000 },
  { month: '2025-09', amount: 1710000 },
  { month: '2025-10', amount: 1650000 },
  { month: '2025-11', amount: 1780000 },
  { month: '2025-12', amount: 1850000 },
];

const CostTrend: React.FC<CostTrendProps> = ({ data = defaultData }) => {
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: { name: string; value: number }[]) => `${params[0].name}<br/>采购金额: ¥${params[0].value.toLocaleString()}`,
    },
    grid: { left: 80, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: data.map((d) => d.month), boundaryGap: false },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `¥${(v / 10000).toFixed(0)}万` } },
    series: [
      {
        type: 'line',
        data: data.map((d) => d.amount),
        smooth: true,
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,119,255,0.3)' }, { offset: 1, color: 'rgba(22,119,255,0.02)' }] } },
        lineStyle: { color: '#1677FF', width: 2 },
        itemStyle: { color: '#1677FF' },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 300 }} />;
};

export default CostTrend;
