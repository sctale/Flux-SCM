import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Row, Col, Card, Tag } from 'antd';
import type { Supplier } from '@/types/supplier';
import type { KraljicQuadrant } from '@/types/common';
import { quadrantLabels, quadrantColors, getQuadrantStrategy } from '@/utils/kraljic';

interface KraljicViewProps {
  suppliers: Supplier[];
}

const quadrants: KraljicQuadrant[] = ['strategic', 'leverage', 'bottleneck', 'non_critical'];

const KraljicView: React.FC<KraljicViewProps> = ({ suppliers }) => {
  const scatterData = suppliers
    .filter((s) => s.profitImpactScore !== undefined && s.supplyRiskScore !== undefined)
    .map((s) => ({
      value: [s.profitImpactScore, s.supplyRiskScore],
      name: s.shortName || s.name,
      itemStyle: { color: s.kraljicQuadrant ? quadrantColors[s.kraljicQuadrant] : '#8C8C8C' },
    }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: { data: { name: string; value: number[] } }) =>
        `${params.data.name}<br/>利润影响: ${params.data.value[0]}<br/>供应风险: ${params.data.value[1]}`,
    },
    grid: { left: 60, right: 40, top: 40, bottom: 60 },
    xAxis: { name: '利润影响 →', type: 'value', min: 0, max: 100, splitLine: { lineStyle: { type: 'dashed' } }, nameLocation: 'middle', nameGap: 30 },
    yAxis: { name: '供应风险 →', type: 'value', min: 0, max: 100, splitLine: { lineStyle: { type: 'dashed' } }, nameLocation: 'middle', nameGap: 40 },
    series: [
      {
        type: 'scatter',
        data: scatterData,
        symbolSize: 20,
        label: { show: true, formatter: '{b}', position: 'top', fontSize: 11 },
      },
    ],
    graphic: [
      { type: 'rect', left: 60, top: 40, shape: { width: '50%', height: '50%' }, style: { fill: 'rgba(22,119,255,0.06)' } },
      { type: 'rect', right: 40, top: 40, shape: { width: '50%', height: '50%' }, style: { fill: 'rgba(82,196,26,0.06)' } },
      { type: 'rect', left: 60, bottom: 60, shape: { width: '50%', height: '50%' }, style: { fill: 'rgba(250,173,20,0.06)' } },
      { type: 'rect', right: 40, bottom: 60, shape: { width: '50%', height: '50%' }, style: { fill: 'rgba(140,140,140,0.06)' } },
      { type: 'text', left: '25%', top: 50, style: { text: '战略型', fill: quadrantColors.strategic, fontSize: 14, fontWeight: 'bold', opacity: 0.5 } },
      { type: 'text', right: '25%', top: 50, style: { text: '杠杆型', fill: quadrantColors.leverage, fontSize: 14, fontWeight: 'bold', opacity: 0.5 } },
      { type: 'text', left: '25%', bottom: 70, style: { text: '瓶颈型', fill: quadrantColors.bottleneck, fontSize: 14, fontWeight: 'bold', opacity: 0.5 } },
      { type: 'text', right: '25%', bottom: 70, style: { text: '非关键型', fill: quadrantColors.non_critical, fontSize: 14, fontWeight: 'bold', opacity: 0.5 } },
    ],
  };

  return (
    <div>
      <ReactECharts option={option} style={{ height: 400, marginBottom: 16 }} />
      <Row gutter={[12, 12]}>
        {quadrants.map((q) => {
          const strategy = getQuadrantStrategy(q);
          return (
            <Col span={6} key={q}>
              <Card size="small" title={<Tag color={quadrantColors[q]}>{quadrantLabels[q]}</Tag>} styles={{ body: { padding: 12 } }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{strategy.name}</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{strategy.description}</div>
                <div style={{ fontSize: 12 }}>
                  {strategy.tactics.slice(0, 3).map((t, i) => (
                    <div key={i} style={{ marginBottom: 2 }}>• {t}</div>
                  ))}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default KraljicView;
