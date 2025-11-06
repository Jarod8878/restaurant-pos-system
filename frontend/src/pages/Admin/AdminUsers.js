import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Typography, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const AdminUsers = () => {
  const [admins, setAdmins] = useState([]);
  const [form] = Form.useForm();
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadAdmins = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/admin/all');
      setAdmins(res.data.admins || []);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      message.error('Failed to load admin users');
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleSubmit = async (values) => {
    try {
      if (editingAdminId) {
        await axios.put(`http://localhost:3000/api/admin/update/${editingAdminId}`, values);
        message.success('Admin updated successfully');
      } else {
        await axios.post('http://localhost:3000/api/admin/register', values);
        message.success('New admin created successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingAdminId(null);
      loadAdmins();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingAdminId(record.user_id);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this admin?',
      okText: 'Confirm',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3000/api/admin/delete/${id}`);
          message.success('Admin deleted successfully');
          loadAdmins();
        } catch (err) {
          console.error(err);
          message.error('Failed to delete admin');
        }
      },
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'user_id' },
    { title: 'Username', dataIndex: 'username' },
    { title: 'Password', dataIndex: 'password'},
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.user_id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <Title level={2}>Manage Admin Users</Title>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 20 }}
        onClick={() => {
          form.resetFields();
          setEditingAdminId(null);
          setIsModalVisible(true);
        }}
      >
        Add New Admin
      </Button>

      <Table columns={columns} dataSource={admins} rowKey="user_id" bordered />

      <Modal
        title={editingAdminId ? 'Edit Admin' : 'Create Admin'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input username' }]}
          >
            <Input autoComplete='new-username'/>
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input password' }]}
          >
            <Input.Password autoComplete='new-password'/>
          </Form.Item>

          <Form.Item >
            <Space style={{ justifyContent: 'end', width: '100%' }}>
              <Button onClick={() => setIsModalVisible(false)} style={{marginTop:0}}>Cancel</Button>
              <Button type="primary" htmlType="submit" style={{marginTop:0}}>
                {editingAdminId ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsers;
