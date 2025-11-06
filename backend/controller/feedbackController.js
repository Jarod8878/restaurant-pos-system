const db = require('../config/database');

exports.submitFeedback = async (req, res) => {
    const { phoneNumber, feedback, rating } = req.body;
    console.log("Incoming feedback request:", req.body); 

    if (!phoneNumber) {
        console.log("No phoneNumber received in request body!");
        return res.status(401).json({ error: "User not logged in" });
    }

    if (!feedback) {
        return res.status(400).json({ error: "Feedback is required" });
    }

    try {
        const [customer] = await db.query('SELECT customerId FROM customer WHERE phoneNumber = ?', [phoneNumber]);

        let customerId = null;
        if (customer.length > 0) {
            customerId = customer[0].customerId;
        }

        await db.query(
            'INSERT INTO feedbacks (phoneNumber, feedback, rating, customerId) VALUES (?, ?, ?, ?)',
            [phoneNumber, feedback, rating !== undefined ? parseFloat(rating) : null, customerId]
        );

        console.log("Feedback submitted successfully for:", phoneNumber);
        res.status(201).json({ message: "Feedback submitted successfully" });

    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: "Failed to submit feedback" });
    }
};



exports.getAllFeedbacks = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT f.feedback_id, f.phoneNumber, f.feedback, f.rating, f.created_at, f.customerId, c.customerName FROM feedbacks f LEFT JOIN customer c ON f.customerId = c.customerId ORDER BY f.created_at DESC`);
        res.json(results);
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Failed to retrieve feedback' });
    }
};

