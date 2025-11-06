const db = require('../config/database');

exports.placeOrder = async (req, res) => {
    const { customerId, sales, discountCode, discountAmount, order_type = 'dine_in', preorder_datetime = null } = req.body;

    if (!customerId || isNaN(customerId)) {
        return res.status(400).json({ error: "Invalid customerId" });
    }
    if (!sales || !Array.isArray(sales) || sales.length === 0) {
        return res.status(400).json({ error: "Invalid sales data format" });
    }
    if (order_type === 'preorder' && !preorder_datetime) {
        return res.status(400).json({ error: "Pre-order time is required for pre-order orders" });
    }

    const formatToMySQLDatetime = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };


    try {
        const connection = await db.getConnection();
        let discountId = null;
        if (discountCode && discountCode.trim()) {
            const [discountResult] = await connection.query(
                "SELECT discount_id FROM discounts WHERE code = ?",
                [discountCode]
            );
            if (discountResult.length > 0) {
                discountId = discountResult[0].discount_id;
            }
        }

        const formattedPreorderDatetime = formatToMySQLDatetime(preorder_datetime);

        const subTotal = sales.reduce((sum, item) => sum + item.total_price, 0);
        const actualDiscount = Math.min(discountAmount || 0, subTotal);
        const finalTotal = Math.max(subTotal - actualDiscount, 0);
        const [rateResult] = await connection.query(
            "SELECT setting_value FROM settings WHERE setting_key = 'points_conversion_rate'"
        );
        const rate = parseFloat(rateResult[0]?.setting_value) || 10;
        const membershipPoints = Math.floor(subTotal / rate);

        const [orderResult] = await connection.query(
            `INSERT INTO orders (customerId, total_price, membership_points, created_date_time, discount_id, discount_applied, order_type, preorder_datetime) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)`,
            [customerId, finalTotal, membershipPoints, discountId, actualDiscount, order_type, formattedPreorderDatetime]
        );
        const orderId = orderResult.insertId;

        for (const sale of sales) {
            await connection.query(
                "INSERT INTO sales (order_id, item_id, quantity, total_price, remarks) VALUES (?, ?, ?, ?, ?)",
                [orderId, sale.item_id, sale.quantity, sale.total_price, sale.remarks || null]
            );
            
            await connection.query(
                "UPDATE menuitems SET available_amount = available_amount - ? WHERE item_id = ? AND available_amount >= ?",
                [sale.quantity, sale.item_id, sale.quantity]
            );
        }
        await connection.query(
            "UPDATE customer SET points = points + ? WHERE customerId = ?",
            [membershipPoints, customerId]
        );
        connection.release();

        res.status(201).json({ message: "Order placed successfully!", orderId });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Failed to process the order" });
    }
};

exports.getOrdersByCustomerId = async (req, res) => {
    const { customerId } = req.query;

    if (!customerId || isNaN(customerId)) {
        return res.status(400).json({ success: false, message: 'Invalid customerId' });
    }

    try {
        const [orders] = await db.query(
            `SELECT order_id, created_date_time, total_price, status 
         FROM orders 
         WHERE customerId = ? 
         ORDER BY created_date_time DESC`,
            [customerId]
        );

        res.json({ success: true, orders });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to retrieve orders' });
    }
};
  





