import React, { useEffect, useState } from "react";
import { message,Table, Layout, Card, Statistic, Row, Col, Progress, List } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "antd/dist/reset.css";

const { Header, Content } = Layout;

const Dashboard = () => {
  const [totalRevenueToday, setTotalRevenueToday] = useState(0);
  const [totalRevenueMonth, setTotalRevenueMonth] = useState(0);
  const [orders, setOrders] = useState([]);
  const [categorySales, setCategorySales] = useState({ Food: 0, Drinks: 0, Desserts: 0 });
  const [feedbacks, setFeedbacks] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState({});
  const [topCustomers, setTopCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); 
  const [pageSize, setPageSize] = useState(5); 

  useEffect(() => {
    fetchRevenue();
    fetchOrders();
    fetchCategorySales();
    fetchFeedbacks();
    fetchTopSellingItems();
    fetchTopCustomers();
  }, []);

  const fetchRevenue = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/revenue");
      setTotalRevenueMonth(response.data.totalRevenueMonth);
      setTotalRevenueToday(response.data.totalRevenueToday);
    } catch (error) {
      console.error("Failed to fetch revenue:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/orders/all');
      const formattedOrders = response.data.map(order => ({
        key: order.order_id,
        order_id: order.order_id,
        customerName: order.customerName, 
        total_price: parseFloat(order.total_price).toFixed(2), 
        discount_applied: order.discount_applied ? parseFloat(order.discount_applied).toFixed(2) : "0.00"
      }));
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      message.error('Failed to fetch orders');
    }
  };

  const fetchCategorySales = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/admin/category-sales");
      const { FoodQuantity, BeverageQuantity, DessertQuantity } = response.data;

      const totalSales = FoodQuantity + BeverageQuantity + DessertQuantity;

      const categoryPercentage = totalSales > 0 ? {
        Food: Math.round((FoodQuantity / totalSales) * 100),
        Beverage: Math.round((BeverageQuantity / totalSales) * 100),
        Dessert: Math.round((DessertQuantity / totalSales) * 100),
      } : { Food: 0, Beverage: 0, Dessert: 0 };

      setCategorySales(categoryPercentage);


      setCategorySales(categoryPercentage);
    } catch (error) {
      console.error("Failed to fetch category sales:", error);
      message.error("Failed to fetch category sales.");
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/feedback");
      setFeedbacks(response.data.slice(0, 5)); 
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
    }
  };

  const fetchTopSellingItems = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/admin/top-items");
        console.log("Top Selling Items API Response:", response.data); 

        if (Array.isArray(response.data)) {
            setTopSellingItems(response.data);
        } else {
            setTopSellingItems([]);
        }
    } catch (error) {
        console.error("Failed to fetch top selling items:", error);
        message.error("Failed to fetch top selling items.");
        setTopSellingItems([]);
    }
};

  const fetchTopCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/customer/top");
      setTopCustomers(response.data.slice(0, 3)); 
    } catch (error) {
      console.error("Failed to fetch top customers:", error);
    }
  };

  return (
    <Layout>
      <Header
        style={{
          background: "#001529",
          padding: "16px",
          color: "white",
          fontSize: "1.5rem",
          fontWeight: "bold",
        }}
      >
        Admin Dashboard
      </Header>

      <Content style={{ margin: "16px", padding: "16px", background: "#f0f2f5", minHeight: "100vh" }}>
        
        {/*Total Sales */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Total Sales This Month"
                value={totalRevenueMonth}
                precision={2}
                prefix="RM"
                valueStyle={{ fontSize: "1.8rem", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Today's Total Sales"
                value={totalRevenueToday}
                precision={2}
                prefix="RM"
                valueStyle={{ fontSize: "1.8rem", fontWeight: "bold" }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Recent Orders" style={{ marginTop: "16px" }}>
          <Table
            columns={[
              { title: "Order ID", dataIndex: "order_id", key: "order_id" },
              { title: "Customer Name", dataIndex: "customerName", key: "customerName" },
              { title: "Total Price (RM)", dataIndex: "total_price", key: "total_price", render: price => `RM${price}` },
              { title: "Discount Applied (RM)", dataIndex: "discount_applied", key: "discount_applied", render: discount => `RM${discount}` }
            ]}
            dataSource={orders}
            rowKey="order_id"
            pagination={{
              current: currentPage,
              pageSize: pageSize, 
              total: orders.length, 
              showSizeChanger: true, 
              pageSizeOptions: ["5", "10", "20", "50"],
              onChange: (page, newPageSize) => {
                setCurrentPage(page);
                setPageSize(newPageSize);
              },
            }}
          />
        </Card>

        <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
          {/*Sales Breakdown by Category */}
          <Col span={12}>
            <Card title="Sales Breakdown by Category">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card title="Food">
                    <Progress type="circle" percent={categorySales.Food} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="Beverage">
                    <Progress type="circle" percent={categorySales.Beverage} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="Dessert">
                    <Progress type="circle" percent={categorySales.Dessert} />
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>

          {/*Customer Feedback */}
          <Col span={12}>
            <Card title="Customer Feedback" style={{ height: "330px", overflowY: "auto" }}>
              <List
                dataSource={feedbacks}
                renderItem={(feedback) => (
                  <List.Item>
                    <CommentOutlined /> {feedback.feedback}
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
          {/*Top Selling Item */}
          <Col span={12}>
            <Card title="Top Selling Items">
              {Array.isArray(topSellingItems) && topSellingItems.length > 0 ? (
                  <List
                      dataSource={topSellingItems}
                      renderItem={(item) => (
                          <List.Item>
                              <ShoppingCartOutlined /> {item.item_name} - {item.total_sold} Sold
                          </List.Item>
                      )}
                  />
              ) : (
                  <p>No top-selling items available.</p> 
              )}
            </Card>
          </Col>

          {/*Top Customers by Membership Points */}
          <Col span={12}>
            <Card title="Top Customers">
              <List
                dataSource={topCustomers}
                renderItem={(customer) => (
                  <List.Item>
                    <UserOutlined /> {customer.customerName} - {customer.points} Points
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Dashboard;
