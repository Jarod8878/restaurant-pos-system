import React from 'react';
import { TabBar } from 'antd-mobile';
import { AppOutline, UserOutline, MessageOutline, GiftOutline, FileOutline } from 'antd-mobile-icons';

import { useNavigate, useLocation } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';

const NavbarMobile = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        {
            key: '/menuItemsMobile',
            title: 'Menu',
            icon: <AppOutline />,
        },
        {
            key: '/profileMobile',
            title: 'Profile',
            icon: <UserOutline />,
        },
        {
            key: '/orderHistoryMobile',
            title: 'Order History',
            icon: <FileOutline />,
        },
        {
            key: '/feedbackMobile',
            title: 'Feedback',
            icon: <MessageOutline />,
        },
        {
            key: '/discountRewardsMobile',
            title: 'Rewards',
            icon: <GiftOutline />,
        },
        {
            key: '/',
            title: 'Logout',
            icon: <LogoutOutlined />,
        },
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,             
            right: 0,            
            width: '100%',       
            zIndex: 1000,
            backgroundColor: '#ffffff',
            boxShadow: '0 -2px 6px rgba(0, 0, 0, 0.05)'
        }}>


            <TabBar
                activeKey={location.pathname}
                onChange={(key) => {
                    if (key === '/') {
                        localStorage.removeItem('cart'); 
                        localStorage.removeItem('customerId'); 
                    }
                    navigate(key);
                }}
                
            >
                {tabs.map(item => (
                    <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
                ))}
            </TabBar>
        </div>
    );
};

export default NavbarMobile;
