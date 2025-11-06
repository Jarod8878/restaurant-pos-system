import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Form,
    Input,
    Button,
    Typography,
    message,
    Spin,
    Card,
    Col,
    Space
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import '../../CSS/loginRegister.css';
import background from '../../assets/Background.jpg';

const { Title } = Typography;

const AdminLogin = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleStaffLogin = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/admin/login', values);
            setLoading(false);

            if (response.data.success) {
                message.success('Login successful!');
                navigate('/admin/dashboard');
            } else {
                message.error('Invalid username or password');
            }
        } catch (error) {
            setLoading(false);
            message.error('Invalid username or password');
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}
        >
            <Col xs={24} sm={20} md={12} lg={8}>
                <Card
                    title={<Title level={3} style={{ textAlign: 'center', marginBottom: 0 }}>Admin Login</Title>}
                    bordered={false}
                    style={{ borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                >
                    <Form layout="vertical" onFinish={handleStaffLogin}>
                        <Form.Item
                            name="username"
                            label="Username"
                            rules={[{ required: true, message: 'Please enter your username' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[{ required: true, message: 'Please enter your password' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large" disabled={loading}>
                                {loading ? <Spin size="small" /> : 'Login'}
                            </Button>
                        </Form.Item>
                    </Form>
                    <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
                        <Button block onClick={() => navigate('/')}>
                            Back
                        </Button>
                    </Space>
                </Card>
            </Col>
        </div>
    );
};

export default AdminLogin;
