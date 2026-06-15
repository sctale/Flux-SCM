import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Row, Col, Tag } from 'antd';
import type { Material } from '@/types/material';
import type { ABCClass, XYZClass } from '@/types/common';
import { getABCXYZStrategy, matrixCellColors, abcLabels, xyzLabels } from '@/utils/abcxyz';

interface ABCXYZViewProps {
  materials: Material[];
}

const abcClasses: ABCClass[] = ['A', 'B', 'C'];
const xyzClasses: XYZClass[] = ['X', 'Y', 'Z'];

const ABCXYZView: React.FC<ABCXYZViewProps> = ({ materials }) => {
  const matrixCount: Record<string, number> = {};
  for (const m of materials) {
    if (m.abcClass && m.xyzClass) {
      const key = m.abcClass + m.xyzClass;
      matrixCount[key] = (matrixCount[key] || 0) + 1;
    }
  }

  const heatData: { value: number[]; itemStyle: { color: string } }[] = [];
  for (let ai = 0; ai < abcClasses.length; ai++) {
    for (let xi = 0; xi < xyzClasses.length; xi++) {
      const key = abcClasses[ai] + xyzClasses[xi];
      heatData.push({
        value: [xi, ai, matrixCount[key] || 0],
        itemStyle: { color: matrixCellColors[key] },
      });
    }
  }

  const option = {
    tooltip: {
      formatter: (params: { value: number[] }) => {
        const abc = abcClasses[params.value[1]];
        const xyz = xyzClasses[params.value[0]];
        const count = params.value[2];
        const strategy = getABCXYZStrategy(abc, xyz);
        return `<b>${strategy.name}</b><br/>物料数量: ${count}<br/>${strategy.description}`;
      },
    },
    grid: { left: 80, right: 40, top: 20, bottom: 60 },
    xAxis: {
      type: 'category',
      data: xyzClasses.map((x) => xyzLabels[x]),
      splitArea: { show: true },
      axisLabel: { fontSize: 13 },
    },
    yAxis: {
      type: 'category',
      data: abcClasses.map((a) => abcLabels[a]),
      splitArea: { show: true },
      axisLabel: { fontSize: 13 },
    },
    series: [
      {
        type: 'heatmap',
        data: heatData,
        label: {
          show: true,
          formatter: (params: { value: number[] }) => `${params.value[2]}`,
          fontSize: 20,
          fontWeight: 'bold',
          color: '#fff',
        },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } },
      },
    ],
  };

  return (
    <div>
      <ReactECharts option={option} style={{ height: 320, marginBottom: 16 }} />
      <Row gutter={[12, 12]}>
        {abcClasses.flatMap((abc) =>
          xyzClasses.map((xyz) => {
            const key = abc + xyz;
            const strategy = getABCXYZStrategy(abc, xyz);
            return (
              <Col span={8} key={key}>
                <Card size="small" title={<Tag color={matrixCellColors[key]}>{strategy.name}</Tag>} styles={{ body: { padding: 10 } }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{strategy.description}</div>
                  <div style={{ fontSize: 12 }}>安全库存: {strategy.safetyStockPolicy}</div>
                  <div style={{ fontSize: 12 }}>补货策略: {strategy.replenishmentPolicy}</div>
                </Card>
              </Col>
            );
          })
        )}
      </Row>
    </div>
  );
};

export default ABCXYZView;
