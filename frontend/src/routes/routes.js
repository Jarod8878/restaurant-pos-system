import MainPage from '../component/MainPage.js';

//Admin
import AdminLogin from '../pages/Admin/AdminLogin';
import AdminLayout from '../component/AdminLayout';
import Dashboard from '../pages/Admin/Dashboard.js';
import AdminOrders from '../pages/Admin/AdminOrders.js';
import AdminSalesReport from '../pages/Admin/AdminSalesReport.js';
import AdminMenu from '../pages/Admin/AdminMenu.js';
import AdminCRM from '../pages/Admin/AdminCRM.js';
import AdminDiscount from '../pages/Admin/AdminDiscount.js';
import AdminFeedback from '../pages/Admin/AdminFeedback.js';
import SettingNotification from '../pages/Admin/SettingNotification.js';
import AdminUsers from '../pages/Admin/AdminUsers.js';

//Mobile
import CustomerLoginMobile from '../pages/Mobile/CustomerLoginMobile.js';
import CustomerRegisterMobile from '../pages/Mobile/CustomerRegisterMobile.js';
import ForgotPasswordMobile from '../pages/Mobile/ForgotPasswordMobile.js';
import MenuItemsMobile from '../pages/Mobile/MenuItemsMobile.js';
import CartMobile from '../pages/Mobile/CartMobile.js';
import InvoiceMobile from '../pages/Mobile/InvoiceMobile.js';
import OrderHistoryMobile from '../pages/Mobile/OrderHistoryMobile.js';
import HistoryDetailsMobile from '../pages/Mobile/HistoryDetailsMobile.js';
import ProfileMobile from '../pages/Mobile/ProfileMobile.js';
import FeedbackMobile from '../pages/Mobile/FeedbackMobile.js';
import DiscountRewardsMobile from '../pages/Mobile/DiscountRewardsMobile.js';

const routes = [
    //Public Routes (No Layout)
    { path: "/", element: <MainPage /> },
    { path: "/admin-login", element: <AdminLogin /> },

    //Mobile Routes
    { path: "/customer-login-mobile", element: <CustomerLoginMobile /> },
    { path: "/registerMobile", element: <CustomerRegisterMobile/>},
    { path: "/forgot-password-mobile", element: <ForgotPasswordMobile/>},
    { path: "menuItemsMobile", element: <MenuItemsMobile/>},
    { path: "cartMobile", element: <CartMobile/>}, 
    { path: 'invoiceMobile/:orderId', element: <InvoiceMobile /> },
    { path: 'orderHistoryMobile', element: <OrderHistoryMobile /> },
    { path: 'historyDetailsMobile/:orderId', element: <HistoryDetailsMobile /> },
    { path: 'profileMobile', element: <ProfileMobile/>},
    { path: 'feedbackMobile', element: <FeedbackMobile/>},
    { path: 'discountRewardsMobile', element: <DiscountRewardsMobile/>},

    //Admin Layout
    {
        path: "/admin",
        element: <AdminLayout />, 
        children: [
            { path: "dashboard", element: <Dashboard /> },
            { path: "orders", element: <AdminOrders />},
            { path: "salesReport", element: <AdminSalesReport />},
            { path: "menu", element: <AdminMenu/>},
            { path: "crm", element: <AdminCRM/>},
            { path: "feedback", element: <AdminFeedback/>},
            { path: "discount", element: <AdminDiscount/>},
            { path: "settingNotification", element: <SettingNotification/>},
            { path: "adminUsers", element: <AdminUsers/>},
        ],
    },
];

export default routes;
