import React from 'react';
import { Drawer, Typography, Collapse } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface HelpSection {
  title: string;
  content: string;
}

interface HelpPanelProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  sections: HelpSection[];
}

const HelpPanel: React.FC<HelpPanelProps> = ({ visible, onClose, title = '使用帮助', sections }) => (
  <Drawer
    title={<><QuestionCircleOutlined style={{ marginRight: 8 }} />{title}</>}
    placement="right"
    onClose={onClose}
    open={visible}
    width={380}
    styles={{ body: { padding: '12px 16px' } }}
  >
    <Collapse defaultActiveKey={sections.map((_, i) => String(i))} ghost>
      {sections.map((section, idx) => (
        <Panel header={<Text strong>{section.title}</Text>} key={String(idx)}>
          <Paragraph style={{ whiteSpace: 'pre-line', color: '#5a5a5a', fontSize: 13 }}>
            {section.content}
          </Paragraph>
        </Panel>
      ))}
    </Collapse>
  </Drawer>
);

export default HelpPanel;
