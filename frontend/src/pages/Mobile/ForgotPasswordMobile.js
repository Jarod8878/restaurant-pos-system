import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, SpinLoading, Card } from 'antd-mobile';
import { message } from 'antd';
import { API_BASE } from '../../config/api';
import background from '../../assets/Background.jpg';

const ForgotPasswordMobile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    const handleReset = async () => {
        if (!email) {
            message.error("Please enter your email.");
            return;
        }

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!isValidEmail) {
            message.error("Please enter a valid email format.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/customer/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (data.success) {
                message.success("A Temporary Password has been sent to your email");
                setTimeout(() => navigate('/customer-login-mobile'), 2500);
            } else {
                message.error("Fail to reset password");
            }
        } catch (err) {
            message.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
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
                padding: 20,
            }}
        >
            <Card
                title="Reset Password"
                style={{
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: 16,
                }}
            >
                <Input
                    placeholder="Registered Email"
                    value={email}
                    clearable
                    type="email"
                    onChange={(val) => setEmail(val)}
                    style={{ marginBottom: 12 }}
                    autoComplete="off"
                />

                <Button
                    block
                    color="primary"
                    size="large"
                    onClick={handleReset}
                    loading={loading}
                >
                    {loading ? <SpinLoading color="white" /> : 'Send Temporary Password'}
                </Button>

                <Button
                    block
                    fill="none"
                    onClick={() => navigate('/customer-login-mobile')}
                    style={{ marginTop: 12 }}
                >
                    Back to Login
                </Button>
            </Card>
        </div>
    );
};

export default ForgotPasswordMobile;
