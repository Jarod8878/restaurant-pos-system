import { useMemo, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { List, Toast, Modal, Button, Input, Space, Divider, Card } from 'antd-mobile';
import { ExclamationCircleOutline, CouponOutline, ShopbagOutline, DeleteOutline } from 'antd-mobile-icons';
import NavbarMobile from './navbarMobile';
import { API_BASE } from '../../config/api';


const computeSubTotal = (cartItems) =>
    cartItems.reduce((subTotal, item) => subTotal + item.total_price, 0);

const CartMobile = ({ cart, setCart }) => {
    const navigate = useNavigate();
    const subTotal = computeSubTotal(cart);
    const [orderId, setOrderId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const [isCounting, setIsCounting] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountMap, setDiscountMap] = useState({});
    const [orderType, setOrderType] = useState("dine_in");
    const [preorderTime, setPreorderTime] = useState('');
    const customerId = localStorage.getItem('customerId');

    useEffect(() => {
        if (cart.length === 0) {
            const storedCart = localStorage.getItem("cart");
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
        }
    }, [cart.length, setCart]);

    useEffect(() => {
        axios.get(`${API_BASE}/api/customer/discounts?customerId=${customerId}`)
            .then(({ data }) => {
                const map = data.reduce((acc, d) => {
                    if (d.discount_code && d.discount_id) {
                        acc[d.discount_code] = d.discount_id;
                    }
                    return acc;
                }, {});
                setDiscountMap(map);
            });
    }, [customerId]);

    const handleRemoveItem = (itemId, remarks) => {
        const updatedCart = cart.filter(item => !(item.item_id === itemId && item.remarks === remarks));
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        Toast.show({ icon: 'success', content: 'Item Removed' });
    }

    const handleApplyDiscount = async () => {
        if (!discountCode || !discountMap[discountCode]) {
            Toast.show({ icon: 'fail', content: "Invalid or missing discount code." });
            return;
        }
        try {
            const { data } = await axios.post(`${API_BASE}/api/discounts/apply`, {
                customerId,
                discountCode,
                orderId,
            });
            setDiscountAmount(parseFloat(data.discountAmount) || 0);
            Toast.show({ icon: 'success', content: `Applied! - RM${data.discountAmount}` });
        } catch {
            Toast.show({ icon: 'fail', content: "Failed to apply discount" });
            setDiscountAmount(0);
        }
    };

    const handleConfirmOrder = useCallback(async () => {
        setShowPopup(false);
        setIsCounting(false);

        if (!customerId) {
            Toast.show({ icon: 'fail', content: "Please log in to place an order" });
            return;
        }

        if (orderType === 'preorder' && !preorderTime) {
            Toast.show({ icon: 'fail', content: "Please select pickup time" });
            return;
        }


        try {
            const { data } = await axios.post(`${API_BASE}/api/orderPoints`, {
                customerId,
                order_type: orderType,
                preorder_datetime: orderType === 'preorder' ? preorderTime : null,
                sales: cart.map(({ item_id, quantity, total_price, remarks }) => ({
                    item_id,
                    quantity,
                    total_price: parseFloat(total_price),
                    remarks: remarks || ''
                })),
                discountCode,
                discountAmount,
            });

            setOrderId(data.orderId);
            Toast.show({ icon: 'success', content: "Order placed successfully!" });
            setCart([]);
            localStorage.removeItem("cart");
        } catch {
            Toast.show({ icon: 'fail', content: "Order failed. Try again." });
        }
    }, [customerId, cart, setCart, discountCode, discountAmount, orderType, preorderTime]);

    const handleCancelOrder = () => {
        setShowPopup(false);
        setIsCounting(false);
        setCountdown(10);
    };

    useEffect(() => {
        if (orderId) navigate(`/invoiceMobile/${orderId}`);
    }, [orderId, navigate]);

    useEffect(() => {
        let timer;
        if (showPopup && !isCounting) {
            setCountdown(10);
            setIsCounting(true);
        }
        if (isCounting && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0 && isCounting) {
            setIsCounting(false);
            setShowPopup(false);
            handleConfirmOrder();
        }
        return () => clearTimeout(timer);
    }, [showPopup, countdown, isCounting, handleConfirmOrder]);

    const pickupOptions = useMemo(() => {
        return [15, 30, 45, 60].map(min => {
            const time = new Date(Date.now() + min * 60000);
            return {
                label: `${min} mins from now (${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
                value: time.toISOString()
            };
        });
    }, []);

    return (
        <div style={{ padding: '16px', paddingBottom: '90px' }}>
            <Button
                onClick={() => navigate('/menuItemsMobile')}
                fill="none"
                size="small"
                style={{ marginBottom: 10, fontWeight: 'bold' }}
            >
                ← Menu
            </Button>
            <h3 style={{ fontSize: '22px', marginBottom: 16 }}>Your Cart</h3>

            {cart.length === 0 ? (
                <div style={{ color: '#999', textAlign: 'center', marginTop: 40 }}>
                    <ExclamationCircleOutline style={{ fontSize: 48 }} />
                    <p>Your cart is empty.</p>
                </div>
            ) : (
                <>
                    <List header="Order Summary" style={{ borderRadius: 8, background: '#fff' }}>
                        {cart.map((item, index) => (
                            <List.Item
                                key={`${item.item_id}_${item.remarks || ''}_${index}`}
                                description={`RM${parseFloat(item.price).toFixed(2)} × ${item.quantity}`}
                                extra={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>RM{parseFloat(item.total_price).toFixed(2)}</span>
                                        <DeleteOutline
                                            onClick={() => handleRemoveItem(item.item_id, item.remarks)}
                                            style={{ color: 'red', fontSize: 20, cursor: 'pointer' }}
                                        />
                                    </div>
                                }
                            >

                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                                    {item.remarks && (
                                        <span style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                                            {item.remarks}
                                        </span>
                                    )}
                                </div>
                            </List.Item>

                        ))}

                    </List>

                    <Divider style={{ margin: '16px 0' }} />

                    <Card style={{ background: '#f9f9f9' }}>
                        <div style={{ fontSize: 14, color: '#333', marginBottom: 6 }}>
                            <strong>Sub-Total:</strong> RM{subTotal.toFixed(2)}
                        </div>
                        {discountAmount > 0 && (
                            <div style={{ fontSize: 14, color: 'green', marginBottom: 6 }}>
                                <strong>Discount:</strong> -RM{discountAmount.toFixed(2)}
                            </div>
                        )}
                        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            Final Total: RM{Math.max(0, subTotal - discountAmount).toFixed(2)}
                        </div>

                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Input
                                prefix={<CouponOutline />}
                                placeholder="Enter Discount Code"
                                value={discountCode}
                                onChange={(val) => setDiscountCode(val)}
                            />
                            <Button
                                block
                                color="primary"
                                onClick={handleApplyDiscount}
                                disabled={!discountCode || !discountMap[discountCode] || discountAmount > 0}
                            >
                                Apply Discount
                            </Button>

                            <Divider style={{ margin: '16px 0' }} />

                            <div style={{ marginBottom: 16 }}>
                                <label>Order Type:</label>
                                <Space style={{ marginTop: 8, marginLeft:8 }}>
                                    <Button
                                        size="small"
                                        color={orderType === 'dine_in' ? 'primary' : 'default'}
                                        onClick={() => setOrderType('dine_in')}
                                    >
                                        Dine In
                                    </Button>
                                    <Button
                                        size="small"
                                        color={orderType === 'preorder' ? 'primary' : 'default'}
                                        onClick={() => setOrderType('preorder')}
                                    >
                                        Takeaway / Preorder
                                    </Button>
                                </Space>

                                {orderType === 'preorder' && (
                                    <div style={{ marginTop: 12 }}>
                                        <select
                                            className="form-select"
                                            style={{ width: '100%', padding: 8, fontSize: 14 }}
                                            value={preorderTime}
                                            onChange={(e) => setPreorderTime(e.target.value)}
                                        >
                                            <option value="">-- Select Pickup Time --</option>
                                            {pickupOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <Button
                                block
                                color="success"
                                icon={<ShopbagOutline />}
                                onClick={() => setShowPopup(true)}
                            >
                                Place Order
                            </Button>
                        </Space>
                    </Card>
                </>
            )}

            <Modal
                visible={showPopup}
                content={`Your order will be placed automatically in ${countdown}s.`}
                closeOnAction
                actions={[
                    { key: 'cancel', text: 'Cancel', onClick: handleCancelOrder },
                    { key: 'confirm', text: `Confirm (${countdown}s)`, bold: true, onClick: handleConfirmOrder }
                ]}
            />

            <NavbarMobile />
        </div>
    );
};

export default CartMobile;
