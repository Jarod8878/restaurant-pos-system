import { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { message, Table, Input, Button, DatePicker, Select, Card, Row, Col, Checkbox } from "antd";
import axios from "axios";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState("");
    const [dateRange, setDateRange] = useState([]);
    const [status, setStatus] = useState("");
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    useEffect(() => {
        setLoading(true);
        axios.get("http://localhost:3000/api/orders/all")
            .then((response) => {
                if (Array.isArray(response.data)) {
                    setOrders(response.data);
                    setFilteredOrders(response.data);
                } else {
                    console.error("Unexpected API response format:", response.data);
                    setOrders([]);
                }
            })
            .catch((error) => {
                console.error("Error fetching orders:", error);
                setOrders([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleFilter = () => {
        let filtered = [...orders];
        if (searchText) {
            filtered = filtered.filter(order =>
                order.customerName.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        if (dateRange.length === 2) {
            const [start, end] = dateRange;
            filtered = filtered.filter(order => {
                const submitted = dayjs(order.created_date_time);
                return submitted.isAfter(start.startOf('day')) && submitted.isBefore(end.endOf('day'));
            });
        }
        if (status) {
            filtered = filtered.filter(order => order.status === status);
        }
        setFilteredOrders(filtered);
    };

    const handleReset = () => {
        setSearchText("");
        setDateRange([]);
        setStatus("");
        setFilteredOrders(orders);
    };

    const handleDeleteSelected = () => {
        if (selectedRowKeys.length === 0) {
            message.warning("No orders selected for deletion!");
            return;
        }

        axios.post("http://localhost:3000/api/orders/delete", { orderIds: selectedRowKeys })
            .then((response) => {
                if (response.data.success) {
                    message.success("Selected orders deleted successfully!");
                    const updatedOrders = orders.filter(order => !selectedRowKeys.includes(order.order_id));
                    setOrders(updatedOrders);
                    setFilteredOrders(updatedOrders);
                    setSelectedRowKeys([]);
                } else {
                    message.error("Failed to delete selected orders.");
                }
            })
            .catch((error) => {
                console.error("Error deleting orders:", error);
                message.error("Error deleting selected orders.");
            });
    };

    const columns = [
        { title: "Order ID", dataIndex: "order_id", key: "order_id", sorter: (a, b) => a.order_id - b.order_id, },
        { title: "Customer", dataIndex: "customerName", key: "customerName" },
        { title: "Total Price", dataIndex: "total_price", key: "total_price", sorter: (a, b) => a.total_price - b.total_price, render: price => `RM${(Number(price) || 0).toFixed(2)}` },
        { title: "Discount Applied", dataIndex: "discount_applied", key: "discount_applied", sorter: (a, b) => a.discount_applied - b.discount_applied, render: discount => `RM${(Number(discount) || 0).toFixed(2)}` },
        {
            title: "Date",
            dataIndex: "created_date_time",
            key: "created_date_time",
            sorter: (a, b) => new Date(a.created_date_time) - new Date(b.created_date_time),
            render: (date) => new Date(date).toLocaleString()
        },
        {
            title: "Pickup Time",
            dataIndex: "preorder_datetime",
            key: "pickup_time",
            render: (preorderTime) => preorderTime
                ? new Date(preorderTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })
                : "-",
        },
        {
            title: "Order Status",
            dataIndex: "status",
            key: "status",
            render: (status, record) => (
                <div style={{
                    borderLeft: `5px solid ${getStatusColor(status)}`,
                    paddingLeft: 8,
                    borderRadius: 4
                }}>
                    <Select
                        value={status}
                        onChange={(value) => handleStatusChange(record.order_id, value)}
                        style={{ width: 150, marginBottom: 12 }}
                    >
                        <Option value="Preparing" style={{ color: '#faad14' }}>Preparing</Option>
                        <Option value="Completed" style={{ color: '#52c41a' }}>Completed</Option>
                        <Option value="Cancelled" style={{ color: '#ff4d4f' }}>Cancelled</Option>
                    </Select>
                </div>
            )
        }

    ];
    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#52c41a';
            case 'Cancelled': return '#ff4d4f';
            case 'Preparing': return '#faad14';
            default: return '#d9d9d9';
        }
    };

    const handleExportToExcel = () => {
        const exportData = filteredOrders.map(order => ({
            "Order ID": order.order_id,
            "Customer": order.customerName,
            "Total Price (RM)": Number(order.total_price).toFixed(2),
            "Discount Applied (RM)": Number(order.discount_applied).toFixed(2),
            "Membership Points": order.membership_points || 0,
            "Date": new Date(order.created_date_time).toLocaleString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, `Orders_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    const handleStatusChange = (orderId, newStatus) => {
        axios.put(`http://localhost:3000/api/orders/status`, { orderId, status: newStatus })
            .then((res) => {
                if (res.data.success) {
                    message.success("Order status updated!");
                    const updated = orders.map(order =>
                        order.order_id === orderId ? { ...order, status: newStatus } : order
                    );
                    setOrders(updated);
                    setFilteredOrders(updated);
                } else {
                    message.error("Failed to update status.");
                }
            })
            .catch(() => {
                message.error("Error updating order status.");
            });
    };

    return (
        <div style={{ padding: 40, maxWidth: 1600, margin: "auto", fontSize: "24px" }}>
            <Card title="Data Filters" style={{ marginBottom: 40, fontSize: "26px" }}>
                <Row gutter={[24, 24]}>
                    <Col span={8}>
                        <Input
                            style={{ height: "60px", fontSize: "22px" }}
                            placeholder="Search by Customer Name"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col span={8}>
                        <RangePicker
                            style={{ height: "60px", fontSize: "22px", width: "100%" }}
                            onChange={(dates) => setDateRange(dates || [])}
                        />
                    </Col>
                    <Col span={8}>
                        <Select
                            style={{ width: "100%", height: "60px", fontSize: "22px" }}
                            placeholder="Select Order Status"
                            onChange={(value) => setStatus(value)}
                        >
                            <Option value="">All</Option>
                            <Option value="Preparing">Preparing</Option>
                            <Option value="Completed">Completed</Option>
                            <Option value="Cancelled">Cancelled</Option>
                        </Select>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleFilter}
                            style={{ fontSize: "22px", height: "60px", width: "200px", marginTop: 0 }}
                        >
                            Filter
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            type="default"
                            onClick={handleReset}
                            style={{ fontSize: "22px", height: "60px", width: "200px", marginTop: 0 }}
                        >
                            Reset
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Data List</span>
                        <Button
                            type="default"
                            onClick={handleExportToExcel}
                            style={{ fontSize: "18px", height: "40px" }}
                        >
                            Export to XLS
                        </Button>
                    </div>
                }
            >
                <Table
                    rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
                    columns={columns}
                    dataSource={filteredOrders}
                    loading={loading}
                    rowKey="order_id"
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: filteredOrders.length,
                        showSizeChanger: true,
                        pageSizeOptions: ["5", "10", "20", "50"],
                        onChange: (page, newPageSize) => {
                            setCurrentPage(page);
                            setPageSize(newPageSize);
                        },
                    }}
                    style={{ fontSize: "22px" }}
                />
            </Card>

            {filteredOrders.length > 0 && (
                <Card title="Batch Actions" style={{ marginTop: 40, fontSize: "26px" }}>
                    <Row align="middle" gutter={16}>
                        <Col>
                            <Checkbox
                                checked={selectedRowKeys.length === filteredOrders.length}
                                indeterminate={
                                    selectedRowKeys.length > 0 &&
                                    selectedRowKeys.length < filteredOrders.length
                                }
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedRowKeys(filteredOrders.map(order => order.order_id));
                                    } else {
                                        setSelectedRowKeys([]);
                                    }
                                }}
                                style={{ fontSize: "22px" }}
                            >
                                Select All
                            </Checkbox>
                        </Col>
                        <Col>
                            <Button
                                type="primary"
                                danger
                                disabled={selectedRowKeys.length === 0}
                                onClick={handleDeleteSelected}
                                style={{ fontSize: "22px", height: "50px" }}
                            >
                                Delete Selected
                            </Button>
                        </Col>
                    </Row>
                </Card>
            )}
        </div>
    );
};

export default AdminOrders;
