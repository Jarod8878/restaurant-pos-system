const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../config/database');

exports.login = async (req, res) => {
    const { customerName, password } = req.body;

    console.log('Customer login payload:', req.body); 

    try {
        console.log('Executing query: SELECT * FROM customer WHERE customerName = ? AND password = ?', [customerName, password]);

        const [results] = await db.query(
            'SELECT * FROM customer WHERE customerName = ? AND password = ?',
            [customerName, password]
        );

        console.log('Query results:', results);

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Record not found, sign up first' });
        }

        res.json({ success: true, message: 'Login Successful', customerId: results[0].customerId, phoneNumber: results[0].phoneNumber });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        const [existing] = await db.query('SELECT * FROM customer WHERE email = ?', [email]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Email not found' });
        }

        // Generate temporary password (8 characters, alphanumeric)
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const tempPassword = Array.from({ length: 8 }, () =>
            charset[Math.floor(Math.random() * charset.length)]
        ).join('');

        // Update the customer password
        await db.query('UPDATE customer SET password = ? WHERE email = ?', [tempPassword, email]);

        // Send the temporary password to user email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'hengOngHuat9919@gmail.com',       
                pass: 'idhj uztv flxz fzey'               
            }
        });

        const mailOptions = {
            from: 'hengOngHuat9919@gmail.com',
            to: email,
            subject: 'Temporary Password Reset',
            html: `
                <p>Hello,</p>
                <p>Your temporary password is: <strong>${tempPassword}</strong></p>
                <p>Please log in using this password and change it later in your profile.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Temporary password sent to email' });

    } catch (err) {
        console.error('Error in forgotPassword:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getProfile = async (req, res) => {
    const { customerId } = req.query;

    if (!customerId) {
        return res.status(400).json({ success: false, message: 'customerId is required' });
    }

    try {
        const [results] = await db.query(
            'SELECT customerName, email, phoneNumber, points FROM customer WHERE customerId = ?',
            [customerId]
        );

        if (results.length === 0) {
            console.log(`Customer with customerId: ${customerId} not found`);
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        console.log("Profile query result:", results[0]);
        res.json({ success: true, customer: results[0] });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


exports.updateProfile = async (req, res) => {
    const { customerId, email, customerName, phoneNumber, newPassword } = req.body;

    if (!customerId || !email || !customerName || !phoneNumber) {
        return res.status(400).json({ success: false, message: 'customerId, email, customerName, and phoneNumber are required' });
    }

    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        const [emailExists] = await db.query(
            'SELECT customerId FROM customer WHERE email = ? AND customerId != ?',
            [email, customerId]
        );
        if (emailExists.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already in use by another account' });
        }

        //Check if phoneNumber is already used by another customer
        const [existing] = await db.query(
            'SELECT customerId FROM customer WHERE phoneNumber = ? AND customerId != ?',
            [phoneNumber, customerId]
        );

        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Phone number already in use by another account' });
        }

        //update
        let query = 'UPDATE customer SET customerName = ?, email = ?, phoneNumber = ?';
        let params = [customerName, email, phoneNumber];

        if (newPassword) {
            query += ', password = ?';
            params.push(newPassword);
        }
        query += ' WHERE customerId = ?';
        params.push(customerId);

        await db.query(query, params);

        res.json({ success: true, message: 'Updated successfully' });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

exports.getCustomerDiscounts = async (req, res) => {
    const { customerId } = req.query;

    try {
        const [discounts] = await db.query(
            `SELECT cd.discount_id, d.code AS discount_code, cd.remaining_uses 
             FROM customer_discounts cd
             JOIN discounts d ON cd.discount_id = d.discount_id
             WHERE cd.customerId = ?`,
            [customerId]
        );

        res.json(discounts);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to retrieve customer discounts" });
    }
};

exports.getTopCustomers = async (req, res) => {
    try {
        const [customers] = await db.query(`
        SELECT customerName, phoneNumber, points
        FROM customer
        ORDER BY points DESC
        LIMIT 3;
      `);

        res.json(customers);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to retrieve top customers" });
    }
};

exports.getCRM = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                c.customerId,
                c.customerName,
                c.phoneNumber,
                c.points,
                COUNT(DISTINCT o.order_id) AS totalOrders,
                IFNULL(SUM(o.total_price), 0) AS totalSpent,
                COUNT(DISTINCT cd.custDis_id) AS discountsAvailable
            FROM customer c
            LEFT JOIN orders o ON c.customerId = o.customerId
            LEFT JOIN customer_discounts cd ON c.customerId = cd.customerId
            GROUP BY c.customerId, c.customerName, c.phoneNumber, c.points
        `);

        res.json({ success: true, customers: rows });
    } catch (err) {
        console.error("CRM fetch error:", err.message);
        res.status(500).json({ success: false, message: "Failed to retrieve CRM data" });
    }
};

exports.updateCustomer = async (req, res) => {
    const { customerId, customerName, phoneNumber } = req.body;
    console.log("[Admin Update] Payload:", { customerId, customerName, phoneNumber });
    if (!customerId || !customerName || !phoneNumber) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    try {
        const [conflict] = await db.query(
            'SELECT customerId FROM customer WHERE phoneNumber = ? AND customerId != ?',
            [phoneNumber, customerId]
        );
        if (conflict.length > 0) {
            return res.status(409).json({ success: false, message: 'Phone number already in use' });
        }
        await db.query(
            'UPDATE customer SET customerName = ?, phoneNumber = ? WHERE customerId = ?',
            [customerName, phoneNumber, customerId]
        );
        res.json({ success: true, message: 'Customer updated successfully' });
    } catch (err) {
        console.error("Update error:", err.message);
        res.status(500).json({ success: false, message: "Update failed", error: err.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    const { customerId } = req.params;

    try {
        const [result] = await db.query('DELETE FROM customer WHERE customerId = ?', [customerId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (err) {
        console.error("Delete error:", err.message);
        res.status(500).json({ success: false, message: "Delete failed" });
    }
};

exports.activeCustomer = async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT DATE(created_date_time) AS order_date, COUNT(DISTINCT customerId) AS active_user FROM orders WHERE created_date_time >= CURDATE() - INTERVAL 1 DAY GROUP BY DATE(created_date_time) ORDER BY order_date DESC`);

        res.json({ success: true, data: result });
    } catch (err) {
        console.error('Error fetching active customers:', err.message);
        res.status(500).json({ success: false, message: 'Failed to retrieve active customer data' });
    }
};

