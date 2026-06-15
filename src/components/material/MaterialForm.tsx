import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Row, Col } from 'antd';
import type { MaterialFormData } from '@/types/material';
import { generateMaterialCode, categoryCodeMap, materialTypeCodeMap } from '@/utils/coding';

interface MaterialFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MaterialFormData) => void;
}

const MaterialForm: React.FC<MaterialFormProps> = ({ open, onClose, onSubmit }) => {
  const [form] = Form.useForm<MaterialFormData>();
  const [autoCode, setAutoCode] = useState('');

  const category = Form.useWatch('category', form);
  const materialType = Form.useWatch('materialType', form);

  useEffect(() => {
    if (category && materialType) {
      const code = generateMaterialCode({
        category: categoryCodeMap[category] || category,
        materialType: materialTypeCodeMap[materialType] || materialType,
        specification: '0001',
      });
      setAutoCode(code);
      form.setFieldValue('code', code);
    }
  }, [category, materialType, form]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setAutoCode('');
    }
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  return (
    <Modal title="新增物料" open={open} onOk={handleOk} onCancel={onClose} width={640} destroyOnClose>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="category" label="物料类别" rules={[{ required: true, message: '请选择物料类别' }]}>
              <Select placeholder="请选择类别" options={Object.keys(categoryCodeMap).map((k) => ({ value: k, label: k }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="materialType" label="材质类型" rules={[{ required: true, message: '请选择材质类型' }]}>
              <Select placeholder="请选择材质" options={Object.keys(materialTypeCodeMap).map((k) => ({ value: k, label: k }))} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="code" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]} extra={autoCode ? `自动生成: ${autoCode}` : '选择类别和材质后自动生成'}>
          <Input placeholder="物料编码" />
        </Form.Item>
        <Form.Item name="name" label="物料名称" rules={[{ required: true, message: '请输入物料名称' }]}>
          <Input placeholder="请输入物料名称" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="specification" label="规格型号">
              <Input placeholder="请输入规格型号" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="unit" label="计量单位" rules={[{ required: true, message: '请输入计量单位' }]}>
              <Select placeholder="请选择单位" options={['个', '件', 'kg', 'm', '套', '箱', '片', '根'].map((u) => ({ value: u, label: u }))} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="safetyStock" label="安全库存">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="leadTime" label="采购提前期(天)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="drawingNo" label="图号">
          <Input placeholder="请输入图号" />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={2} placeholder="请输入备注信息" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MaterialForm;
