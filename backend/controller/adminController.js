const db = require('../config/database');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [results] = await db.query(
            'SELECT * FROM admin WHERE username = ? AND password = ?',
            [username, password]
        );

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        res.json({
            success: true,
            user: { user_id: results[0].user_id, username: results[0].username },
        });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAllAdmins = async (req, res) => {
    try {
        const [admins] = await db.query('SELECT * FROM admin');
        res.json({ success: true, admins });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to fetch admin users' });
    }
};

exports.registerAdmin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    try {
        const [existing] = await db.query('SELECT * FROM admin WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Username already exists' });
        }

        await db.query('INSERT INTO admin (username, password) VALUES (?, ?)', [username, password]);
        res.json({ success: true, message: 'Admin registered successfully' });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to register admin' });
    }
};

exports.updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    try {
        await db.query('UPDATE admin SET username = ?, password = ? WHERE user_id = ?', [username, password, id]);
        res.json({ success: true, message: 'Admin updated successfully' });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to update admin' });
    }
};

exports.deleteAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM admin WHERE user_id = ?', [id]);
        res.json({ success: true, message: 'Admin deleted successfully' });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to delete admin' });
    }
};

exports.getPointsConversionRate = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT setting_value FROM settings WHERE setting_key = 'points_conversion_rate'"
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Conversion rate not set' });
        }

        res.json({ success: true, value: rows[0].setting_value });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updatePointsConversionRate = async (req, res) => {
    const { newRate } = req.body;

    if (!newRate || isNaN(newRate) || newRate <= 0) {
        return res.status(400).json({ error: 'Invalid conversion rate' });
    }

    try {
        await db.query(
            "UPDATE settings SET setting_value = ? WHERE setting_key = 'points_conversion_rate'",
            [newRate]
        );
        res.json({ message: 'Conversion rate updated successfully' });
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Failed to update conversion rate' });
    }
};

exports.getLowStockItems = async (req, res) => {
    try {
        const [thresholdRows] = await db.query(
            'SELECT setting_value FROM settings WHERE setting_key = ?',
            ['low_stock_threshold']
        );

        const threshold = parseInt(thresholdRows[0]?.setting_value || '3');

        const [results] = await db.query(
            'SELECT item_id, name, available_amount FROM menuitems WHERE available_amount <= ?',
            [threshold]
        );

        res.json({ success: true, threshold, lowStockItems: results });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateLowStockAmount = async (req, res) => {
    const { threshold } = req.body;
    if (!threshold || isNaN(threshold)) {
        return res.status(400).json({ success: false, message: "Invalid threshold value." });
    }

    try {
        await db.query(
            'UPDATE settings SET setting_value = ? WHERE setting_key = "low_stock_threshold"',
            [threshold.toString()]
        );
        res.json({ success: true, message: "Threshold updated successfully." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getLowStockAmount = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT setting_value FROM settings WHERE setting_key = 'low_stock_threshold'"
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Threshold not set' });
        }

        res.json({ success: true, value: rows[0].setting_value });
    } catch (err) {
        console.error('Error fetching threshold:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getDailySales = async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT COALESCE(SUM(total_price), 0) AS totalSales
            FROM orders
            WHERE DATE(created_date_time) = CURDATE()
        `);
        res.json({ success: true, totalSales: Number(result[0].totalSales) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

//dashboard and sales report
//Top Selling Item of the Day
exports.getTopSellingItems = async (req, res) => {
    try {
        const [results] = await db.query(`
        SELECT  m.name AS item_name, SUM(s.quantity) AS total_sold FROM sales s JOIN menuitems m ON s.item_id = m.item_id GROUP BY s.item_id ORDER BY total_sold DESC LIMIT 7;`);

        res.json(results || []);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to retrieve top selling items" });
    }
};

exports.getHourlyOrders = async (req, res) => {
    try {
        const [results] = await db.query(`
        SELECT HOUR(created_date_time) AS order_hour, COUNT(*) AS total_orders
        FROM orders WHERE DATE(created_date_time) = CURDATE() GROUP BY order_hour ORDER BY order_hour;`);

        res.json(results || []);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to retrieve hourly orders" });
    }
};

exports.getSalesTrend = async (req, res) => {
    const { type } = req.query;

    try {
        let query = "";

        if (type === 'daily') {
            query = `
                SELECT  DATE(created_date_time) AS time, COALESCE(SUM(total_price), 0) AS total_sales, COUNT(order_id) AS sales_count FROM orders WHERE created_date_time >= CURDATE() - INTERVAL 14 DAY GROUP BY DATE(created_date_time) ORDER BY time ASC;`;
        } else if (type === 'weekly') {
            query = `
                SELECT YEARWEEK(created_date_time, 1) AS time, COALESCE(SUM(total_price), 0) AS total_sales, COUNT(order_id) AS sales_count FROM orders WHERE created_date_time >= CURDATE() - INTERVAL 2 MONTH GROUP BY YEARWEEK(created_date_time, 1)
                ORDER BY time ASC;`;
        } else {
            query = `
                SELECT DATE_FORMAT(created_date_time, '%Y-%m') AS time,  COALESCE(SUM(total_price), 0) AS total_sales, COUNT(order_id) AS sales_count FROM orders WHERE created_date_time >= CURDATE() - INTERVAL 6 MONTH GROUP BY DATE_FORMAT(created_date_time, '%Y-%m') ORDER BY time ASC;`;
        }

        const [results] = await db.query(query);
        res.json(results || []);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to retrieve sales trend" });
    }
};

// Sales History for Forecasting
exports.getItemSalesHistory = async (req, res) => {
    const { item_id } = req.params;
    if (!item_id) {
        return res.status(400).json({ error: "Item ID is required." });
    }

    try {
        const [results] = await db.query(` SELECT DATE(created_date_time) AS date, SUM(quantity) AS total_sold FROM sales WHERE item_id = ? AND created_date_time >= CURDATE() - INTERVAL 14 DAY GROUP BY DATE(created_date_time) ORDER BY date ASC`, [item_id]);
        res.json(results || []);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to retrieve item sales history" });
    }
};

exports.getCategorySales = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT 
              COALESCE(SUM(CASE WHEN m.categoryId = 1 THEN s.quantity ELSE 0 END), 0) AS FoodQuantity,
              COALESCE(SUM(CASE WHEN m.categoryId = 2 THEN s.quantity ELSE 0 END), 0) AS BeverageQuantity,
              COALESCE(SUM(CASE WHEN m.categoryId = 3 THEN s.quantity ELSE 0 END), 0) AS DessertQuantity,
              COALESCE(SUM(CASE WHEN m.categoryId = 1 THEN s.total_price ELSE 0 END), 0) AS FoodRevenue,
              COALESCE(SUM(CASE WHEN m.categoryId = 2 THEN s.total_price ELSE 0 END), 0) AS BeverageRevenue,
              COALESCE(SUM(CASE WHEN m.categoryId = 3 THEN s.total_price ELSE 0 END), 0) AS DessertRevenue
            FROM sales s
            LEFT JOIN menuitems m ON s.item_id = m.item_id;
        `);

        const formattedResult = {
            FoodQuantity: Number(results[0].FoodQuantity) || 0,
            BeverageQuantity: Number(results[0].BeverageQuantity) || 0,
            DessertQuantity: Number(results[0].DessertQuantity) || 0,
            FoodRevenue: Number(results[0].FoodRevenue) || 0,
            BeverageRevenue: Number(results[0].BeverageRevenue) || 0,
            DessertRevenue: Number(results[0].DessertRevenue) || 0,
        };

        res.json(formattedResult);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to retrieve category sales", details: err.message });
    }
};


exports.getSalesSummary = async (req, res) => {
    try {
        const [todaySales] = await db.query(`
        SELECT COALESCE(SUM(total_price), 0) AS today_total 
        FROM orders 
        WHERE DATE(created_date_time) = CURDATE();
      `);

        const [yesterdaySales] = await db.query(`
        SELECT COALESCE(SUM(total_price), 0) AS yesterday_total 
        FROM orders 
        WHERE DATE(created_date_time) = CURDATE() - INTERVAL 1 DAY;
      `);

        const [weekSales] = await db.query(`
        SELECT COALESCE(SUM(total_price), 0) AS week_total 
        FROM orders 
        WHERE YEARWEEK(created_date_time, 1) = YEARWEEK(CURDATE(), 1);
      `);

        const [lastWeekSales] = await db.query(`
        SELECT COALESCE(SUM(total_price), 0) AS last_week_total 
        FROM orders 
        WHERE YEARWEEK(created_date_time, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1);
      `);

        const [monthSales] = await db.query(`
        SELECT COALESCE(SUM(total_price), 0) AS month_total 
        FROM orders 
        WHERE YEAR(created_date_time) = YEAR(CURDATE()) 
          AND MONTH(created_date_time) = MONTH(CURDATE());
      `);

        const [lastMonthSales] = await db.query(`
        SELECT COALESCE(SUM(total_price), 0) AS last_month_total 
        FROM orders 
        WHERE YEAR(created_date_time) = YEAR(CURDATE() - INTERVAL 1 MONTH) 
          AND MONTH(created_date_time) = MONTH(CURDATE() - INTERVAL 1 MONTH);
      `);

        const [avgSpendToday] = await db.query(`
        SELECT COALESCE(AVG(customer_spend), 0) AS avg_spend
        FROM (
          SELECT customerId, SUM(total_price) AS customer_spend
          FROM orders
          WHERE DATE(created_date_time) = CURDATE()
          GROUP BY customerId
        ) AS daily_spending;
      `);

        const [avgSpendYesterday] = await db.query(`
        SELECT COALESCE(AVG(customer_spend), 0) AS avg_spend
        FROM (
          SELECT customerId, SUM(total_price) AS customer_spend
          FROM orders
          WHERE DATE(created_date_time) = CURDATE() - INTERVAL 1 DAY
          GROUP BY customerId
        ) AS daily_spending;
      `);

        const safeToday = Number(todaySales[0]?.today_total ?? 0);
        const safeYesterday = Number(yesterdaySales[0]?.yesterday_total ?? 0);
        const safeWeek = Number(weekSales[0]?.week_total ?? 0);
        const safeLastWeek = Number(lastWeekSales[0]?.last_week_total ?? 0);
        const safeMonth = Number(monthSales[0]?.month_total ?? 0);
        const safeLastMonth = Number(lastMonthSales[0]?.last_month_total ?? 0);
        const safeAvgSpendToday = Number(avgSpendToday[0]?.avg_spend ?? 0);
        const safeAvgSpendYesterday = Number(avgSpendYesterday[0]?.avg_spend ?? 0);

        res.json({
            today: safeToday,
            yesterday: safeYesterday,
            week: safeWeek,
            lastWeek: safeLastWeek,
            month: safeMonth,
            lastMonth: safeLastMonth,
            avgSpendToday: safeAvgSpendToday,
            avgSpendYesterday: safeAvgSpendYesterday,
        });

    } catch (err) {
        console.error("Error fetching sales summary:", err);
        res.status(500).json({ error: "Failed to fetch sales summary" });
    }
};




