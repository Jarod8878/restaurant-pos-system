import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Typography, Alert, Spin, InputNumber, Button, Table, Card, message, Space, Tabs, } from 'antd';

const { Title } = Typography;

const SettingNotification = () => {
  const [dailySales, setDailySales] = useState(null);
  const [threshold, setThreshold] = useState();
  const [conversionRate, setConversionRate] = useState();
  const [targetSales, setTargetSales] = useState(1000);
  const [loadingSales, setLoadingSales] = useState(false);

  const fetchMinStockAmount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/admin/low_stock_amount');
      if (response.data.value) {
        setThreshold(parseInt(response.data.value));
      }
    } catch (err) {
      console.error("Failed to fetch threshold", err);
      message.error("Failed to load threshold");
    }
  };

  const fetchConversionRate = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/admin/getPointsConversionRate');
      if (response.data.value) {
        setConversionRate(parseFloat(response.data.value));
      }
    } catch (err) {
      console.error("Failed to fetch conversion rate", err);
      message.error("Failed to load conversion rate");
    }
  };

  const updateThreshold = async () => {
    try {
      await axios.put('http://localhost:3000/api/admin/updateLowStockAmount', {
        threshold,
      });
      message.success("Minimum stock threshold updated");
    } catch (err) {
      console.error("Failed to update threshold", err);
      message.error("Failed to update threshold");
    }
  };

  const updateConversionRate = async () => {
    try {
      await axios.put('http://localhost:3000/api/admin/updatePointsConversionRate', {
        newRate: conversionRate,
      });
      message.success("Conversion rate updated");
    } catch (err) {
      console.error("Failed to update conversion rate", err);
      message.error("Failed to update conversion rate");
    }
  };

  const fetchSalesStatus = useCallback(async () => {
    setLoadingSales(true);
    try {
      const response = await axios.get('http://localhost:3000/api/admin/daily-sales');
      if (response.data.success) {
        setDailySales(Number(response.data.totalSales || 0));
      }
    } catch (err) {
      console.error('Error fetching daily sales:', err);
    } finally {
      setLoadingSales(false);
    }
  }, []);

  useEffect(() => {
    fetchMinStockAmount();
    fetchConversionRate();
  }, []);

  const tabItems = [
    {
      key: '1',
      label: 'Settings',
      children: (
        <Table
          bordered
          pagination={false}
          dataSource={[
            {
              key: 'threshold',
              setting: 'Minimum Stock Amount for Alert',
              value: (
                <Space align="start">
                  <InputNumber
                    min={1}
                    value={threshold}
                    onChange={setThreshold}
                  />
                  <Button
                    type="primary"
                    onClick={updateThreshold}
                    style={{ marginTop: '0px' }}
                  >
                    Confirm
                  </Button>
                </Space>

              ),
            },
            {
              key: 'conversion',
              setting: 'Points Conversion Rate (RM → 1 point)',
              value: (
                <Space align="start">
                  <InputNumber
                    min={1}
                    step={1}
                    value={conversionRate}
                    parser={(value) => parseInt(value, 10)}
                    onChange={(val) => setConversionRate(Math.round(val))}
                  />
                  <Button
                    type="primary"
                    onClick={updateConversionRate}
                    style={{ marginTop: '0px' }}
                  >
                    Confirm
                  </Button>
                </Space>
              ),
            },
          ]}
          columns={[
            {
              title: 'Setting',
              dataIndex: 'setting',
              key: 'setting',
            },
            {
              title: 'Value',
              dataIndex: 'value',
              key: 'value',
              align: 'right',
            },
          ]}
          style={{ marginTop: 24 }}
        />
      ),
    },
    {
      key: '2',
      label: 'Daily Sales Target',
      children: (
        <Card
          title="Sales Target Status"
          extra={
            <Space>
              <span>Target (RM):</span>
              <InputNumber
                min={0}
                step={50}
                value={targetSales}
                onChange={setTargetSales}
              />
              <Button onClick={fetchSalesStatus}>Check</Button>
            </Space>
          }
        >
          {loadingSales ? (
            <Spin />
          ) : dailySales === null ? (
            <Alert
              message="Click 'Check' to view today's sales."
              type="info"
              showIcon
            />
          ) : dailySales >= targetSales ? (
            <Alert
              message={`You've hit RM${dailySales.toFixed(2)} in sales today!`}
              type="success"
              showIcon
            />
          ) : (
            <Alert
              message={`RM${dailySales.toFixed(2)} achieved. RM${(targetSales - dailySales).toFixed(2)} more to go.`}
              type="warning"
              showIcon
            />
          )}
        </Card>
      ),
    },
  ];

  return (
    <div className="notification-container" style={{ padding: '2rem' }}>
      <Title level={2}>Admin Settings</Title>
      <Tabs defaultActiveKey="1" items={tabItems} />
    </div>
  );
};

export default SettingNotification;
