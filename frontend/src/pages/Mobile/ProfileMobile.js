import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Toast, DotLoading, AutoCenter, Card, } from 'antd-mobile';
import { UserOutline, } from 'antd-mobile-icons';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import NavbarMobile from './navbarMobile';
import { API_BASE } from '../../config/api';

const ProfileMobile = () => {
    const navigate = useNavigate();
    const [customer, setCustomer] = useState({
        customerId: '',
        customerName: '',
        email:'',
        phoneNumber: '',
        points: 0,
    });
    const [originalCustomer, setOriginalCustomer] = useState(null);
    const [,setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const customerId = localStorage.getItem('customerId');

    const getPasswordStrength = (password) => {
        if (password.length < 8) return { level: 'Too short', color: 'red' };
        if (!/[A-Z]/.test(password)) return { level: 'Add uppercase', color: 'orange' };
        if (!/[0-9]/.test(password)) return { level: 'Add numbers', color: 'orange' };
        if (!/[^A-Za-z0-9]/.test(password)) return { level: 'Add special char', color: 'orange' };
        if (password.length >= 10) return { level: 'Strong password', color: 'green' };
        return { level: 'Good', color: 'lightgreen' };
    };

    useEffect(() => {
        if (!customerId) {
            Toast.show({ icon: 'fail', content: 'No user logged in.' });
            navigate('/');
            return;
        }

        axios
            .get(`${API_BASE}/api/customer/profile`, {
                params: { customerId },
            })
            .then(({ data }) => {
                if (data.success) {
                    const loaded = { ...data.customer, customerId };
                    setCustomer(loaded);
                    setOriginalCustomer(loaded);
                } else {
                    Toast.show({ icon: 'fail', content: 'Failed to load profile.' });
                }
            })
            .catch(() => Toast.show({ icon: 'fail', content: 'Failed to fetch profile.' }))
            .finally(() => setLoading(false));
    }, [customerId, navigate]);

    const formatPhoneNum = (input) => {
        const digits = String(input || '').replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 3) return digits;
        return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    };

    const validate = () => {
        const newErrors = {};
        const name = customer.customerName.trim();
        const email = customer.email.trim();
        const phone = (customer.phoneNumber || '').replace(/\D/g, '');

        if (!name) newErrors.customerName = 'Username cannot be empty.';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) newErrors.email = 'Email is required.';
        else if (!emailRegex.test(email)) newErrors.email = 'Invalid email address.';

        if (!phone) newErrors.phoneNumber = 'Phone number is required.';
        else if (!/^01\d{8,10}$/.test(phone))
            newErrors.phoneNumber = 'Use XXX-XXXXXXX or XXX-XXXXXXXX';

        if (newPassword && newPassword.length < 8)
            newErrors.newPassword = 'Password must be at least 8 characters.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdate = async () => {
        if (!validate()) return;
        try {
            setSaving(true);
            await axios.put(`${API_BASE}/api/customer/update`, {
                customerId,
                customerName: customer.customerName.trim(),
                email: customer.email.trim(),
                phoneNumber: customer.phoneNumber.trim(),
                newPassword: newPassword || undefined,
            });
            Toast.show({ icon: 'success', content: 'Updated successfully!' });
            setEditMode(false);
            setNewPassword('');

            const { data } = await axios.get(`${API_BASE}/api/customer/profile`, { params: { customerId } });
            const fresh = { ...data.customer, customerId };
            setCustomer(fresh);
            setOriginalCustomer(fresh);
        } catch {
            Toast.show({ icon: 'fail', content: 'Update failed.' });
        } finally {
            setSaving(false);
        }
    };
    const handleCancelEdit = () => {
        if (originalCustomer) setCustomer(originalCustomer); 
        setNewPassword('');
        setErrors({});
        setEditMode(false);
    };

    return (
        <div style={{ padding: 16, background: '#f2f4f7', minHeight: '100vh' }}>
            <Card
                style={{
                    borderRadius: 16,
                    boxShadow: '0 6px 16px rgba(0,0,0,0.04)',
                    maxWidth: 360,
                    margin: 'auto',
                    padding: 24,
                    textAlign: 'center',
                }}
            >
                <AutoCenter>
                    <div style={{ fontSize: 50, marginTop: 12, color: '#555' }}>
                        <UserOutline />
                    </div>
                    <h3 style={{ fontSize: 22, margin: '8px 0 20px' }}>My Profile</h3>
                </AutoCenter>

                {loading ? (
                    <AutoCenter style={{ marginTop: 40 }}>
                        <DotLoading color="primary" />
                    </AutoCenter>
                ) : (
                    <>
                        {/* Username */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 6 }}>Username</div>
                            {editMode ? (
                                <>
                                    <Input
                                        value={customer.customerName}
                                        onChange={(val) => {
                                            setCustomer({ ...customer, customerName: val });
                                            if (errors.customerName) {
                                                setErrors((prev) => ({ ...prev, customerName: '' }));
                                            }
                                        }}
                                        placeholder="Enter your name"
                                        clearable
                                        style={{
                                            '--font-size': '16px',
                                            border: '1px solid #ccc',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            backgroundColor: '#fff',
                                        }}
                                    />
                                    {errors.customerName && (
                                        <div style={{ color: 'red', fontSize: 13, marginTop: 4 }}>
                                            {errors.customerName}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ fontSize: 16 }}>{customer.customerName}</div>
                            )}
                        </div>
                        {/* Email */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 6 }}>Email</div>
                            {editMode ? (
                                <>
                                    <Input
                                        value={customer.email}
                                        onChange={(val) => setCustomer({ ...customer, email: val })}
                                        placeholder="Enter your email"
                                        clearable
                                        style={{ '--font-size': '16px', border: '1px solid #ccc', padding: '10px', borderRadius: '8px', backgroundColor: '#fff' }}
                                    />
                                    {errors.email && <div style={{ color: 'red', fontSize: 13 }}>{errors.email}</div>}
                                </>
                            ) : (
                                <div style={{ fontSize: 16 }}>{customer.email}</div>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 6 }}>Phone Number</div>
                        {editMode ? (
                            <>
                                <Input
                                    value={customer.phoneNumber}
                                    maxLength={12}
                                    inputMode='numeric'
                                    pattern='\d{3}-\d{7,8}'
                                    clearable
                                    onChange={(val) => {
                                        const newNum = formatPhoneNum(val); 
                                        setCustomer({ ...customer, phoneNumber: newNum });
                                        if (errors.phoneNumber) {
                                            setErrors((prev) => ({ ...prev, phoneNumber: '' }));
                                        }
                                    }}
                                    placeholder="Enter your phone number"
                                    style={{
                                        '--font-size': '16px',
                                        border: '1px solid #ccc',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        backgroundColor: '#fff',
                                    }}
                                />
                                {errors.phoneNumber && (
                                    <div style={{ color: 'red', fontSize: 13, marginTop: 4 }}>
                                        {errors.phoneNumber}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ fontSize: 16 }}>{customer.phoneNumber}</div>
                        )}

                        {editMode && (
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 6, marginTop: 30 }}>New Password</div>
                                <div style={{ position: 'relative' }}>
                                    <Input
                                        placeholder="Enter new password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(val) => {
                                            setNewPassword(val);
                                            if (errors.newPassword) {
                                                setErrors((prev) => ({ ...prev, newPassword: '' }));
                                            }
                                        }}
                                        clearable
                                        style={{
                                            '--font-size': '16px',
                                            border: '1px solid #ccc',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            backgroundColor: '#fff',
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: 12,
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                    </div>
                                </div>
                                {/* Password strength bar */}
                                {newPassword && (
                                    <>
                                        <div style={{ height: '6px', borderRadius: '4px', backgroundColor: '#ddd', marginTop: 4 }}>
                                            <div
                                                style={{
                                                    width: `${Math.min(newPassword.length * 10, 100)}%`,
                                                    height: '100%',
                                                    backgroundColor: getPasswordStrength(newPassword).color,
                                                    transition: 'width 0.3s ease'
                                                }}
                                            />
                                        </div>
                                        <div style={{ fontSize: '12px', color: getPasswordStrength(newPassword).color, marginTop: 4 }}>
                                            {getPasswordStrength(newPassword).level}
                                        </div>
                                    </>
                                )}
                                {errors.newPassword && (
                                    <div style={{ color: 'red', fontSize: 13, marginTop: 4 }}>
                                        {errors.newPassword}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Membership Points */}
                        <div style={{ marginBottom: 30 }}>
                            <div style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 6 }}>Membership Points</div>
                            <div style={{ fontSize: 16 }}>{customer.points}</div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: 24, flexWrap: 'wrap' }}>
                            <Button
                                style={{
                                    padding: '8px 24px',
                                    borderRadius: 6,
                                    border: '1px solid #ccc',
                                    backgroundColor: '#fff',
                                    color: '#333',
                                    fontSize: 15,
                                }}
                                onClick={() => navigate('/menuItemsMobile')}
                            >
                                Back
                            </Button>

                            {editMode ? (
                                <>
                                    <Button
                                        style={{
                                            padding: '8px 24px',
                                            borderRadius: 6,
                                            backgroundColor: '#1677ff',
                                            color: '#fff',
                                            border: 'none',
                                            fontSize: 15,
                                        }}
                                        onClick={handleUpdate}
                                    >
                                        Save
                                    </Button>

                                    <Button
                                        style={{
                                            padding: '8px 24px',
                                            borderRadius: 6,
                                            backgroundColor: '#fff',
                                            color: '#ff4d4f',
                                            border: '1px solid #ff4d4f',
                                            fontSize: 15,
                                        }}
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    style={{
                                        padding: '8px 24px',
                                        borderRadius: 6,
                                        backgroundColor: '#1677ff',
                                        color: '#fff',
                                        border: 'none',
                                        fontSize: 15,
                                    }}
                                    onClick={() => setEditMode(true)}
                                >
                                    Edit
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </Card>

            <NavbarMobile />
        </div>
    );
};

export default ProfileMobile;
