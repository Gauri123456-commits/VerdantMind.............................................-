import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MySQL Connection Pool (Railway MySQL config via .env)
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ✅ API Endpoint to Save Signup Data
app.post("/api/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  console.log("📥 Signup request received:", { fullName, email });

  if (!fullName || !email || !password) {
    console.log("❌ Missing fields");
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
      [fullName, email, hashedPassword]
    );

    console.log("✅ User inserted:", result.insertId);
    res.status(200).json({ message: "User saved to MySQL" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      console.error("❌ Email already exists");
      res.status(400).json({ error: "Email already exists" });
    } else {
      console.error("❌ MySQL Error:", error);
      res.status(500).json({ error: "Database error" });
    }
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
