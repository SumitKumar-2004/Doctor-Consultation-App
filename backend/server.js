const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
require("./config/passport.js");

const passport = require("passport");
const response = require("./middleware/response.js");

const app = express();

/* ---------------------- SECURITY MIDDLEWARE ---------------------- */

// Helmet for security headers
app.use(helmet());

// Logger
app.use(morgan("combined"));

/* ---------------------- CORS CONFIGURATION ---------------------- */

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* ---------------------- BODY PARSING ---------------------- */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* ---------------------- RESPONSE HELPER ---------------------- */

app.use(response);

/* ---------------------- PASSPORT ---------------------- */

app.use(passport.initialize());

/* ---------------------- DATABASE CONNECTION ---------------------- */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* ---------------------- ROUTES ---------------------- */

app.use("/api/auth", require("./routes/auth"));
app.use("/api/doctor", require("./routes/doctor"));
app.use("/api/patient", require("./routes/patient"));
app.use("/api/appointment", require("./routes/appointments"));
app.use("/api/payment", require("./routes/payments"));

/* ---------------------- HEALTH CHECK ---------------------- */

app.get("/health", (req, res) =>
  res.ok({ time: new Date().toISOString() }, "Server running")
);

/* ---------------------- 404 HANDLER ---------------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

/* ---------------------- GLOBAL ERROR HANDLER ---------------------- */

app.use((err, req, res, next) => {
  console.error("🔴 Unhandled error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

/* ---------------------- START SERVER ---------------------- */

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});