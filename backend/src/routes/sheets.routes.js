import express from "express";
import { getGoogleSheetsClient } from "../config/googleSheets.js";

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      return res.status(500).json({
        success: false,
        error: "GOOGLE_SHEET_ID is missing",
      });
    }

    const sheets = getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Dashboard!A:Z",
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const headers = rows[0];

    const data = rows.slice(1).map((row) => {
      const obj = {};

      headers.forEach((header, index) => {
        obj[header] = row[index] || "";
      });

      return obj;
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.log("GOOGLE SHEETS ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;