const db = require("../config/database");

//Fetch all menu items
exports.getMenuItems = async (req, res) => {
    try {
        const query = `
            SELECT 
                m.*, 
                c.categoryName,
                COALESCE(SUM(s.quantity), 0) AS total_sales,
                COALESCE(SUM(CASE WHEN DATE(o.created_date_time) = CURDATE() THEN s.quantity ELSE 0 END), 0) AS sales_today
            FROM menuitems m
            JOIN category c ON m.categoryId = c.categoryId
            LEFT JOIN sales s ON m.item_id = s.item_id
            LEFT JOIN orders o ON o.order_id = s.order_id
            GROUP BY m.item_id
            ORDER BY m.item_id ASC;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json({ error: "Failed to retrieve menu items" });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM category");
        res.json(results);
    } catch (err) {
        console.error("Error fetching categories:", err.message);
        res.status(500).json({ error: "Failed to retrieve categories" });
    }
}

exports.addMenuItem = async (req, res) => {
    const { name, description, price, available_amount, categoryId, image_url } = req.body;

    if (!name || !price || available_amount == null || !categoryId || !image_url) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        await db.query(
            `INSERT INTO menuitems 
            (name, description, price, available_amount, categoryId, is_available, image_url)
            VALUES (?, ?, ?, ?, ?, TRUE, ?)`,
            [name, description, price, available_amount, categoryId, image_url]
        );
        res.status(201).json({ message: "Item added with image" });
    } catch (err) {
        console.error("Error adding item:", err.message);
        res.status(500).json({ error: "Failed to add item" });
    }
};

exports.flagMenuItem = async (req, res) => {
    const { itemId } = req.params;

    try {
        const [rows] = await db.query("SELECT is_available FROM menuitems WHERE item_id = ?", [itemId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Menu item not found" });
        }

        const currentStatus = rows[0].is_available; // 0 or 1
        const newStatus = currentStatus === 1 ? 0 : 1; // Force MySQL-friendly boolean

        await db.query("UPDATE menuitems SET is_available = ? WHERE item_id = ?", [newStatus, itemId]);

        res.json({
            message: `Item is now ${newStatus ? "available" : "unavailable"}`,
            newStatus
        });
    } catch (err) {
        console.error("Error toggling availability:", err.message);
        res.status(500).json({ error: "Failed to update availability" });
    }

};

exports.updateStock = async (req, res) => {
    const { itemId } = req.params;
    const { available_amount } = req.body;
  
    try {
      await db.query(
        "UPDATE menuitems SET available_amount = ? WHERE item_id = ?",
        [available_amount, itemId]
      );
      res.json({ success: true });
    } catch (err) {
      console.error("Stock update failed:", err.message);
      res.status(500).json({ error: "Failed to update stock" });
    }
  };

exports.deleteMenuItem = async (req, res) => {
    const { itemId } = req.params;
    try {
        await db.query("DELETE FROM menuitems WHERE item_id = ?", [itemId]);
        res.json({ message: "Item deleted" });
    } catch (err) {
        console.error("Error deleting item:", err.message);
        res.status(500).json({ error: "Failed to delete item" });
    }
};

exports.updateMenuItem = async (req, res) => {
    const { itemId } = req.params;
    const { name, description, price, available_amount, categoryId, image_url } = req.body;
  
    try {
      await db.query(
        `UPDATE menuitems 
         SET name = ?, description = ?, price = ?, available_amount = ?, categoryId = ?, image_url = ? 
         WHERE item_id = ?`,
        [name, description, price, available_amount, categoryId, image_url, itemId]
      );
  
      res.json({ success: true, message: "Menu item updated" });
    } catch (err) {
      console.error("Update failed:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  