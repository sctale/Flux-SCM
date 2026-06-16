import React from 'react';
import { Typography, Collapse, Button, Tooltip } from 'antd';
import { QuestionCircleOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface HelpSection {
  title: string;
  content: string;
}

interface HelpPanelProps {
  visible: boolean;
  onClose: () => void;
  onOpen?: () => void;
  title?: string;
  sections: HelpSection[];
}

const HelpPanel: React.FC<HelpPanelProps> = ({ visible, onClose, onOpen, title = '使用帮助', sections }) => (
  <div style={{ position: 'relative', height: '100%' }}>
    {/* 展开/收起按钮 */}
    {!visible && onOpen && (
      <Tooltip title="展开帮助" placement="left">
        <Button
          type="text"
          icon={<QuestionCircleOutlined />}
          onClick={onOpen}
          style={{
            position: 'absolute', right: -8, top: 8, zIndex: 10,
            background: '#fff', border: '1px solid #e8e8e8', borderRadius: '4px 0 0 4px',
            boxShadow: '-2px 0 6px rgba(0,0,0,0.06)',
          }}
        />
      </Tooltip>
    )}

    {/* 帮助面板 */}
    {visible && (
      <div style={{
        height: '100%',
        borderLeft: '1px solid #f0f0f0',
        background: '#fafafa',
        padding: '12px 16px',
        overflow: 'auto',
        minWidth: 280,
        maxWidth: 340,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text strong style={{ fontSize: 14 }}>
            <QuestionCircleOutlined style={{ marginRight: 6, color: '#1677ff' }} />
            {title}
          </Text>
          <Tooltip title="收起帮助" placement="left">
            <Button type="text" size="small" icon={<RightOutlined />} onClick={onClose} />
          </Tooltip>
        </div>
        <Collapse
          defaultActiveKey={sections.map((_, i) => String(i))}
          ghost
          items={sections.map((section, idx) => ({
            key: String(idx),
            label: <Text strong style={{ fontSize: 13 }}>{section.title}</Text>,
            children: (
              <Paragraph style={{ whiteSpace: 'pre-line', color: '#5a5a5a', fontSize: 12, marginBottom: 4 }}>
                {section.content}
              </Paragraph>
            ),
          }))}
        />
      </div>
    )}
  </div>
);

export default HelpPanel;
