import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    DashboardOutlined,
    OrderedListOutlined,
    ProfileOutlined,
    LogoutOutlined,
    BellOutlined,
    TeamOutlined,
    UserOutlined,
    GiftOutlined,
    CommentOutlined,
    UserAddOutlined,
    AreaChartOutlined,
} from '@ant-design/icons';
import '../CSS/AdminCSS/AdminLayout.css';

const { Sider, Content, Footer } = Layout;

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{ minHeight: '100vh', display: 'flex' }}>
            <Sider
                collapsible
                collapsed={collapsed} 
                onCollapse={setCollapsed}
                style={{
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
                    fontSize: "20px",
                }}
            >
                <div style={{ flex: 1 }}>
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={[location.pathname]}
                        selectedKeys={[location.pathname]} 
                        onClick={({ key }) => navigate(key)}
                        inlineCollapsed={collapsed} 
                    >
                        <Menu.Item key="/admin/dashboard" icon={<DashboardOutlined />}>
                            Dashboard
                        </Menu.Item>
                        <Menu.Item key="/admin/orders" icon={<OrderedListOutlined />}>
                            Orders
                        </Menu.Item>
                        <Menu.Item key="/admin/salesReport" icon={<AreaChartOutlined />}>
                            Sales Report
                        </Menu.Item>
                        <Menu.Item key="/admin/menu" icon={<ProfileOutlined />}>
                            Modify Menu
                        </Menu.Item>

                        <Menu.SubMenu
                            key="crm"
                            icon={<TeamOutlined />}
                            title="CRM"
                        >
                            <Menu.Item key="/admin/crm" icon={<UserOutlined />}>
                                Customer Profile
                            </Menu.Item>
                            <Menu.Item key="/admin/discount" icon={<GiftOutlined />}>
                                Discount Management
                            </Menu.Item>
                            <Menu.Item key="/admin/feedback" icon={<CommentOutlined />}>
                                Feedback Management
                            </Menu.Item>
                        </Menu.SubMenu>

                        <Menu.Item key="/admin/settingNotification" icon={<BellOutlined />}>
                            Settings & Notifications
                        </Menu.Item>
                        <Menu.Item key="/admin/adminUsers" icon={<UserAddOutlined />}>
                            Admin Users
                        </Menu.Item>
                        <Menu.Item key="/" icon={<LogoutOutlined />}>
                            Logout
                        </Menu.Item>
                    </Menu>
                </div>
            </Sider>

            <Layout>
                <Content className='admin-content'>
                    <Outlet />
                </Content>

                <Footer style={{ textAlign: 'center', fontSize: "18px", padding: "20px" }}>
                    Admin Dashboard ©{new Date().getFullYear()} Created by Jarod Lim
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
