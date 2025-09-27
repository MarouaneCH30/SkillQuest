require("dotenv").config();
const mysql = require("mysql2");

console.log("ENV:", process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME); // you can delete this after it works

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "", // <-- this is important
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

module.exports = db;
