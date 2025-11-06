const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


(async () => {
    try {
        const connection = await db.getConnection();
        console.log(`Connected to MySQL database with thread ID: ${connection.threadId}`);
        connection.release();
    } catch (err) {
        console.error('Error connecting to the database:', err.message);
    }
})();

module.exports = db;
