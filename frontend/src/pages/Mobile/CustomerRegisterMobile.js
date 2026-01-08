import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Card, Space, SpinLoading } from 'antd-mobile';
import { EyeOutline, EyeInvisibleOutline, UserOutline, PhonebookOutline, LockOutline, MailOutline } from 'antd-mobile-icons';
import { message } from 'antd'
import { API_BASE } from '../../config/api';
import background from '../../assets/Background.jpg';
import '../../CSS/Mobile/CustomerLoginMobile.css';

const CustomerRegisterMobile = () => {
    const navigate = useNavigate();
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const getPasswordStrength = (password) => {
        if (password.length < 8) return { level: 'Too short', color: 'red' };
        if (!/[A-Z]/.test(password)) return { level: 'Add uppercase', color: 'orange' };
        if (!/[0-9]/.test(password)) return { level: 'Add numbers', color: 'orange' };
        if (!/[^A-Za-z0-9]/.test(password)) return { level: 'Add special char', color: 'orange' };
        if (password.length >= 10) return { level: 'Strong password', color: 'green' };
        return { level: 'Good', color: 'lightgreen' };
    };

    const handleRegister = async () => {
        if (!customerName || !email ||!phoneNumber || !password) {
            message.error('Please fill in all required fields');
            return;
        }

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValidEmail) {
            message.error('Please enter a valid email address');
            return;
        }

        if (password.length < 8) {
            message.error('Password must be at least 8 characters long');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/customer/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerName, email, phoneNumber, password }),
            });

            const data = await response.json();

            if (data.success) {
                message.success('Registration Successful');
                setTimeout(() => navigate(-1), 2000);
            } else {
                message.error(data.message || 'Registration Failed');
            }
        } catch (err) {
            message.error('Something went wrong, please try again');
        } finally {
            setLoading(false);
        }
    };

    const strength = getPasswordStrength(password);

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
                title="Customer Registration"
                style={{
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: 16,
                }}
            >
                <Space direction="vertical" block style={{ marginTop: 8 }}>
                    <Input
                        placeholder="Username"
                        prefix={<UserOutline />}
                        clearable
                        className="adm-input"
                        value={customerName}
                        onChange={val => setCustomerName(val)}
                        autoComplete='new-username'
                    />
                    <Input
                        placeholder="Email"
                        prefix={<MailOutline />}
                        clearable
                        type="email"
                        value={email}
                        onChange={val => setEmail(val)}
                        autoComplete='new-email'
                    />
                    <Input
                        placeholder="Phone Number"
                        prefix={<PhonebookOutline />}
                        clearable
                        maxLength={12}
                        value={phoneNumber}
                        onChange={(val) => {
                            const cleaned = val.replace(/[^0-9-]/g, '');
                            setPhoneNumber(cleaned);
                        }}
                        autoComplete='off'
                    />
                    <div style={{ position: 'relative' }}>
                        <Input
                            placeholder="Password"
                            type={showPassword ? 'text' : 'password'}
                            prefix={<LockOutline />}
                            value={password}
                            onChange={val => setPassword(val)}
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
                            {showPassword ? (
                                <EyeOutline onClick={() => setShowPassword(false)} />
                            ) : (
                                <EyeInvisibleOutline onClick={() => setShowPassword(true)} />
                            )}
                        </div>
                    </div>
                    <div style={{ height: '6px', borderRadius: '4px', backgroundColor: '#ddd', marginTop: 4 }}>
                        <div
                            style={{
                                width: password ? `${Math.min(password.length * 10, 100)}%` : '0%',
                                height: '100%',
                                backgroundColor: strength.color,
                                transition: 'width 0.3s ease'
                            }}
                        />
                    </div>
                    <div style={{ fontSize: '12px', color: strength.color, marginTop: 4 }}>
                        {password && strength.level}
                    </div>

                    <Button
                        block
                        color="primary"
                        className="adm-button"
                        loading={loading}
                        onClick={handleRegister}
                    >
                        {loading ? <SpinLoading color="white" /> : 'Register'}
                    </Button>
                    <Button
                        block
                        fill="none"
                        className="adm-button"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

export default CustomerRegisterMobile;
