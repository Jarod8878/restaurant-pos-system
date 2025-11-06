import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {Card,Button,TextArea,Toast,SpinLoading,Space,Modal,Rate} from 'antd-mobile';
import { SendOutline } from 'antd-mobile-icons';
import NavbarMobile from './navbarMobile';
import { API_BASE } from '../../config/api';

const FeedbackMobile = () => {
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedPhoneNumber = localStorage.getItem('phoneNumber');
        if (storedPhoneNumber) setPhoneNumber(storedPhoneNumber);
        setLoading(false);
    }, []);

    const handleSubmit = async () => {
        if (!feedback.trim()) {
            Toast.show({
                icon: 'fail',
                content: <span style={{ fontSize: 16 }}>Please enter feedback to submit.</span>,
                duration: 2000,
            });
            return;
        }

        try {
            await axios.post(`${API_BASE}/api/feedback`, {
                phoneNumber,
                feedback,
                rating
            });

            Toast.show({
                icon: 'success',
                content: <span style={{ fontSize: 16 }}>Feedback submitted!</span>,
                duration: 2000,
            });

            setFeedback('');
            setRating(0);
        } catch (error) {
            Toast.show({
                icon: 'fail',
                content: <span style={{ fontSize: 16 }}>Submission failed. Try again later.</span>,
                duration: 2000,
            });
        }
    };

    const handleBack = () => {
        if (feedback.trim()) {
            Modal.confirm({
                content: 'You have unsaved feedback. Are you sure you want to leave?',
                onConfirm: () => navigate(-1),
            });
        } else {
            navigate(-1);
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(to bottom right, #f7f9fc, #e3e8f0)',
            minHeight: '100vh',
            padding: '24px'
        }}>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <SpinLoading style={{ fontSize: 28 }} />
                </div>
            ) : (
                <>
                    <Card
                        style={{
                            borderRadius: 12,
                            background: '#fff',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            padding: '16px',
                            marginBottom: '16px'
                        }}
                    >
                        <h2 style={{ fontSize: '20px', margin: 0 }}>Share Your Feedback</h2>
                        <p style={{ fontSize: '14px', color: '#888', marginTop: 6 }}>
                            We’d love to hear your thoughts or suggestions to improve our service.
                        </p>
                    </Card>

                    <Card style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 15, marginBottom: 8 }}>Rate Your Experience:</div>
                        <Rate
                            value={rating}
                            onChange={setRating}
                            allowHalf
                            style={{ '--star-size': '24px', '--active-color': '#faad14' }}
                        />
                    </Card>

                    <Card
                        style={{
                            borderRadius: 12,
                            padding: '16px',
                            marginBottom: '24px',
                            background: '#fff',
                            boxShadow: '0 1px 6px rgba(0,0,0,0.05)'
                        }}
                    >
                        <TextArea
                            placeholder="Write your feedback..."
                            value={feedback}
                            onChange={val => setFeedback(val)}
                            rows={5}
                            maxLength={300}
                            showCount={{
                                formatter: (info) => `${info.count} / ${info.maxLength} characters`
                            }}
                            style={{
                                '--text-area-font-size': '15px',
                                '--text-area-color': '#333',
                                '--text-area-placeholder-color': '#ccc',
                            }}
                        />
                    </Card>

                    <Space direction="vertical" block style={{ width: '100%' }}>
                        <Button block onClick={handleBack}>
                            Back
                        </Button>

                        <Button
                            block
                            color="primary"
                            icon={<SendOutline />}
                            onClick={handleSubmit}
                        >
                            Submit
                        </Button>
                    </Space>
                </>
            )}
            <NavbarMobile />
        </div>
    );
};

export default FeedbackMobile;
