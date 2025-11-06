const db = require('../config/database');

// ✅ Fetch all orders for Admin Dashboard (with customerName)
exports.getAllOrders = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT o.order_id, 
                o.customerId,
                c.customerName,   
                o.total_price, 
                o.discount_applied, 
                o.created_date_time, 
                o.membership_points,
                o.preorder_datetime,
                o.status,
                GROUP_CONCAT(s.item_id, ' x ', s.quantity) AS items
            FROM orders o
            LEFT JOIN sales s ON o.order_id = s.order_id 
            LEFT JOIN customer c ON o.customerId = c.customerId
            GROUP BY o.order_id
            ORDER BY o.created_date_time DESC;
        `);

        // ✅ Ensure proper formatting in response
        const formattedOrders = results.map(order => ({
            ...order,
            total_price: order.total_price ? parseFloat(order.total_price).toFixed(2) : "0.00",
            discount_applied: order.discount_applied ? parseFloat(order.discount_applied).toFixed(2) : "0.00",
            membership_points: order.membership_points ? Number(order.membership_points) : 0,
            preorder_datetime: order.preorder_datetime || null,
            status: order.status || "Preparing"
        }));

        res.json(formattedOrders);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to retrieve orders", details: err.message });
    }
};

exports.deleteOrders = async (req, res) => {
    try{
        const {orderIds} = req.body;

        if (!orderIds || orderIds.length === 0){
            return res.status(400).json({success:false, message:"No orders selected for deletion"});
        }
        await db.query("DELETE FROM orders where order_id IN (?)", [orderIds]);

        res.json({success:true,message:"Orders deleted successfully!"});
    }catch (error){
        console.error("Error deleting orders:",error);
        res.status(500).json({success:false, message:"Error deleting selected orders"});
    }
};

exports.updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  if (!orderId || !['Preparing', 'Completed', 'Cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }

  try {
    await db.query(
      "UPDATE orders SET status = ? WHERE order_id = ?",
      [status, orderId]
    );
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (err) {
    console.error('Failed to update order status:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




  
  