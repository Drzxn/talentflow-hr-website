import express from "express";
import { google } from "googleapis";
import path from "path";

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!sheetId) {
      return res.status(400).json({
        success: false,
        error: "GOOGLE_SHEET_ID is missing in .env",
      });
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: "/etc/secrets/service-account.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const client = await auth.getClient();

    const sheets = google.sheets({
      version: "v4",
      auth: client,
    });

    const meta = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const sheetName = meta.data.sheets?.[0]?.properties?.title;

    if (!sheetName) {
      return res.status(404).json({
        success: false,
        error: "No sheet tab found in Google Sheet",
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${sheetName}'!A1:Z1000`,
    });

    const rows = response.data.values || [];

    if (!rows.length) {
      return res.json({
        success: true,
        sheetId,
        sheetName,
        total: 0,
        data: [],
      });
    }

    const headers = rows[0].map((header) => String(header).trim());

    const data = rows.slice(1).map((row) => {
      const obj = {};

      headers.forEach((header, index) => {
        obj[header] = row[index] || "";
      });

      return obj;
    });

    res.json({
      success: true,
      sheetId,
      sheetName,
      total: data.length,
      data,
    });
  } catch (error) {
    console.log("MAIN GOOGLE SHEET ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message,
      fix: "Share this main Google Sheet with your service-account email as Viewer.",
    });
  }
});

export default router;