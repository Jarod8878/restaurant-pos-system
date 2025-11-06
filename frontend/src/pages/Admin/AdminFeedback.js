import React, { useEffect, useState } from 'react';
import { Table, Card, Typography, message, Tag, Button, Row, Col, Select, DatePicker, Input, Space } from 'antd';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [allFeedbacks, setAllFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ratingFilter, setRatingFilter] = useState(null);
    const [dateRangeFilter, setDateRangeFilter] = useState([]);
    const [keywordFilter, setKeywordFilter] = useState('');

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:3000/api/feedback');
            setFeedbacks(res.data);
            setAllFeedbacks(res.data);
        } catch (error) {
            console.error('Failed to fetch feedbacks:', error);
            message.error('Failed to load feedbacks.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleExportExcel = () => {
        if (feedbacks.length === 0) {
            message.warning('No data to export');
            return;
        }

        const exportData = feedbacks.map((f) => ({
            'Submitter Name': f.customerName || 'Guest',
            'Phone Number': f.phoneNumber,
            'Feedback': f.feedback,
            'Rating': f.rating ? `${f.rating}/5` : 'No Rating',
            'Submitted At': new Date(f.created_at).toLocaleString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedbacks');
        XLSX.writeFile(workbook, 'CustomerFeedbacks.xlsx');
    };

    const handleApplyFilters = () => {
        let filtered = [...allFeedbacks];

        if (ratingFilter !== null) {
            filtered = filtered.filter(f => f.rating && parseFloat(f.rating) >= ratingFilter);
        }

        if (dateRangeFilter.length === 2) {
            const [start, end] = dateRangeFilter;
            filtered = filtered.filter(f => {
                const submitted = dayjs(f.created_at);
                return submitted.isAfter(start.startOf('day')) && submitted.isBefore(end.endOf('day'));
            });
        }

        if (keywordFilter.trim() !== '') {
            const keyword = keywordFilter.toLowerCase();
            filtered = filtered.filter(f => f.feedback && f.feedback.toLowerCase().includes(keyword));
        }

        setFeedbacks(filtered);
    };

    const handleResetFilters = () => {
        setRatingFilter(null);
        setDateRangeFilter([]);
        setKeywordFilter('');
        setFeedbacks(allFeedbacks);
    };

    const columns = [
        {
            title: 'Submitter Name',
            dataIndex: 'customerName',
            key: 'customerName',
            render: (customerName) => customerName ? customerName : <Tag color="red">Guest</Tag>,
        },
        {
            title: 'Phone Number',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Feedback',
            dataIndex: 'feedback',
            key: 'feedback',
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            sorter: (a, b) => {
                const ratingA = a.rating !== null ? parseFloat(a.rating) : -1;
                const ratingB = b.rating !== null ? parseFloat(b.rating) : -1;
                return ratingA - ratingB;
            },
            render: (rating) => rating ? `${rating}/5` : <Tag color="orange">No Rating</Tag>,
        },
        {
            title: 'Submitted At',
            dataIndex: 'created_at',
            key: 'created_at',
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
            defaultSortOrder: 'descend',
            render: (date) => new Date(date).toLocaleString(),
        },
    ];

    return (
        <div style={{ padding: '2rem' }}>
            <Card title="Customer Feedback Filter" style={{ marginBottom: '1.5rem' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={6}>
                        <Select
                            placeholder="Filter by Rating"
                            value={ratingFilter}
                            onChange={(value) => setRatingFilter(value)}
                            style={{ width: "100%", height: "60px", fontSize: "22px" }}
                            allowClear
                        >
                            <Option value={5}>5 Stars</Option>
                            <Option value={4}>4 Stars and Above</Option>
                            <Option value={3}>3 Stars and Above</Option>
                        </Select>
                    </Col>

                    <Col xs={24} md={6}>
                        <RangePicker
                            value={dateRangeFilter}
                            onChange={(dates) => setDateRangeFilter(dates || [])}
                            style={{ height: "60px", fontSize: "22px", width: "100%" }}
                        />
                    </Col>

                    <Col xs={24} md={6}>
                        <Input
                            placeholder="Search Feedback"
                            value={keywordFilter}
                            onChange={(e) => setKeywordFilter(e.target.value)}
                            allowClear
                            style={{ height: "45px", fontSize: "22px" }}
                        />
                    </Col>

                    <Col xs={24} md={4}>
                        <Space>
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={handleApplyFilters}
                                style={{ marginTop: 0, height: "60px" }}
                            >
                                Filter
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleResetFilters}
                                style={{ marginTop: 0, height: "60px" }}
                            >
                                Reset
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: '1rem' }}>
                    <Col>
                        <Title level={2} style={{ marginBottom: 0, fontSize: "22px" }}>
                            Customer Feedbacks
                        </Title>
                    </Col>
                    <Col>
                        <Button
                            onClick={handleExportExcel}
                        >
                            Export to XLS
                        </Button>
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={feedbacks}
                    rowKey="id"
                    loading={loading}
                    bordered
                    pagination={{ pageSize: 8 }}
                />
            </Card>
        </div>
    );
};

export default AdminFeedback;
