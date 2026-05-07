import express from "express";
import { google } from "googleapis";
import path from "path";

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    const sheetId = process.env.HOSPITALITY_SHEET_ID;

    if (!sheetId) {
      return res.status(400).json({
        success: false,
        error: "HOSPITALITY_SHEET_ID is missing in .env",
      });
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), "service-account.json"),
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
        error: "No sheet tab found in Hospitality Sheet",
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
    console.log("HOSPITALITY GOOGLE SHEET ERROR:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      fix:
        "Share the Hospitality Google Sheet with talentflow-service-439@complete-octane-495507-f1.iam.gserviceaccount.com as Viewer.",
      sheetId: process.env.HOSPITALITY_SHEET_ID || null,
    });
  }
});

export default router;