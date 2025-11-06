import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Card, Image, Typography, Row, Col,
    Button, Modal, message, Tabs, Checkbox
} from 'antd';
import { ShoppingCartOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import NavbarMobile from './navbarMobile';
import '../../CSS/MenuItemsMobile.css';
import { API_BASE } from '../../config/api';

const { Title, Text } = Typography;
const categories = ['All', 'Food', 'Beverage', 'Dessert'];

const MenuItemsMobile = ({ setCart }) => {
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [modalItem, setModalItem] = useState(null);
    const getVariantKey = (itemId, remarks) => `${itemId}_${remarks || ''}`;

    useEffect(() => {
        axios.get(`${API_BASE}/api/items`)
            .then(response => {
                const items = response.data.filter(item =>
                    item.is_available === 1 && item.available_amount > 0
                );
                setMenuItems(items);
            })
            .catch(error => console.error("Error fetching menu items:", error));
    }, []);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);
    }, [setCart]);

    const getInCartQty = (itemId, remarks) => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        return cart
            .filter(i => i.item_id === itemId && (i.remarks || '') === (remarks || ''))
            .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    };

    const getRemainingStock = (menuItems, itemId, remarks, quantities) => {
        const item = menuItems.find(m => m.item_id === itemId);
        if (!item) return 0;
        const available = Number(item.available_amount) || 0;
        const inCart = getInCartQty(itemId, remarks);
        const key = getVariantKey(itemId, remarks);
        const selectedNow = Number(quantities[key] || 0);
        return Math.max(available - inCart - selectedNow, 0);
    };
    
    const remaining = modalItem ? getRemainingStock(menuItems, modalItem.item_id, modalItem.remarks || '', quantities): 0;

    const incrementQuantity = (itemId, remarks) => {
        setQuantities(prev => {
            const remaining = getRemainingStock(menuItems, itemId, remarks, prev);
            if (remaining <= 0) {
                message.warning(remaining === 0 ? 'Out of stock for this option.' : 'Out of stock.');
                return prev;
            }
            const key = `${itemId}_${remarks || ''}`;
            return { ...prev, [key]: (prev[key] || 0) + 1 };
        });
    };

    const decrementQuantity = (itemId, remarks) => {
        const key = `${itemId}_${remarks || ''}`;
        setQuantities(prev => ({ ...prev, [key]: Math.max((prev[key] || 0) - 1, 0) }));
    };

    const handleCheckout = () => {
        navigate('/cartMobile');
    };

    const filteredItems = selectedCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.categoryName === selectedCategory);

    return (
        <div style={{ padding: '16px', background: '#f7f8fa', minHeight: '100vh', paddingBottom: 100 }}>
            <Card title="Browse Menu Items" style={{ borderRadius: 12 }}>
                <Tabs
                    activeKey={selectedCategory}
                    onChange={setSelectedCategory}
                    centered
                    type="card"
                    items={categories.map(cat => ({ key: cat, label: cat }))}
                />

                <Row gutter={[16, 16]}>
                    {filteredItems.map(item => (
                        <Col span={12} key={item.item_id}>
                            <Card
                                hoverable
                                onClick={() => setModalItem(item)}
                                style={{ height: '100%' }}
                                cover={
                                    item.image_url && (
                                        <Image
                                            src={`${API_BASE}${item.image_url}`}
                                            alt={item.name}
                                            height={140}
                                            preview={false}
                                            style={{ objectFit: 'cover', borderRadius: 4 }}
                                        />
                                    )
                                }
                            >
                                <div>
                                    <Text strong>{item.name}</Text>
                                </div>
                                <div style={{ marginTop: 8, color: 'green', fontWeight: 600 }}>
                                    RM {parseFloat(item.price).toFixed(2)}
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>

            {/* Item Modal */}
            <Modal
                open={!!modalItem}
                onCancel={() => setModalItem(null)}
                footer={null}
                centered
            >
                {modalItem && (
                    <>
                        <Title level={5} style={{ marginBottom: 8, textAlign: 'center' }}>
                            {modalItem.name}
                        </Title>

                        <div style={{
                            width: '100%', height: 180, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', overflow: 'hidden', borderRadius: 8,
                            marginBottom: 12, backgroundColor: 'transparent',
                        }}>
                            <img
                                src={`${API_BASE}${modalItem.image_url}`}
                                alt={modalItem.name}
                                style={{
                                    maxHeight: '100%', maxWidth: '100%', objectFit: 'contain',
                                }}
                            />
                        </div>

                        <p style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>{modalItem.description}</p>
                        <p style={{ fontSize: 16, fontWeight: 600, color: 'green', marginBottom: 16 }}>
                            RM {parseFloat(modalItem.price).toFixed(2)}
                        </p>

                        <p style={{ marginTop: 4, marginBottom: 12, fontSize: 12, color: remaining > 0 ? '#555' : 'red' }}>
                            {remaining > 0 ? `Only ${remaining} left` : 'Out of stock'}
                        </p>

                        {/* Remarks */}
                        {modalItem.categoryName === 'Beverage' ? (
                            <div style={{ marginBottom: 16 }}>
                                <Text strong>* Choose Option First</Text>
                                <Checkbox.Group
                                    value={modalItem.remarks ? [modalItem.remarks] : []}
                                    onChange={(checked) => {
                                        const selected = checked[0] || '';
                                        setModalItem((prev) => ({ ...prev, remarks: selected }));
                                    }}
                                    style={{ display: 'flex', flexDirection: 'column', marginTop: 8, gap: 8 }}
                                >
                                    {['Less Ice', 'Ice', 'Hot'].map((option) => (
                                        <Checkbox key={option} value={option}>{option}</Checkbox>
                                    ))}
                                </Checkbox.Group>
                                {!modalItem.remarks && (
                                    <p style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                                        Please select one option to proceed.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div style={{ marginBottom: 16 }}>
                                <Text strong>Remarks</Text>
                                <textarea
                                    rows={3}
                                    style={{
                                        width: '100%', padding: 8, borderRadius: 6,
                                        border: '1px solid #ccc', marginTop: 8,
                                    }}
                                    placeholder="E.g. No cheese, extra sauce"
                                    value={modalItem.remarks || ''}
                                    onChange={(e) =>
                                        setModalItem((prev) => ({ ...prev, remarks: e.target.value }))
                                    }
                                />
                            </div>
                        )}

                        {/* Quantity Controls */}
                        {(() => {
                            const key = `${modalItem.item_id}_${modalItem.remarks || ''}`;
                            const quantity = quantities[key] || 0;
                            return (
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', marginBottom: 16,
                                }}>
                                    <Button
                                        icon={<MinusOutlined />}
                                        onClick={() => decrementQuantity(modalItem.item_id, modalItem.remarks)}
                                        disabled={quantity === 0}
                                    />
                                    <span style={{ fontSize: 20, fontWeight: 'bold' }}>{quantity}</span>
                                    <Button
                                        icon={<PlusOutlined />}
                                        onClick={() => incrementQuantity(modalItem.item_id, modalItem.remarks)}
                                        disabled={remaining===0}
                                    />
                                </div>
                            );
                        })()}

                        {/* Add to Cart */}
                        <Button
                            block
                            type="primary"
                            size="large"
                            disabled={
                                !modalItem.remarks && modalItem.categoryName === 'Beverage'
                            }
                            onClick={() => {
                                const key = `${modalItem.item_id}_${modalItem.remarks || ''}`;
                                const quantity = quantities[key] || 0;
                                if (quantity === 0) return;

                                const updatedItem = {
                                    ...modalItem,
                                    quantity,
                                    total_price: parseFloat(modalItem.price) * quantity,
                                    remarks: modalItem.remarks || ''
                                };

                                const newCart = (() => {
                                    const prevCart = JSON.parse(localStorage.getItem("cart")) || [];
                                    const existingIndex = prevCart.findIndex(
                                        i => i.item_id === updatedItem.item_id && i.remarks === updatedItem.remarks
                                    );

                                    if (existingIndex !== -1) {
                                        prevCart[existingIndex].quantity += updatedItem.quantity;
                                        prevCart[existingIndex].total_price += updatedItem.total_price;
                                        return [...prevCart];
                                    }

                                    return [...prevCart, updatedItem];
                                })();

                                setCart(newCart);
                                localStorage.setItem("cart", JSON.stringify(newCart));

                                // Reset quantity for this variant
                                setQuantities(prev => ({ ...prev, [key]: 0 }));

                                message.success("Item added to cart!");
                                setModalItem(null);
                            }}
                            style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
                        >
                            Add to Cart
                        </Button>
                    </>
                )}
            </Modal>

            {/* Checkout Button */}
            <div style={{
                position: 'fixed',
                bottom: 80,
                right: 24,
                zIndex: 1001
            }}>
                <Button
                    type="primary"
                    shape="round"
                    icon={<ShoppingCartOutlined />}
                    size="large"
                    style={{
                        backgroundColor: '#28a745',
                        border: 'none',
                        color: '#fff',
                        padding: '0 24px'
                    }}
                    onClick={handleCheckout}
                />
            </div>

            <NavbarMobile />
        </div>
    );
};

export default MenuItemsMobile;
