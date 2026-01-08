const db = require('../config/database');

exports.getRevenue = async (req, res) => {
    try {
        const [monthResult] = await db.query(`
            SELECT SUM(total_price) AS totalRevenueMonth 
            FROM orders 
            WHERE MONTH(created_date_time) = MONTH(CURRENT_DATE()) 
            AND YEAR(created_date_time) = YEAR(CURRENT_DATE());
        `);

        const [todayResult] = await db.query(`
            SELECT SUM(total_price) AS totalRevenueToday 
            FROM orders 
            WHERE DATE(created_date_time) = CURRENT_DATE();
        `);

        res.json({
            totalRevenueMonth: monthResult[0].totalRevenueMonth || 0,
            totalRevenueToday: todayResult[0].totalRevenueToday || 0,
        });
    } catch (err) {
        console.error('Database Error:', err);
        res.status(500).json({ error: 'Failed to retrieve revenue' });
    }
};
