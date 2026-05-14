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

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

function mountRoute(path, route) {
  if (!route) {
    console.error(`Route missing: ${path}`);
    return;
  }
  app.use(path, route);
  console.log(`Mounted route: ${path}`);
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TalentFlow backend is running",
    port: PORT,
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
    PORT: process.env.PORT || "5000",
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ? "SET" : "MISSING",
    GOOGLE_SHEET_RANGE: process.env.GOOGLE_SHEET_RANGE || "MISSING",
    GOOGLE_SERVICE_ACCOUNT_JSON: process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? "SET" : "MISSING",
    SUBMISSION_SHEET_ID: process.env.SUBMISSION_SHEET_ID ? "SET" : "MISSING",
    SUBMISSION_RANGE: process.env.SUBMISSION_RANGE || "MISSING",
    INTERNSHIP_SHEET_ID: process.env.INTERNSHIP_SHEET_ID ? "SET" : "MISSING",
    INTERNSHIP_RANGE: process.env.INTERNSHIP_RANGE || "MISSING",
    OFFER_SHEET_ID: process.env.OFFER_SHEET_ID ? "SET" : "MISSING",
    OFFERS_SHEET_ID: process.env.OFFERS_SHEET_ID ? "SET" : "MISSING",
    OFFER_RANGE: process.env.OFFER_RANGE || "MISSING",
    OFFERS_RANGE: process.env.OFFERS_RANGE || "MISSING",
    HOSPITALITY_SHEET_ID: process.env.HOSPITALITY_SHEET_ID ? "SET" : "MISSING",
    HOSPITALITY_SHEET_RANGE: process.env.HOSPITALITY_SHEET_RANGE || "MISSING",
  });
});

mountRoute("/api/auth", authRoutes);
mountRoute("/api/users", userRoutes);
mountRoute("/api/dashboard", dashboardRoutes);
mountRoute("/api/reports", reportRoutes);
mountRoute("/api/sheets", googleSheetRoutes);
mountRoute("/api/hospitality", hospitalityRoutes);

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Test route working successfully",
  });
});

app.get("/api/test-sheets", (req, res) => {
  res.json({
    success: true,
    message: "Google Sheets test route working successfully",
    testUrls: {
      sheetsRoot: "/api/sheets",
      tabs: "/api/sheets/tabs",
      dashboard: "/api/sheets/dashboard",
      submissions: "/api/sheets/submissions",
      reports: "/api/sheets/reports",
      internships: "/api/sheets/internships",
      offers: "/api/sheets/offers",
      allData: "/api/sheets/all-data",
      hospitality: "/api/hospitality/dashboard",
    },
  });
});

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
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Sheets: http://localhost:${PORT}/api/sheets`);
  console.log(`Offers: http://localhost:${PORT}/api/sheets/offers`);
});