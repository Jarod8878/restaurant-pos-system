import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Table, Card, Row, Col, Input, Button, Tag, Modal, message, Space, Typography, Form } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { API_BASE } from '../../config/api';
import axios from 'axios';

const AdminCRM = () => {
    const [customers, setCustomers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeToday, setActiveToday] = useState(0);
    const [changePercent, setChangePercent] = useState(0);

    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [canSave, setCanSave] = useState(false);

    const normalizePhone = (val) => (val || '').replace(/\D/g, '');

    const formatPhone = (val) => {
        const digits = normalizePhone(val).slice(0, 11);
        if (digits.length <= 3) return digits;
        return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    };

    const nameWatch = Form.useWatch('customerName', form);
    const phoneWatch = Form.useWatch('phoneNumber', form);

    useEffect(() => {
        fetchCRMData();
        fetchVisitorData();
    }, []);

    const fetchVisitorData = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/customer/active-customer`);
            if (res.data.success) {
                const dataWithLocalDate = res.data.data.map(d => ({
                    ...d,
                    order_date: new Date(d.order_date).toLocaleDateString('en-CA')
                }));

                const sorted = dataWithLocalDate.sort((a, b) => new Date(a.order_date) - new Date(b.order_date));

                const today = new Date().toLocaleDateString('en-CA');
                const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');

                const todayData = sorted.find(d => d.order_date === today);
                const yesterdayData = sorted.find(d => d.order_date === yesterday);

                const todayVal = todayData?.active_user || 0;
                const yesterdayVal = yesterdayData?.active_user || 0;

                const percent = yesterdayVal === 0
                    ? todayVal > 0 ? 100 : 0
                    : (((todayVal - yesterdayVal) / yesterdayVal) * 100).toFixed(2);

                setActiveToday(todayVal);
                setChangePercent(Number(percent));
            }
        } catch (err) {
            console.error("Failed to load active user stats:", err);
        }
    };

    const fetchCRMData = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/customer/crm`);
            if (res.data.success) {
                setCustomers(res.data.customers);
                setFiltered(res.data.customers);
            } else {
                message.error('CRM load failed');
            }
        } catch (err) {
            message.error('Failed to load CRM data');
        }
    };

    const handleFilter = () => {
        let filtered = [...customers];
        if (searchName) {
            filtered = filtered.filter(c =>
                c.customerName.toLowerCase().includes(searchName.toLowerCase())
            );
        }
        if (searchPhone) {
            const norm = (s) => (s || '').replace(/\D/g, '');
            filtered = filtered.filter(c =>
                norm(c.phoneNumber).includes(norm(searchPhone))
            );
        }
        setFiltered(filtered);
    };

    const handleEdit = (customer) => {
        setSelectedCustomer(customer);
        form.setFieldsValue({
            customerName: customer.customerName || '',
            phoneNumber: formatPhone(customer.phoneNumber || ''),
        });
        setModalVisible(true);
    };

    const closeEdit = () => {
        setModalVisible(false);
        setSelectedCustomer(null);
        form.resetFields();
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'customerName',
            key: 'customerName',
            sorter: {
                compare: (a, b) => a.customerName.localeCompare(b.customerName),
                multiple: 1,
            },
        },
        {
            title: 'Phone',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Points',
            dataIndex: 'points',
            key: 'points',
            sorter: {
                compare: (a, b) => a.points - b.points,
                multiple: 2,
            },
        },
        {
            title: 'Orders',
            dataIndex: 'totalOrders',
            key: 'totalOrders',
            sorter: {
                compare: (a, b) => a.totalOrders - b.totalOrders,
                multiple: 3,
            },
            render: val => <Tag color="blue">{val}</Tag>,
        },
        {
            title: 'Spent (RM)',
            dataIndex: 'totalSpent',
            key: 'totalSpent',
            sorter: {
                compare: (a, b) => parseFloat(a.totalSpent) - parseFloat(b.totalSpent),
                multiple: 4,
            },
            render: val => <Tag color="green">RM{parseFloat(val).toFixed(2)}</Tag>,
        },
        {
            title: 'Discounts Available',
            dataIndex: 'discountsAvailable',
            key: 'discountsAvailable',
            sorter: {
                compare: (a, b) => a.discountsAvailable - b.discountsAvailable,
                multiple: 5,
            },
            render: val => <Tag color="purple">{val}</Tag>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.customerId)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        }

    ];

    const handleExportToExcel = () => {
        const exportData = filtered.map(c => ({
            Name: c.customerName,
            Phone: c.phoneNumber,
            Points: c.points,
            "Orders": c.totalOrders,
            "Spent (RM)": parseFloat(c.totalSpent).toFixed(2),
            "Discounts Available": c.discountsAvailable,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, `CustomerCRM_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    useEffect(() => {
        if (!selectedCustomer) { setCanSave(false); return; }
        const hasErrors = form.getFieldsError().some(f => f.errors.length);
        const dirty =
            (nameWatch ?? '') !== (selectedCustomer.customerName ?? '') ||
            (phoneWatch ?? '') !== (selectedCustomer.phoneNumber ?? '');
        setCanSave(!hasErrors && dirty);
    }, [nameWatch, phoneWatch, selectedCustomer, form]);

    const handleSaveEdit = async (values) => {
        try {
            const name = (values.customerName || '').trim();
            const phoneDigits = normalizePhone(values.phoneNumber);

            if (!selectedCustomer) return;

            const prevName = selectedCustomer.customerName || '';
            const prevDigits = normalizePhone(selectedCustomer.phoneNumber || '');

            if (name === prevName && phoneDigits === prevDigits) {
                message.info('No changes to save.');
                return;
            }

            setSaving(true);
            const res = await axios.put(`${API_BASE}/api/customer/admin/update`, {
                customerId: selectedCustomer.customerId,
                customerName: name,
                phoneNumber: phoneDigits,
            });

            if (res.data?.success) {
                message.success('Customer updated successfully');
                setModalVisible(false);
                setSelectedCustomer(null);
                form.resetFields();
                await fetchCRMData();
            } else {
                message.error(res.data?.message || 'Update failed');
            }
        } catch (err) {
            if (!err?.errorFields) {
                console.error(err);
                message.error('Error updating customer');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (customerId) => {
        Modal.confirm({
            title: 'Confirm Deletion',
            content: 'Are you sure you want to delete this customer?',
            okText: 'Confirm',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    const res = await axios.delete(`${API_BASE}/api/customer/delete/${customerId}`);
                    if (res.data.success) {
                        message.success("Customer deleted");
                        fetchCRMData();
                    } else {
                        message.error("Failed to delete customer");
                    }
                } catch (err) {
                    console.error(err);
                    message.error("Error deleting customer");
                }
            }
        });
    };

    const handleReset = () => {
        setSearchName('');
        setSearchPhone('');
        setFiltered(customers);
    };


    return (
        <div style={{ padding: 40 }}>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={24}>
                    <Card>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '20px',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{
                                fontSize: '108px',
                                color: '#1890ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <UserOutlined />
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <Typography.Title level={4} style={{ marginBottom: 0 }}>
                                    Active Users Today
                                </Typography.Title>
                                <Typography.Title level={2} style={{ marginBottom: 0 }}>
                                    {activeToday}
                                </Typography.Title>
                                <div style={{
                                    marginTop: 8,
                                    color: changePercent > 0 ? "green" : changePercent < 0 ? "red" : "gray",
                                    fontSize: '16px'
                                }}>
                                    {changePercent > 0 && '↑'}
                                    {changePercent < 0 && '↓'}
                                    {Math.abs(changePercent)}%
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

            </Row>

            <Card title="Customer CRM Filter" style={{ marginBottom: 20 }}>
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <Input
                            placeholder="Search by Name"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </Col>
                    <Col span={6}>
                        <Input
                            placeholder="Search by Phone"
                            value={searchPhone}
                            inputMode="numeric"
                            pattern="\d*" 
                            maxLength={11} 
                            onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, ''))}
                        />
                    </Col>
                    <Col span={6}>
                        <Row gutter={8} align="middle">
                            <Col>
                                <Button
                                    icon={<SearchOutlined />}
                                    type="primary"
                                    onClick={handleFilter}
                                    style={{ marginTop: 1 }}
                                >
                                    Filter
                                </Button>
                            </Col>
                            <Col>
                                <Button onClick={handleReset}>
                                    Reset
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>

            <Card
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Customer Overview</span>
                        <Button
                            onClick={handleExportToExcel}
                            style={{ fontSize: "16px" }}
                        >
                            Export to XLS
                        </Button>
                    </div>
                }
            >

                <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="customerId"
                    pagination={{ pageSize: 8 }}
                />
            </Card>

            <Modal
                title="Edit Customer"
                open={modalVisible}
                onCancel={closeEdit}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    validateTrigger={['onBlur', 'onSubmit']}
                    onFinish={handleSaveEdit}
                >
                    <Form.Item
                        label="Name"
                        name="customerName"
                        rules={[
                            { required: true, whitespace: true, message: 'Name is required.' },
                            { min: 2, message: 'Name should be at least 2 characters.' },
                        ]}
                    >
                        <Input placeholder="Enter full name" />
                    </Form.Item>

                    <Form.Item
                        label="Phone Number"
                        name="phoneNumber"
                        getValueFromEvent={(e) => formatPhone(e.target.value)}
                        rules={[
                            {
                                validator: (_, value) => {
                                    const digits = normalizePhone(value);
                                    if (!digits) return Promise.reject('Phone number is required.');
                                    if (!/^01\d{8,10}$/.test(digits)) {
                                        return Promise.reject('Use a valid phone number');
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                        extra="Example: 0123456789 (hyphens are optional)"
                    >
                        <Input 
                            placeholder="01XXXXXXXXX" 
                            maxLength={12}
                            inputMode='numeric'
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ justifyContent: 'end', width: '100%' }}>
                            <Button onClick={closeEdit}>Cancel</Button>
                            <Button type="primary" htmlType="submit" disabled={!canSave} loading={saving} style={{ marginTop: -2 }}>
                                Save
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminCRM;
