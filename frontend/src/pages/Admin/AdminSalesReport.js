import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Typography, Select, Spin } from 'antd';
import { PieChart, Pie, Rectangle, Cell, BarChart, Bar, Brush, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, Legend, LineChart, Line, ComposedChart, ReferenceLine } from 'recharts';
import axios from 'axios';

const { Title } = Typography;

const AdminSalesReport = () => {
    const [salesData, setSalesData] = useState(null);
    const [topItems, setTopItems] = useState([]);
    const [categorySalesRevenue, setCategorySalesRevenue] = useState([]);
    const [categorySalesQuantity, setCategorySalesQuantity] = useState([]);
    const [hourlyOrders, setHourlyOrders] = useState([]);
    const [salesTrend, setSalesTrend] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [forecastedInventory, setForecastedInventory] = useState([]);
    const [trendType, setTrendType] = useState('Monthly');
    const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50'];

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [salesRes, topItemsRes, categoryRes, hourlyOrdersRes, trendRes, menuItemsRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/admin/sales-summary'),
                    axios.get('http://localhost:3000/api/admin/top-items'),
                    axios.get('http://localhost:3000/api/admin/category-sales'),
                    axios.get('http://localhost:3000/api/admin/hourly-orders'),
                    axios.get(`http://localhost:3000/api/admin/sales-trend?type=${trendType.toLowerCase()}`),
                    axios.get('http://localhost:3000/api/items'),
                ]);

                setSalesData(salesRes.data);
                setTopItems(topItemsRes.data);
                setCategorySalesRevenue([
                    { name: 'Food', value: categoryRes.data.FoodRevenue || 0 },
                    { name: 'Beverage', value: categoryRes.data.BeverageRevenue || 0 },
                    { name: 'Dessert', value: categoryRes.data.DessertRevenue || 0 },
                ]);
                
                setCategorySalesQuantity([
                    { name: 'Food', value: categoryRes.data.FoodQuantity || 0 },
                    { name: 'Beverage', value: categoryRes.data.BeverageQuantity || 0 },
                    { name: 'Dessert', value: categoryRes.data.DessertQuantity || 0 },
                ]);
                
                setHourlyOrders(hourlyOrdersRes.data.map(item => ({
                    hour: `${item.order_hour}:00`,
                    orders: item.total_orders,

                })));
                setSalesTrend(trendRes.data.map(item => ({
                    time: item.time,
                    sales: Number(item.total_sales),
                    sales_count: item.sales_count,
                })));
                setMenuItems(menuItemsRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            }
        };
        fetchAllData();
    }, [trendType]);

    useEffect(() => {
        const fetchForecastData = async () => {
            if (!selectedItemId) return;
    
            try {
                const res = await axios.get(`http://localhost:3000/api/admin/items-sales-history/${selectedItemId}`);
                
                let historyData = res.data || [];
                
                historyData = historyData.map(item => ({
                    ...item,
                    total_sold: Number(item.total_sold)
                }));
                historyData = fillMissingDates(historyData);

                if (historyData.length > 0) {
                    calculateForecast(historyData);
                } else {
                    setForecastedInventory([]);
                }
            } catch (err) {
                console.error("Failed to fetch forecast data:", err);
            }
        };
        fetchForecastData();
    }, [selectedItemId]);
    
    const fillMissingDates = (historyData) => {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 13);
    
        const dateMap = {};
        historyData.forEach(entry => {
            const dateStr = new Date(entry.date).toISOString().split('T')[0];
            dateMap[dateStr] = Number(entry.total_sold) || 0;
        });
    
        const completeData = [];
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            completeData.push({
                date: dateStr,
                total_sold: dateMap[dateStr] !== undefined ? dateMap[dateStr] : 0
            });
        }
    
        return completeData;
    };
    
    
    const calculateComparison = (currentValue, previousValue) => {
        const current = parseFloat(currentValue) || 0;
        const previous = parseFloat(previousValue) || 0;

        if (previous === 0) {
            return { percentage: "0.00", direction: current > 0 ? "up" : "neutral" };
        }

        const diff = ((current - previous) / previous) * 100;
        return {
            percentage: Math.abs(diff).toFixed(2),
            direction: diff >= 0 ? "up" : "down"
        };
    };

    const todayComparison = calculateComparison(salesData?.today, salesData?.yesterday);
    const weekComparison = calculateComparison(salesData?.week, salesData?.lastWeek);
    const monthComparison = calculateComparison(salesData?.month, salesData?.lastMonth);
    const avgSpendComparison = calculateComparison(salesData?.avgSpendToday, salesData?.avgSpendYesterday);

    const calculateForecast = (historyData) => {
        const alpha = 0.6;
        const forecasted = [];
    
        if (historyData.length === 0) {
            setForecastedInventory([]);
            return;
        }
        forecasted.push({
            ...historyData[0],
            forecast: Math.ceil(Number(historyData[0].total_sold))
        });
    
        for (let i = 1; i < historyData.length; i++) {
            const prevForecast = forecasted[i-1].forecast;
            const prevActual = Number(historyData[i-1].total_sold);
            const newForecast = alpha * prevActual + (1 - alpha) * prevForecast;
    
            forecasted.push({
                ...historyData[i],
                forecast: Math.ceil(newForecast)
            });
        }
    
        if (historyData.length > 0) {
            let lastDate = new Date(historyData[historyData.length - 1].date);
            let lastForecast = forecasted[forecasted.length - 1].forecast;
    
            for (let i = 1; i <= 3; i++) {
                lastDate.setDate(lastDate.getDate() + 1);
                forecasted.push({
                    date: lastDate.toISOString().split('T')[0],
                    total_sold: null,
                    forecast: Math.ceil(lastForecast),
                });
            }
        }
        setForecastedInventory(forecasted);
    };
    
    if (!salesData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <Title level={2}>Admin Sales Report (Preview)</Title>
            <Row gutter={[16, 16]} style={{ marginBottom: 30 }}>
                {/* Today's Sales */}
                <Col span={6}>
                    <Card>
                        <Title level={4}>Today's Sales</Title>
                        <Title level={2}>RM {Number(salesData?.today ?? 0).toFixed(2)}</Title>
                        <div style={{
                            marginTop: 8,
                            color: todayComparison.direction === "up" ? "green" : todayComparison.direction === "down" ? "red" : "gray",
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            {todayComparison.direction === "up" && '↑'}
                            {todayComparison.direction === "down" && '↓'}
                            {todayComparison.percentage}%
                        </div>

                        {salesTrend.length > 0 && (
                            <ResponsiveContainer width="100%" height={50}>
                                <AreaChart data={salesTrend.slice(-7).map(item => ({ value: item.sales }))}>
                                    <Area type="monotone" dataKey="value" stroke="#52c41a" fill="#b7eb8f" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>

                {/* This Week's Sales */}
                <Col span={6}>
                    <Card>
                        <Title level={4}>This Week's Sales</Title>
                        <Title level={2}>RM {Number(salesData?.week ?? 0).toFixed(2)}</Title>
                        <div style={{
                            marginTop: 8,
                            color: weekComparison.direction === "up" ? "green" : weekComparison.direction === "down" ? "red" : "gray",
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            {weekComparison.direction === "up" && '↑'}
                            {weekComparison.direction === "down" && '↓'}
                            {weekComparison.percentage}%
                        </div>
                        {salesTrend.length > 0 && (
                            <ResponsiveContainer width="100%" height={50}>
                                <AreaChart data={salesTrend.slice(-7).map(item => ({ value: item.sales }))}>
                                    <Area type="monotone" dataKey="value" stroke="#1890ff" fill="#bae7ff" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>

                {/* This Month's Sales */}
                <Col span={6}>
                    <Card>
                        <Title level={4}>This Month's Sales</Title>
                        <Title level={2}>RM {Number(salesData?.month ?? 0).toFixed(2)}</Title>
                        <div style={{
                            marginTop: 8,
                            color: monthComparison.direction === "up" ? "green" : monthComparison.direction === "down" ? "red" : "gray",
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            {monthComparison.direction === "up" && '↑'}
                            {monthComparison.direction === "down" && '↓'}
                            {monthComparison.percentage}%
                        </div>
                        {salesTrend.length > 0 && (
                            <ResponsiveContainer width="100%" height={50}>
                                <AreaChart data={salesTrend.slice(-6).map(item => ({ value: item.sales }))}>
                                    <Area type="monotone" dataKey="value" stroke="#ffc53d" fill="#fff1b8" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>

                {/* Avg Spend */}
                <Col span={6}>
                    <Card>
                        <Title level={4}>Avg. Spend per Customer</Title>
                        <Title level={2}>RM {Number(salesData?.avgSpendToday ?? 0).toFixed(2)}</Title>
                        <div style={{
                            marginTop: 8,
                            color: avgSpendComparison.direction === "up" ? "green" : avgSpendComparison.direction === "down" ? "red" : "gray",
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            {avgSpendComparison.direction === "up" && '↑'}
                            {avgSpendComparison.direction === "down" && '↓'}
                            {avgSpendComparison.percentage}%
                        </div>
                        {salesTrend.length > 0 && (
                            <ResponsiveContainer width="100%" height={50}>
                                <AreaChart data={salesTrend.slice(-7).map(item => ({ value: item.sales / 5 }))}>
                                    <Area type="monotone" dataKey="value" stroke="#eb2f96" fill="#ffd6e7" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Card title="Top 5 Items Sold">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={topItems.map(item => ({
                                    name: item.item_name,
                                    sales: Number(item.total_sold)
                                }))}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value} sales`, '']} />
                                <Bar
                                    dataKey="sales"
                                    fill="#8884d8"
                                    activeBar={(props) => (
                                        <Rectangle {...props} fill="rgba(200, 200, 255, 0.6)" />
                                    )}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Top Selling Categories by Revenue">
                        <Row gutter={[16, 16]}>
                            {/* Donut Chart */}
                            <Col span={16}>
                                <ResponsiveContainer width="100%" height={400}>
                                    <PieChart>
                                        <Pie
                                            data={categorySalesRevenue} // This should be revenue data
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            innerRadius={60}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                            isAnimationActive={true}
                                        >
                                            {categorySalesRevenue.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`RM ${Number(value).toFixed(2)}`, "Revenue"]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Col>

                            {/* Legend beside donut showing Quantity */}
                            <Col span={8} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <h4>Sold Quantity</h4>
                                {categorySalesQuantity.map((entry, index) => (
                                    <div key={index} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{
                                            width: 12,
                                            height: 12,
                                            backgroundColor: pieColors[index % pieColors.length],
                                            borderRadius: 2
                                        }} />
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>
                                            {entry.name}: {entry.value} items
                                        </span>
                                    </div>
                                ))}
                            </Col>

                        </Row>
                    </Card>
                </Col>

            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 30 }}>
                <Col span={24}>
                    <Card title="Hourly Orders (Busy Hours)">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={hourlyOrders}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis
                                    domain={[0, Math.max(...hourlyOrders.map(item => item.orders)) + 1]}
                                />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#8884d8"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                />
                                {hourlyOrders.length > 0 && (
                                    <ReferenceLine
                                        y={Math.max(...hourlyOrders.map(item => item.orders))}
                                        stroke="red"
                                        strokeDasharray="5 5"
                                        label={{
                                            value: "Peak Hour",
                                            position: "right",
                                            fill: "red",
                                            fontSize: 12,
                                            fontWeight: "bold"
                                        }}
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 30 }}>
                <Col span={24}>
                    <Card
                        title="Sales Trend"
                        extra={
                            <Select value={trendType} onChange={(value) => setTrendType(value)} style={{ width: 120, marginBottom:10 }}>
                                <Select.Option value="Daily">Daily</Select.Option>
                                <Select.Option value="Weekly">Weekly</Select.Option>
                                <Select.Option value="Monthly">Monthly</Select.Option>
                            </Select>
                        }
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="time"
                                    tickFormatter={(value) => {
                                        if (trendType === 'Daily') {
                                            return typeof value === 'string' ? value.substring(0, 10) : value;
                                        } else if (trendType === 'Weekly') {
                                            const weekNumber = typeof value === 'string' || typeof value === 'number'
                                                ? value.toString().slice(-2)
                                                : value;
                                            return `Week ${weekNumber}`;
                                        } else if (trendType === 'Monthly') {
                                            if (typeof value === 'string') {
                                                const [, month] = value.split('-');
                                                const monthNames = ["Jan", "Feb", "Mac", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                                return monthNames[parseInt(month, 10) - 1] || value;
                                            }
                                            return value;
                                        }
                                        return value;
                                    }}
                                />
                                <YAxis yAxisId="left" orientation="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip
                                    labelFormatter={(label) => {
                                        if (trendType === 'Daily') {
                                            return typeof label === 'string' ? label.substring(0, 10) : label;
                                        }
                                        return label;
                                    }}
                                    formatter={(value, name) => {
                                        if (name === "Total Sales (RM)" && typeof value === "number") {
                                            return [`RM ${Number(value).toFixed(2)}`, name];
                                        }
                                        if (name === "Sales Count" && typeof value === "number") {
                                            return [value, name];
                                        }
                                        return [value, name];
                                    }}
                                />
                                <Legend />
                                {/* Area chart for Total Sales (left axis) */}
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#82ca9d"
                                    fill="#d0f0c0"
                                    strokeWidth={3}
                                    name="Total Sales (RM)"
                                />
                                {/* Line chart for Sales Count (right axis) */}
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="sales_count"
                                    stroke="#8884d8"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="Sales Count"
                                />
                                <Brush
                                    dataKey="time"
                                    height={40}
                                    stroke="#8884d8"
                                    fill="#e6f7ff"
                                    fillOpacity={0.3}
                                    travellerWidth={14}
                                    tickFormatter={() => ""}
                                    startIndex={Math.max(0, salesTrend.length - 14)}
                                    endIndex={salesTrend.length - 1}
                                    travellerStyle={{
                                        fill: "#ffffff",
                                        stroke: "#000000",
                                        strokeWidth: 1,
                                        rx: 8,
                                        ry: 6
                                    }}
                                >
                                    <AreaChart>
                                        <defs>
                                            <linearGradient id="previewColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f0f0f0" />
                                        <Area
                                            type="monotone"
                                            dataKey="sales"
                                            stroke="#82ca9d"
                                            fill="url(#previewColor)"
                                            strokeWidth={2}
                                            dot={false}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </Brush>
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 30 }}>
                <Col span={24}>
                    <Card
                        title="Inventory Forecast (Exponential Smoothing)"
                        extra={
                            <Select
                                placeholder="Select a Menu Item"
                                value={selectedItemId}
                                onChange={(value) => setSelectedItemId(value)}
                                style={{ width: 250, marginBottom: 10 }}
                            >
                                {menuItems.map(item => (
                                    <Select.Option key={item.item_id} value={item.item_id}>
                                        {item.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        }
                    >
                        {forecastedInventory.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={forecastedInventory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => {
                                            if (typeof value === 'string') {
                                                return value.substring(0, 10);
                                            }
                                            return value;
                                        }}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value, name) => {
                                            if (name === "Forecasted" && typeof value === "number") {
                                                return [value.toFixed(4), name];
                                            }
                                            if (name === "Actual Sales" && typeof value === "number") {
                                                return [value, name];
                                            }
                                            return [value, name];
                                        }}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="total_sold"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        name="Actual Sales"
                                        dot={(dotProps) => {
                                            if (dotProps.payload.total_sold === null) return null;
                                            return <circle {...dotProps} r={4} />;
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="forecast"
                                        stroke="#82ca9d"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        name="Forecasted"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#999' }}>
                                No sufficient data to forecast for this item.
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminSalesReport;
