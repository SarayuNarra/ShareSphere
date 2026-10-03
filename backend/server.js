const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const resourceRoutes = require("./routes/resourceRoutes");
const requestRoutes = require("./routes/requestRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const damageRoutes = require("./routes/damageRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ShareSphere backend is running!"
  });
});

app.get("/api/test-db", (req, res) => {
  db.query("SELECT 1 AS result", (err, results) => {
    if (err) {
      console.error("DATABASE ERROR:", err);
      return res.status(500).json({
        success: false,
        message: err.sqlMessage || err.message
      });
    }

    return res.json({
      success: true,
      message: "ShareSphere connected to MySQL!",
      result: results
    });
  });
});

app.use("/api/resources", resourceRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/damage-reports", damageRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log(" ShareSphere Backend");
  console.log("=================================");
  console.log(`Server listening on port ${PORT}`);
  console.log("Database: sharesphere");
  console.log("Status: RUNNING");
  console.log("=================================");
});
