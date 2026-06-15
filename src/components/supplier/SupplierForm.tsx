import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Divider } from 'antd';
import type { Supplier, SupplierFormData } from '@/types/supplier';

interface SupplierFormProps {
  open: boolean;
  editingSupplier: Supplier | null;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ open, editingSupplier, onClose, onSubmit }) => {
  const [form] = Form.useForm<SupplierFormData>();

  useEffect(() => {
    if (open) {
      if (editingSupplier) {
        form.setFieldsValue({
          name: editingSupplier.name,
          shortName: editingSupplier.shortName,
          unifiedCode: editingSupplier.unifiedCode,
          category: editingSupplier.category,
          address: editingSupplier.address,
          contactPerson: editingSupplier.contactPerson,
          contactPhone: editingSupplier.contactPhone,
          contactEmail: editingSupplier.contactEmail,
          bankName: editingSupplier.bankName,
          bankAccount: editingSupplier.bankAccount,
          remark: editingSupplier.remark,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingSupplier, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  return (
    <Modal title={editingSupplier ? '编辑供应商' : '新增供应商'} open={open} onOk={handleOk} onCancel={onClose} width={720} destroyOnClose>
      <Form form={form} layout="vertical">
        <Divider orientation="left" plain>基本信息</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="name" label="供应商名称" rules={[{ required: true, message: '请输入供应商名称' }]}>
              <Input placeholder="请输入供应商全称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="shortName" label="简称">
              <Input placeholder="请输入简称" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="unifiedCode" label="统一社会信用代码">
              <Input placeholder="请输入统一社会信用代码" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="category" label="供应类别">
              <Select placeholder="请选择供应类别" allowClear
                options={[
                  { value: '原材料', label: '原材料' },
                  { value: '零部件', label: '零部件' },
                  { value: '外协加工', label: '外协加工' },
                  { value: '包装材料', label: '包装材料' },
                  { value: '设备工具', label: '设备工具' },
                  { value: '其他', label: '其他' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>联系信息</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="contactPerson" label="联系人">
              <Input placeholder="请输入联系人姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="contactPhone" label="联系电话">
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="contactEmail" label="联系邮箱">
              <Input placeholder="请输入联系邮箱" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="address" label="地址">
              <Input placeholder="请输入地址" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>财务信息</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="bankName" label="开户银行">
              <Input placeholder="请输入开户银行" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="bankAccount" label="银行账号">
              <Input placeholder="请输入银行账号" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={3} placeholder="请输入备注信息" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SupplierForm;
