import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import {
    AppstoreOutlined,
    UserOutlined,
    MessageOutlined,
    GiftOutlined,
    LogoutOutlined
} from '@ant-design/icons';

const { Content, Sider, Footer } = Layout;

const siderStyle = {
    overflow: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
};

const AppLayout = () => {
    const navigate = useNavigate();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible style={{ ...siderStyle, background: '#001529' }}>
                <div style={{ flex: 1 }}>
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={['1']}
                        onClick={({ key }) => navigate(key)}
                    >
                        <Menu.Item key="/menuItem" icon={<AppstoreOutlined />}>
                            Menu Items
                        </Menu.Item>
                        <Menu.Item key="/discountRewards" icon={<GiftOutlined />}>
                            Discount & Rewards
                        </Menu.Item>
                        <Menu.Item key="/profile" icon={<UserOutlined />}>
                            Profile
                        </Menu.Item>
                        <Menu.Item key="/feedback" icon={<MessageOutlined />}>
                            Feedback
                        </Menu.Item>
                        <Menu.Item key="/" icon={<LogoutOutlined/>}>
                            Logout
                        </Menu.Item>
                        <Menu.Item key="/menuItemsMobile" icon={<AppstoreOutlined/>}>
                            Menu Items Mobile
                        </Menu.Item>
                    </Menu>
                </div>
            </Sider>

            <Layout>
                <Content style={{ margin: '16px', padding: '16px', background: '#fff' }}>
                    <Outlet /> 
                </Content>

                <Footer style={{ textAlign: 'center' }}>
                    POS System ©{new Date().getFullYear()} Cafe HengOngHuat
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
