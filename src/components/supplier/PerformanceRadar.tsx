import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { Supplier } from '@/types/supplier';

interface PerformanceRadarProps {
  suppliers: Supplier[];
}

const PerformanceRadar: React.FC<PerformanceRadarProps> = ({ suppliers }) => {
  const displaySuppliers = suppliers.slice(0, 5);

  const colors = ['#1677FF', '#52C41A', '#FAAD14', '#FF4D4F', '#722ED1'];

  const option = {
    tooltip: {},
    legend: {
      data: displaySuppliers.map((s) => s.shortName || s.name),
      bottom: 0,
    },
    radar: {
      indicator: [
        { name: '质量', max: 100 },
        { name: '成本', max: 100 },
        { name: '交付', max: 100 },
        { name: '服务', max: 100 },
      ],
      shape: 'polygon',
      splitNumber: 5,
      axisName: { color: '#333', fontSize: 13 },
    },
    series: [
      {
        type: 'radar',
        data: displaySuppliers.map((s, i) => ({
          value: [s.qualityScore, s.costScore, s.deliveryScore, s.serviceScore],
          name: s.shortName || s.name,
          lineStyle: { color: colors[i % colors.length] },
          areaStyle: { color: colors[i % colors.length], opacity: 0.1 },
          itemStyle: { color: colors[i % colors.length] },
        })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 350 }} />;
};

export default PerformanceRadar;
