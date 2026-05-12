import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import googleSheetRoutes from "./routes/googleSheetRoutes.js";
import hospitalityRoutes from "./routes/hospitality.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://talentflow-hr-website-1.onrender.com",
  "https://talentflow-hr-website.onrender.com",
  "https://talentflow-hr-website-m3yb.onrender.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

function mountRoute(path, route) {
  if (typeof route !== "function") {
    console.error(`❌ Route broken at ${path}. Expected function/router but got:`, typeof route);
    throw new Error(`Route import is invalid: ${path}`);
  }

  app.use(path, route);
  console.log(`✅ Mounted route: ${path}`);
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TalentFlow backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working fine",
    port: PORT,
  });
});

app.get("/api/env-check", (req, res) => {
  res.json({
    success: true,
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ? "SET" : "MISSING",
    GOOGLE_SERVICE_ACCOUNT_JSON: process.env.GOOGLE_SERVICE_ACCOUNT_JSON
      ? "SET"
      : "MISSING",
  });
});

mountRoute("/api/auth", authRoutes);
mountRoute("/api/users", userRoutes);
mountRoute("/api/dashboard", dashboardRoutes);
mountRoute("/api/reports", reportRoutes);
mountRoute("/api/sheets", googleSheetRoutes);
mountRoute("/api/hospitality", hospitalityRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  res.status(500).json({
    success: false,
    error: error.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});