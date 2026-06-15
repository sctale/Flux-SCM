import React from 'react';
import { Table, Tag } from 'antd';
import type { SupplierQualification } from '@/types/supplier';

interface QualificationTableProps {
  qualifications: SupplierQualification[];
}

const statusMap: Record<SupplierQualification['status'], { label: string; color: string }> = {
  valid: { label: '有效', color: 'success' },
  expiring: { label: '即将到期', color: 'warning' },
  expired: { label: '已过期', color: 'error' },
};

const QualificationTable: React.FC<QualificationTableProps> = ({ qualifications }) => {
  const columns = [
    { title: '证书类型', dataIndex: 'certType', key: 'certType' },
    { title: '证书编号', dataIndex: 'certNumber', key: 'certNumber' },
    { title: '发证日期', dataIndex: 'issueDate', key: 'issueDate' },
    { title: '有效期至', dataIndex: 'expiryDate', key: 'expiryDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: SupplierQualification['status']) => <Tag color={statusMap[s].color}>{statusMap[s].label}</Tag> },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
  ];

  return <Table rowKey="id" dataSource={qualifications} columns={columns} size="small" pagination={false} />;
};

export default QualificationTable;
