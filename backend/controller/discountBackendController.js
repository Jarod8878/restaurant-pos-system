const db = require('../config/database');

// Fetch all available discounts
exports.getDiscount = async (req, res) => {
    try {
        const [discounts] = await db.query("SELECT * FROM discounts");
        res.json(discounts);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to retrieve discounts" });
    }
};

exports.redeemDiscount = async (req, res) => {
    console.log("redeemDiscount controller activated", req.body);
    const { customerId, discountId } = req.body;

    try {
        // Check customer's points
        const [[customer]] = await db.query("SELECT points FROM customer WHERE customerId = ?", [customerId]);

        if (!customer) return res.status(404).json({ error: "Customer not found" });

        const [[discount]] = await db.query("SELECT * FROM discounts WHERE discount_id = ?", [discountId]);

        if (!discount) return res.status(404).json({ error: "Discount not found" });

        if (customer.points < discount.points_required) {
            return res.status(400).json({ error: "Not enough points" });
        }

        const [[existingRedemption]] = await db.query(
            "SELECT * FROM customer_discounts WHERE customerId = ? AND discount_id = ?", 
            [customerId, discountId]
        );

        if (existingRedemption) {
            await db.query(
                "UPDATE customer_discounts SET remaining_uses = remaining_uses + 1 WHERE customerId = ? AND discount_id = ?",
                [customerId, discountId]
            );
        } else {
            await db.query(
                "INSERT INTO customer_discounts (customerId, discount_id, remaining_uses) VALUES (?, ?, 1)",
                [customerId, discountId]
            );
        }

        await db.query("UPDATE customer SET points = points - ? WHERE customerId = ?", 
            [discount.points_required, customerId]);

        res.json({ message: "Discount redeemed successfully!", code: discount.code, discountAmount: discount.discount_amount });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to redeem discount" });
    }
};

exports.applyDiscount = async (req, res) => {
    const { customerId, discountCode, orderId } = req.body;

    try {
        const [[discount]] = await db.query("SELECT * FROM discounts WHERE code = ?", [discountCode]);
        if (!discount) return res.status(404).json({ error: "Invalid discount code" });

        const [[customerDiscount]] = await db.query(
            "SELECT remaining_uses FROM customer_discounts WHERE customerId = ? AND discount_id = ?",
            [customerId, discount.discount_id]
        );

        if (!customerDiscount || customerDiscount.remaining_uses <= 0) {
            return res.status(400).json({ error: "No remaining uses for this discount" });
        }

        const [[orderCheck]] = await db.query(
            "SELECT discount_id FROM orders WHERE order_id = ? AND discount_id IS NOT NULL",
            [orderId]
        );

        if (orderCheck) {
            return res.status(400).json({ error: "Discount already applied to this order" });
        }

        await db.query(
            "UPDATE orders SET discount_applied = ?, discount_id = ? WHERE order_id = ?", 
            [discount.discount_amount, discount.discount_id, orderId]
        );

        await db.query(
            "UPDATE customer_discounts SET remaining_uses = remaining_uses - 1 WHERE customerId = ? AND discount_id = ?",
            [customerId, discount.discount_id]
        );

        res.json({ message: "Discount applied successfully!", discountAmount: discount.discount_amount });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to apply discount" });
    }
};

exports.getAllDiscounts = async (req, res) => {
    try {
        const [discounts] = await db.query("SELECT * FROM discounts ORDER BY discount_id");
        res.json(discounts);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to retrieve discounts" });
    }
};

exports.createDiscount = async (req, res) => {
    const { code, description, discount_amount, points_required } = req.body;

    try {
        await db.query(
            "INSERT INTO discounts (code, description, discount_amount, points_required) VALUES (?, ?, ?, ?)",
            [code, description, discount_amount, points_required]
        );
        res.status(201).json({ message: "Discount created successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to create discount" });
    }
};

exports.updateDiscount = async (req, res) => {
    const { id } = req.params;
    const { code, description, discount_amount, points_required } = req.body;
    try {
        await db.query(
            "UPDATE discounts SET code = ?, description = ?, discount_amount = ?, points_required = ? WHERE discount_id = ?",
            [code, description, discount_amount, points_required, id]
        );
        res.json({ message: "Discount updated successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to update discount" });
    }
};

exports.deleteDiscount = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM discounts WHERE discount_id = ?", [id]);
        res.json({ message: "Discount deleted successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to delete discount" });
    }
};
