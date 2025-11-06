import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Toast, Card, Divider} from 'antd-mobile';
import NavbarMobile from './navbarMobile';
import { API_BASE } from '../../config/api';
import { LeftOutline } from 'antd-mobile-icons';


const HistoryDetailsMobile = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        axios
            .get(`${API_BASE}/api/invoice/${orderId}`)
            .then((response) => setOrder(response.data))
            .catch((error) => {
                console.error('Failed to fetch order details:', error);
                Toast.show({ content: 'Unable to fetch order details', duration: 2000 });
            });
    }, [orderId]);

    if (!order) {
        return <p style={{ textAlign: 'center', marginTop: 32 }}>Loading order details...</p>;
    }

    const { items, membership_points, discount_applied } = order;
    const computedTotal = Array.isArray(items)
        ? items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0)
        : 0;

    return (
        <div style={{ padding: '16px', paddingBottom: '72px' }}> 
            <NavbarMobile />
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                position: 'relative'
            }}>
                <LeftOutline
                    onClick={() => navigate('/orderHistoryMobile')}
                    style={{
                        position: 'absolute',
                        left: 0,
                        fontSize: 20,
                        cursor: 'pointer',
                        color: '#333'
                    }}
                />
                <h3 style={{ margin: 0 }}>Order Details</h3>
            </div>

            <Card style={{ borderRadius: 16, padding: '12px 16px', marginBottom: 20, backgroundColor: '#F8F9FF' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#888' }}>Points Earned</div>
                    <div style={{ fontWeight: 'bold', fontSize: 16, color: '#4B50E6' }}>{membership_points} pts</div>
                </div>
            </Card>

            {/* Order Info Block */}
            <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15 }}>Order ID:</span>
                    <span style={{ fontSize: 15, color: '#444' }}>#{orderId}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 15 }}>Order Type:</span>
                    <span style={{ fontSize: 15, color: '#444' }}>{order.order_type === 'preorder' ? 'Takeaway / Preorder' : 'Dine In'}</span>
                </div>

                {order.order_type === 'preorder' && order.preorder_datetime && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontWeight: 'bold', fontSize: 15 }}>Pickup Time:</span>
                        <span style={{ fontSize: 15, color: '#444' }}>
                            {new Date(order.preorder_datetime).toLocaleString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                )}
            </div>

            {/* Item List */}
            <div>
                <div style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 10 }}>Items:</div>
                {items.length === 0 ? (
                    <p>No items found.</p>
                ) : (
                    items.map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                marginBottom: 16,
                                borderBottom: '1px solid #eee',
                                paddingBottom: 12,
                            }}
                        >
                            <img
                                src={`${API_BASE}${item.image_url || ''}`}
                                alt={item.name}
                                style={{
                                    width: 60,
                                    height: 60,
                                    objectFit: 'cover',
                                    borderRadius: 10,
                                    marginRight: 12,
                                    backgroundColor: '#f2f2f2',
                                }}
                            />
                            <div style={{ flexGrow: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                                <div style={{ fontSize: 13, color: '#888' }}>x{item.quantity}</div>
                                {item.remarks && (
                                    <div style={{ fontSize: 13, color: '#d9534f', marginTop: 4 }}> {item.remarks}</div>
                                )}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>RM {parseFloat(item.total_price).toFixed(2)}</div>
                        </div>
                    ))
                )}
            </div>

            <Divider style={{ margin: '20px 0' }} />

            {/* Payment Details */}
            <div>
                <div style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 12 }}>Payment Details</div>

                <div style={rowStyle}>
                    <span>Amount:</span>
                    <span>RM {computedTotal.toFixed(2)}</span>
                </div>

                <div style={rowStyle}>
                    <span>Voucher</span>
                    <span style={{color:'red'}}>- RM {discount_applied ? parseFloat(discount_applied).toFixed(2) : '0.00'}</span>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ ...rowStyle, fontWeight: 600, fontSize: 16, color: '#000' }}>
                    <span>Grand Total</span>
                    <span>RM {computedTotal.toFixed(2)}</span>
                </div>

                <div style={{ ...rowStyle, marginTop: 12 }}>
                    <span>Membership Points Earned</span>
                    <span style={{ color: '#1677ff', fontWeight: 500 }}>{membership_points} pts</span>
                </div>

            </div>
        </div>
    );
};

const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 14,
    color: '#444',
};

export default HistoryDetailsMobile;
