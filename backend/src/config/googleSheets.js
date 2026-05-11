import express from "express";
import sheets from "../config/googleSheets.js";

const router = express.Router();

function rowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];

  const headers = rows[0].map((h) => String(h || "").trim());

  return rows.slice(1).map((row) => {
    const obj = {};

    headers.forEach((header, index) => {
      obj[header || `Column_${index + 1}`] = row[index] || "";
    });

    return obj;
  });
}

router.get("/dashboard", async (req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      return res.status(400).json({
        success: false,
        error: "GOOGLE_SHEET_ID is missing in .env",
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A:Z",
    });

    const rows = response.data.values || [];
    const data = rowsToObjects(rows);

    return res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("GOOGLE SHEET DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
      fix: "Check GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and share Google Sheet with service account as Viewer.",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      return res.status(400).json({
        success: false,
        error: "GOOGLE_SHEET_ID is missing in .env",
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A:Z",
    });

    const rows = response.data.values || [];
    const data = rowsToObjects(rows);

    return res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("GOOGLE SHEET ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;