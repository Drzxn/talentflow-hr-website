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

/* ==============================
   CORS
============================== */

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* ==============================
   BODY PARSER
============================== */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ==============================
   ROOT ROUTES
============================== */

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

/* ==============================
   MAIN ROUTES
============================== */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/sheets", googleSheetRoutes);
app.use("/api/hospitality", hospitalityRoutes);

/* ==============================
   TEST ROUTES
============================== */

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
      dashboard: "/api/sheets/dashboard",
      submissions: "/api/sheets/submissions",
      reports: "/api/sheets/reports",
      internships: "/api/sheets/internships",
      offers: "/api/sheets/offers",
      allData: "/api/sheets/all-data",
    },
  });
});

/* ==============================
   404 HANDLER
============================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

/* ==============================
   SERVER START
============================== */

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
  console.log(`✅ Sheets: http://localhost:${PORT}/api/sheets`);
  console.log(`✅ Offers: http://localhost:${PORT}/api/sheets/offers`);
  console.log(`✅ Internships: http://localhost:${PORT}/api/sheets/internships`);
  console.log(`✅ Submissions: http://localhost:${PORT}/api/sheets/submissions`);
  console.log("=================================");
});