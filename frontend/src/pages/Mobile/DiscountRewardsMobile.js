import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toast, Button } from 'antd-mobile';
import NavbarMobile from './navbarMobile';
import '../../CSS/Mobile/DiscountRewardsMobile.css';
import { API_BASE } from '../../config/api';

const DiscountRewardsMobile = () => {
    const navigate = useNavigate();
    const [discounts, setDiscounts] = useState([]);
    const [customerDiscounts, setCustomerDiscounts] = useState({});
    const [points, setPoints] = useState(0);

    const customerId = localStorage.getItem("customerId");

    useEffect(() => {
        if (!customerId) {
            Toast.show({ icon: 'fail', content: 'No user logged in.' });
            navigate('/');
            return;
        }

        axios.get(`${API_BASE}/api/discounts`)
            .then(response => setDiscounts(response.data))
            .catch(error => console.error("Error fetching discounts:", error));

        axios.get(`${API_BASE}/api/customer/discounts?customerId=${customerId}`)
            .then(response => {
                const discountMap = {};
                response.data.forEach(d => {
                    discountMap[d.discount_id] = d.remaining_uses;
                });
                setCustomerDiscounts(discountMap);
            })
            .catch(error => console.error("Error fetching customer discounts:", error));

        axios.get(`${API_BASE}/api/customer/profile`, {
            params: { customerId }
        })
            .then(res => {
                if (res.data?.customer?.points !== undefined) {
                    setPoints(res.data.customer.points);
                }
            })
            .catch(error => console.error("Error fetching customer profile:", error));
    }, [customerId, navigate]);

    const handleRedeem = async (discountId) => {
        try {
            const response = await axios.post(`${API_BASE}/api/discounts/redeem`, {
                customerId, discountId
            });

            Toast.show({
                icon: 'success',
                content: `Discount Redeemed! Code: ${response.data.code}, Value: RM${response.data.discountAmount}`,
            });

            setCustomerDiscounts(prev => ({
                ...prev,
                [discountId]: (prev[discountId] || 0) + 1
            }));

            setPoints(prev => prev - discounts.find(d => d.discount_id === discountId)?.points_required || 0);
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to redeem discount";
            Toast.show({ icon: 'fail', content: errorMessage });
        }
    };

    return (
        <div className="discounts-page">
            <div className="header">
                <div className="points-box">
                    <div className="title">Membership Points</div>
                    <div className="points">{points} pts</div>
                </div>
            </div>

            <div className="section-title">Vouchers / Discounts</div>

            <div className="voucher-scroll-container">
                <div className="voucher-scroll-row">
                    {discounts.length === 0 ? (
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <p>No discounts available.</p>
                        </div>
                    ) : (
                        discounts.map(discount => (
                            <div key={discount.discount_id} className="voucher-card-horizontal">
                                <div className="voucher-content">
                                    <div className="voucher-title">{discount.description}</div>
                                    <div className="voucher-code">Code: <strong>{discount.code}</strong></div>  
                                    <div className="voucher-details">
                                        <div>Requires: <strong>{discount.points_required} pts</strong></div>
                                        <div>Remaining: {customerDiscounts[discount.discount_id] || 0}</div>
                                    </div>
                                    <Button
                                        size="small"
                                        color="warning"
                                        className="redeem-button"
                                        onClick={() => handleRedeem(discount.discount_id)}
                                        disabled={points < discount.points_required}
                                    >
                                        Redeem
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Button block className="back-btn" onClick={() => navigate(-1)}>
                Back
            </Button>

            <NavbarMobile />
        </div>
    );
};

export default DiscountRewardsMobile;
