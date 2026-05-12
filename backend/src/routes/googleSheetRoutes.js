import express from "express";
import { sheets } from "../config/googleSheets.js";

const router = express.Router();

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

router.get("/dashboard", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Sheet1!A:Z",
    });

    res.json({
      success: true,
      data: response.data.values || [],
    });
  } catch (error) {
    console.error("MAIN GOOGLE SHEET ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;