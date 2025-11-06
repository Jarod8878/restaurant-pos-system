import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Toast, SpinLoading, Card } from 'antd-mobile';
import { EyeOutline, EyeInvisibleOutline, UserOutline, LockOutline } from 'antd-mobile-icons';
import { API_BASE } from '../../config/api';
import background from '../../assets/Background.jpg';
import '../../CSS/Mobile/CustomerLoginMobile.css';

const CustomerLoginMobile = ({ setCustomerId, setPhoneNumber }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ customerName: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLogin = async () => {
        const { customerName, password } = formData;
        if (!customerName || !password) {
            Toast.show({ icon: 'fail', content: 'Please enter all fields' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/customer/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerName, password }),
            });

            const data = await response.json();
            setLoading(false);

            if (data.success) {
                localStorage.setItem('customerId', data.customerId);
                localStorage.setItem('phoneNumber', data.phoneNumber);
                setCustomerId?.(data.customerId);
                setPhoneNumber?.(data.phoneNumber);

                Toast.show({ icon: 'success', content: data.message || 'Login successful!' });
                navigate('/menuItemsMobile');
            } else {
                Toast.show({ icon: 'fail', content: data.message || 'Login failed' });
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            Toast.show({ icon: 'fail', content: 'Something went wrong. Please try again.' });
        }
    };

    return (
        <div
            className="AuthPage"
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20
            }}
        >
            <Card
                title="Customer Login"
                style={{
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: 16,
                }}
            >
                {/* Username Input */}
                <Input
                    placeholder="Username"
                    prefix={<UserOutline />}
                    value={formData.customerName}
                    onChange={val => handleChange('customerName', val)}
                    style={{ marginBottom: 16 }}
                    autoComplete='new-username'
                />

                {/* Password Input with Eye Toggle */}
                <div style={{ position: 'relative', marginBottom: 16 }}>
                    <Input
                        placeholder="Password"
                        type={visible ? 'text' : 'password'}
                        prefix={<LockOutline />}
                        value={formData.password}
                        onChange={val => handleChange('password', val)}
                        style={{ paddingRight: 40 }}
                        autoComplete='new-password'
                    />
                    <div
                        style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            cursor: 'pointer'
                        }}
                    >
                        {visible ? (
                            <EyeOutline onClick={() => setVisible(false)} />
                        ) : (
                            <EyeInvisibleOutline onClick={() => setVisible(true)} />
                        )}
                    </div>
                </div>

                {/* Login Button */}
                <Button
                    block
                    color="primary"
                    size="large"
                    onClick={handleLogin}
                    loading={loading}
                >
                    {loading ? <SpinLoading color="white" /> : 'Login as Guest'}
                </Button>

                {/* Register*/}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <span style={{ color: '#888' }}>Don't have an account?</span><br />
                    <Button color="warning" fill="none" onClick={() => navigate('/registerMobile')} size="small">
                        Register Here
                    </Button>
                </div>

                <div style={{ marginTop: 10 }}>
                    <Button
                        block
                        style={{
                            backgroundColor: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: 8,
                            fontWeight: '500',
                            marginBottom: 8
                        }}
                        onClick={() => navigate('/forgot-password-mobile')}
                    >
                        Forgot Password
                    </Button>
                    <Button
                        block
                        style={{
                            backgroundColor: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: 8,
                            fontWeight: '500'
                        }}
                        onClick={() => navigate('/')}
                    >
                        Back
                    </Button>
                </div>

            </Card>
        </div>
    );
};

export default CustomerLoginMobile;
