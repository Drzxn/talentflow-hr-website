import express from "express";
import { google } from "googleapis";
import fs from "fs";

const router = express.Router();

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

function getGoogleAuth() {
  const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;

  if (base64) {
    const jsonString = Buffer.from(base64.trim(), "base64").toString("utf8");
    const credentials = JSON.parse(jsonString);

    credentials.private_key = credentials.private_key
      .replace(/\\n/g, "\n")
      .replace(/\r/g, "");

    return new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
  }

  if (fs.existsSync("./service-account.json")) {
    return new google.auth.GoogleAuth({
      keyFile: "./service-account.json",
      scopes: SCOPES,
    });
  }

  if (fs.existsSync("./credentials.json")) {
    return new google.auth.GoogleAuth({
      keyFile: "./credentials.json",
      scopes: SCOPES,
    });
  }

  if (fs.existsSync("/etc/secrets/service-account.json")) {
    return new google.auth.GoogleAuth({
      keyFile: "/etc/secrets/service-account.json",
      scopes: SCOPES,
    });
  }

  throw new Error("Google credentials missing. Add GOOGLE_SERVICE_ACCOUNT_BASE64.");
}

async function getSheetsClient() {
  const auth = getGoogleAuth();
  const client = await auth.getClient();

  return google.sheets({
    version: "v4",
    auth: client,
  });
}

async function getAvailableTabs({ sheets, spreadsheetId }) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });

  return meta.data.sheets?.map((s) => s.properties?.title).filter(Boolean) || [];
}

async function findSheetRange({ sheets, spreadsheetId, preferredRanges }) {
  const ranges = preferredRanges.filter(Boolean);

  for (const range of ranges) {
    try {
      await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return range;
    } catch {
      // Try next tab
    }
  }

  const availableTabs = await getAvailableTabs({ sheets, spreadsheetId });

  throw new Error(
    `No matching sheet tab found. Tried: ${ranges.join(
      ", "
    )}. Available tabs: ${availableTabs.join(", ")}`
  );
}

async function getSheetRows({ spreadsheetId, preferredRanges }) {
  if (!spreadsheetId) {
    throw new Error("Spreadsheet ID is missing in environment variables");
  }

  const sheets = await getSheetsClient();

  const finalRange = await findSheetRange({
    sheets,
    spreadsheetId,
    preferredRanges,
  });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: finalRange,
  });

  const rows = response.data.values || [];

  if (!rows.length) {
    return {
      sheetName: finalRange,
      total: 0,
      data: [],
    };
  }

  const headers = rows[0].map((header) => String(header || "").trim());

  const data = rows.slice(1).map((row) => {
    const obj = {};

    headers.forEach((header, index) => {
      if (header) {
        obj[header] = row[index] || "";
      }
    });

    return obj;
  });

  return {
    sheetName: finalRange,
    total: data.length,
    data,
  };
}

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Google Sheets routes working successfully",
    routes: {
      dashboard: "/api/sheets/dashboard",
      submissions: "/api/sheets/submissions",
      reports: "/api/sheets/reports",
      internships: "/api/sheets/internships",
      offers: "/api/sheets/offers",
      allData: "/api/sheets/all-data",
      tabs: "/api/sheets/tabs",
    },
  });
});

router.get("/tabs", async (req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const sheets = await getSheetsClient();

    const tabs = await getAvailableTabs({
      sheets,
      spreadsheetId,
    });

    res.json({
      success: true,
      sheetId: spreadsheetId,
      tabs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: "/api/sheets/tabs",
      error: error.message,
    });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const result = await getSheetRows({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      preferredRanges: [
        process.env.NB_DASHBOARD_RANGE,
        process.env.GOOGLE_SHEET_RANGE,
        "Dashboard!A:Z",
        "'Dashboard'!A:Z",
        "Sheet1!A:Z",
        "'Sheet1'!A:Z",
      ],
    });

    res.json({
      success: true,
      type: "dashboard",
      sheetId: process.env.GOOGLE_SHEET_ID,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: "/api/sheets/dashboard",
      error: error.message,
    });
  }
});

router.get("/submissions", async (req, res) => {
  try {
    const sheetId =
      process.env.SUBMISSION_SHEET_ID ||
      process.env.GOOGLE_SHEET_ID;

    const result = await getSheetRows({
      spreadsheetId: sheetId,
      preferredRanges: [
        process.env.SUBMISSION_RANGE,
        "Submission!A:Z",
        "'Submission'!A:Z",
        "Submissions!A:Z",
        "'Submissions'!A:Z",
        "'Submissions Data'!A:Z",
        "Dashboard!A:Z",
        "'Dashboard'!A:Z",
      ],
    });

    res.json({
      success: true,
      type: "submissions",
      sheetId,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: "/api/sheets/submissions",
      error: error.message,
    });
  }
});

router.get("/reports", async (req, res) => {
  try {
    const sheetId =
      process.env.SUBMISSION_SHEET_ID ||
      process.env.GOOGLE_SHEET_ID;

    const result = await getSheetRows({
      spreadsheetId: sheetId,
      preferredRanges: [
        process.env.SUBMISSION_RANGE,
        "Submission!A:Z",
        "'Submission'!A:Z",
        "Submissions!A:Z",
        "'Submissions'!A:Z",
        "'Submissions Data'!A:Z",
        "Dashboard!A:Z",
        "'Dashboard'!A:Z",
      ],
    });

    res.json({
      success: true,
      type: "reports",
      sheetId,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: "/api/sheets/reports",
      error: error.message,
    });
  }
});

router.get("/internships", async (req, res) => {
  try {
    const sheetId =
      process.env.INTERNSHIP_SHEET_ID ||
      process.env.GOOGLE_SHEET_ID;

    const result = await getSheetRows({
      spreadsheetId: sheetId,
      preferredRanges: [
        process.env.INTERNSHIP_RANGE,
        "Internship!A:Z",
        "'Internship'!A:Z",
        "Internships!A:Z",
        "'Internships'!A:Z",
        "'Internship Data'!A:Z",
        "Sheet5!A:Z",
        "'Sheet5'!A:Z",
      ],
    });

    res.json({
      success: true,
      type: "internships",
      sheetId,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: "/api/sheets/internships",
      error: error.message,
    });
  }
});

router.get("/offers", async (req, res) => {
  try {
    const sheetId =
      process.env.OFFER_SHEET_ID ||
      process.env.OFFERS_SHEET_ID ||
      process.env.GOOGLE_SHEET_ID;

    const result = await getSheetRows({
      spreadsheetId: sheetId,
      preferredRanges: [
        "Sheet5!A:Z",
        "'Sheet5'!A:Z",
        process.env.OFFER_RANGE,
        process.env.OFFERS_RANGE,
        "Offer!A:Z",
        "'Offer'!A:Z",
        "Offers!A:Z",
        "'Offers'!A:Z",
        "'Offers Data'!A:Z",
      ],
    });

    res.json({
      success: true,
      type: "offers",
      sheetId,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: "/api/sheets/offers",
      error: error.message,
      fix: "Available tabs are Dashboard and Sheet5. Offers route uses Sheet5!A:Z.",
    });
  }
});

router.get("/all-data", async (req, res) => {
  try {
    const submissions = await getSheetRows({
      spreadsheetId:
        process.env.SUBMISSION_SHEET_ID ||
        process.env.GOOGLE_SHEET_ID,
      preferredRanges: [
        process.env.SUBMISSION_RANGE,
        "Submission!A:Z",
        "'Submission'!A:Z",
        "Submissions!A:Z",
        "'Submissions'!A:Z",
        "'Submissions Data'!A:Z",
        "Dashboard!A:Z",
        "'Dashboard'!A:Z",
      ],
    });

    const internships = await getSheetRows({
      spreadsheetId:
        process.env.INTERNSHIP_SHEET_ID ||
        process.env.GOOGLE_SHEET_ID,
      preferredRanges: [
        process.env.INTERNSHIP_RANGE,
        "Internship!A:Z",
        "'Internship'!A:Z",
        "Internships!A:Z",
        "'Internships'!A:Z",
        "'Internship Data'!A:Z",
        "Sheet5!A:Z",
        "'Sheet5'!A:Z",
      ],
    });

    const offers = await getSheetRows({
      spreadsheetId:
        process.env.OFFER_SHEET_ID ||
        process.env.OFFERS_SHEET_ID ||
        process.env.GOOGLE_SHEET_ID,
      preferredRanges: [
        "Sheet5!A:Z",
        "'Sheet5'!A:Z",
        process.env.OFFER_RANGE,
        process.env.OFFERS_RANGE,
        "Offer!A:Z",
        "'Offer'!A:Z",
        "Offers!A:Z",
        "'Offers'!A:Z",
        "'Offers Data'!A:Z",
      ],
    });

    res.json({
      success: true,
      counts: {
        submissions: submissions.total,
        internships: internships.total,
        offers: offers.total,
      },
      submissions,
      internships,
      offers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: "/api/sheets/all-data",
      error: error.message,
    });
  }
});

export default router;