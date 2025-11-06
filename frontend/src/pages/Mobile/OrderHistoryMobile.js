import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Toast } from 'antd-mobile';
import NavbarMobile from './navbarMobile';
import { API_BASE } from '../../config/api';
import '../../CSS/Mobile/OrderHistoryMobile.css';

const OrderHistoryMobile = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const customerId = localStorage.getItem('customerId');

  useEffect(() => {
    if (!customerId) {
      Toast.show({ content: 'You must be logged in to view your order history.', duration: 2000 });
      return;
    }

    axios
      .get(`${API_BASE}/api/orderPoints/customer/orders`, { params: { customerId } })
      .then((response) => {
        setOrders(response.data.orders || []);
      })
      .catch((error) => {
        console.error('Failed to fetch order history:', error);
        Toast.show({ content: 'Failed to fetch orders', duration: 2000 });
      });
  }, [customerId]);

  return (
    <div className="order-history-wrapper">
      <NavbarMobile />
      <div style={{ padding: '16px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Past Order History</h3>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888' }}>No orders found.</div>
        ) : (
          orders.map((order) => {
            const getStatusStyle = (status) => {
              switch (status) {
                case 'Completed':
                  return { color: 'green', message: 'Order has been completed' };
                case 'Preparing':
                  return { color: 'orange', message: 'Kitchen is preparing your order now' };
                case 'Cancelled':
                  return { color: 'red', message: 'Order has been cancelled' };
                default:
                  return { color: '#888', message: 'Unknown status' };
              }
            };

            const { color, message } = getStatusStyle(order.status);

            return (
              <Card
                key={order.order_id}
                className="order-card"
                onClick={() => navigate(`/historyDetailsMobile/${order.order_id}`)}
                title={<span style={{ color }}>{message}</span>}
                style={{ marginBottom: 14, borderRadius: 16 }}
              >
                <div className="order-info">
                  <p><strong>ID:</strong> <span style={{ color: '#1E1E1E' }}>#{order.order_id}</span></p>
                  <p><strong>Time:</strong> {new Date(order.created_date_time).toLocaleString()}</p>
                  <p><strong>Total Price:</strong> RM {parseFloat(order.total_price).toFixed(2)}</p>
                </div>
              </Card>
            );
          })

        )}
      </div>
    </div>
  );
};

export default OrderHistoryMobile;
