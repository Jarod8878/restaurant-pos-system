const db = require('../config/database');

exports.getInvoice = async (req, res) => {
    const { orderId } = req.params; 

    if (!orderId) {
        return res.status(400).json({ error: "Missing orderId parameter" });
    }

    try {
        const salesQuery = `SELECT s.sale_id, m.name, s.quantity, m.price, s.total_price, s.remarks, m.image_url FROM sales s JOIN menuitems m ON s.item_id = m.item_id WHERE s.order_id = ?;`;

        const [salesResults] = await db.query(salesQuery, [orderId]);

        if (salesResults.length === 0) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        const orderQuery = `SELECT total_price AS finalTotal, discount_applied, membership_points, created_date_time, order_type, preorder_datetime FROM orders WHERE order_id = ?;`;

        const [orderDetails] = await db.query(orderQuery, [orderId]);

        if (orderDetails.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json({
            orderId,
            items: salesResults,
            discount_applied: orderDetails[0].discount_applied || 0,
            finalTotal: orderDetails[0].finalTotal,
            created_date_time: orderDetails[0].created_date_time,
            membership_points: orderDetails[0].membership_points,
            order_type: orderDetails[0].order_type,
            preorder_datetime: orderDetails[0].preorder_datetime
        });

    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Failed to retrieve invoice' });
    }
};
