const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const customerRouter = require('./APIroutes/customerRoutes');
const adminRouter = require('./APIroutes/adminRoutes');
const feedbackRouter = require('./APIroutes/feedbackRoutes');
const invoiceRouter = require('./APIroutes//invoiceRoutes');
const menuRouter = require('./APIroutes//menuRoutes');
const orderPointsRouter = require('./APIroutes/orderPointsRoutes');
const discountRouter = require('./APIroutes/discountRoutes');
const orderRouter = require('./APIroutes/orderRoutes');
const revenueRouter = require('./APIroutes/adminRevenueRoutes');
const uploadRouter = require('./APIroutes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

console.log("Server script started...");

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',') : [];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true
}));

app.use(express.json());
app.options('*',cors());

app.use('/api/admin', adminRouter);
app.use('/api/customer', customerRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/items',menuRouter);
app.use('/api/invoice',invoiceRouter);
app.use('/api/orderPoints',orderPointsRouter);
app.use('/api/discounts',discountRouter);
app.use('/api/orders', orderRouter);
app.use('/api/revenue',revenueRouter);
app.use('/api/upload',uploadRouter);

app.use('/uploads', express.static(path.join(__dirname,'uploads')));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
