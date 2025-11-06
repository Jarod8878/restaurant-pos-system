import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Input, InputNumber, message, Space, Typography, Modal, } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, } from '@ant-design/icons';
import axios from 'axios';
const { Title } = Typography;

const AdminDiscount = () => {
  const [discounts, setDiscounts] = useState([]);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadDiscounts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/admin/discounts');
      setDiscounts(res.data);
    } catch (error) {
      message.error('Failed to load discounts');
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  const onFinish = async (values) => {
    try {
      if (editingId) {
        await axios.put(`http://localhost:3000/api/admin/discounts/${editingId}`, values);
        message.success('Discount updated');
      } else {
        await axios.post('http://localhost:3000/api/admin/discounts', values);
        message.success('Discount created');
      }
      form.resetFields();
      setEditingId(null);
      setIsModalVisible(false);
      loadDiscounts();
    } catch (err) {
      message.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingId(record.discount_id);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this discount?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3000/api/admin/discounts/${id}`);
          message.success('Discount deleted');
          loadDiscounts();
        } catch (err) {
          message.error('Failed to delete discount');
        }
      },
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'discount_id',
    },
    {
      title: 'Code',
      dataIndex: 'code',
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Amount (RM)',
      dataIndex: 'discount_amount',
      render: (val) => `RM ${parseFloat(val).toFixed(2)}`,
    },
    {
      title: 'Points Required',
      dataIndex: 'points_required',
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.discount_id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Admin Discount & Rewards</Title>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          form.resetFields();
          setEditingId(null);
          setIsModalVisible(true);
        }}
        style={{ marginBottom: 20 }}
      >
        New Discount
      </Button>

      <Table
        columns={columns}
        dataSource={discounts}
        rowKey="discount_id"
        bordered
      />

      <Modal
        title={editingId ? 'Edit Discount' : 'Create Discount'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="code"
            label="Discount Code"
            rules={[{ required: true, message: 'Please enter a discount code' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
  name="discount_amount"
  label="Discount Amount (RM)"
  rules={[{ required: true, message: 'Enter discount amount' }]}
>
  <InputNumber
    style={{ width: '100%' }}
    min={1}
    step={1}
    precision={0}
    parser={(v) => (v ? v.replace(/\D/g, '') : '')} 
    formatter={(v) => (v ? v.replace(/\D/g, '') : '')}
    onKeyDown={(e) => {
      const allowed = [
        'Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Home','End'
      ];
      if (e.ctrlKey || e.metaKey) return;
      if (/^\d$/.test(e.key) || allowed.includes(e.key)) return;
      e.preventDefault(); 
    }}
  />
</Form.Item>

<Form.Item
  name="points_required"
  label="Points Required"
  rules={[{ required: true, message: 'Enter required points' }]}
>
  <InputNumber
    style={{ width: '100%' }}
    min={0}
    step={1}
    precision={0}
    parser={(v) => (v ? v.replace(/\D/g, '') : '')}
    formatter={(v) => (v ? v.replace(/\D/g, '') : '')}
    onKeyDown={(e) => {
      const allowed = [
        'Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Home','End'
      ];
      if (e.ctrlKey || e.metaKey) return;
      if (/^\d$/.test(e.key) || allowed.includes(e.key)) return;
      e.preventDefault();
    }}
  />
</Form.Item>


          <Form.Item>
            <Space style={{ justifyContent: 'end', display: 'flex' }}>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" style={{marginTop:0}}>
                {editingId ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDiscount;
