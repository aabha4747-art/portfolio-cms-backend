require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const pool = require("./src/config/db");

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: "*",
  })
);

// Parse incoming JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan("dev"));

// Main test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Portfolio CMS API is running",
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    project: "Portfolio CMS",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      success: true,
      message: "Database connected successfully",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.get("/api/db-tables", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    res.status(200).json({
      success: true,
      message: "Database tables retrieved successfully",
      count: result.rows.length,
      tables: result.rows.map((row) => row.table_name),
    });
  } catch (error) {
    console.error("Error retrieving database tables:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve database tables",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio CMS server running on port ${PORT}`);
});