import sheets from "../config/googleSheets.js";
import { convertRowsToObjects } from "../utils/google.js";

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

const DASHBOARD_RANGE =
  process.env.GOOGLE_SHEET_RANGE || "Dashboard!A:ZZ";

const HOSPITALITY_RANGE =
  process.env.HOSPITALITY_SHEET_RANGE || "Hospitality!A:ZZ";

async function getSheetData(range) {
  try {
    if (!GOOGLE_SHEET_ID) {
      throw new Error("GOOGLE_SHEET_ID missing in .env");
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range,
    });

    const rows = response.data.values || [];

    return convertRowsToObjects(rows);
  } catch (error) {
    console.log("GOOGLE SHEETS ERROR:", error.message);

    throw error;
  }
}

export async function getDashboardData() {
  return getSheetData(DASHBOARD_RANGE);
}

export async function getHospitalityData() {
  return getSheetData(HOSPITALITY_RANGE);
}