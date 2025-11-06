const db = require('../config/database');

exports.register = async (req, res) => {
  const { customerName, email, phoneNumber, password } = req.body;

  try {
    if (!/^[0-9-]{7,12}$/.test(phoneNumber)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format. Use numbers and dashes only (max 12 characters).' });
    }
  
    const [nameExists] = await db.query(
      'SELECT * FROM customer WHERE customerName = ?',
      [customerName]
    );
    if (nameExists.length > 0) {
      return res.status(400).json({ success: false, message: 'Customer name is already registered.' });
    }

    const [emailExists] = await db.query(
      'SELECT * FROM customer WHERE email = ?',
      [email]
    );
    if (emailExists.length > 0) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const [phoneExists] = await db.query(
      'SELECT * FROM customer WHERE phoneNumber = ?',
      [phoneNumber]
    );
    if (phoneExists.length > 0) {
      return res.status(400).json({ success: false, message: 'Phone number is already in use.' });
    }

    // Insert new customer
    const [insertResult] = await db.query(
      'INSERT INTO customer (customerName, email, phoneNumber, password, points) VALUES (?, ?, ?, ?, 0)',
      [customerName, email, phoneNumber, password]
    );

    res.status(201).json({ success: true, customerId: insertResult.insertId });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ success: false, message: 'Registration failed. Try again.' });
  }
};
