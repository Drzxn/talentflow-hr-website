import express from "express";
import { google } from "googleapis";
import fs from "fs";

const router = express.Router();

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

/* ==============================
   GOOGLE AUTH
============================== */

function parseServiceAccountJson() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!raw || raw.includes("PASTE_")) {
    return null;
  }

  try {
    let cleaned = raw.trim();

    if (
      (cleaned.startsWith("'") && cleaned.endsWith("'")) ||
      (cleaned.startsWith('"') && cleaned.endsWith('"'))
    ) {
      cleaned = cleaned.slice(1, -1);
    }

    cleaned = cleaned.replace(/\r?\n/g, "");

    const credentials = JSON.parse(cleaned);

    if (!credentials.client_email || !credentials.private_key) {
      throw new Error("client_email or private_key missing");
    }

    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");

    return credentials;
  } catch (error) {
    console.error("GOOGLE_SERVICE_ACCOUNT_JSON parse error:", error.message);

    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is invalid JSON. Paste the full real JSON correctly in one line."
    );
  }
}

function getGoogleAuth() {
  const credentials = parseServiceAccountJson();

  if (credentials) {
    return new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
  }

  const localFile = "./credentials.json";

  if (fs.existsSync(localFile)) {
    return new google.auth.GoogleAuth({
      keyFile: localFile,
      scopes: SCOPES,
    });
  }

  const secretFile = "/etc/secrets/service-account.json";

  if (fs.existsSync(secretFile)) {
    return new google.auth.GoogleAuth({
      keyFile: secretFile,
      scopes: SCOPES,
    });
  }

  throw new Error(
    "Google credentials missing. Add GOOGLE_SERVICE_ACCOUNT_JSON in Render Environment Variables."
  );
}

async function getSheetsClient() {
  const auth = getGoogleAuth();
  const client = await auth.getClient();

  return google.sheets({
    version: "v4",
    auth: client,
  });
}

/* ==============================
   HELPERS
============================== */

async function getAvailableTabs({ sheets, spreadsheetId }) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });

  return (
    meta.data.sheets
      ?.map((sheet) => sheet.properties?.title)
      .filter(Boolean) || []
  );
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
      // try next range
    }
  }

  const availableTabs = await getAvailableTabs({
    sheets,
    spreadsheetId,
  });

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

  if (!preferredRanges || preferredRanges.length === 0) {
    throw new Error("Sheet range is missing in environment variables");
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

/* ==============================
   ROUTES
============================== */

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

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SHEET_ID is missing");
    }

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
        "Sheet1!A:Z",
        "'Sheet1'!A:Z",
        "Dashboard!A:Z",
        "'Dashboard'!A:Z",
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
      fix: "Check GOOGLE_SHEET_ID, GOOGLE_SHEET_RANGE, GOOGLE_SERVICE_ACCOUNT_JSON and Google Sheet permission.",
    });
  }
});

router.get("/submissions", async (req, res) => {
  try {
    const sheetId = process.env.SUBMISSION_SHEET_ID || process.env.GOOGLE_SHEET_ID;

    const result = await getSheetRows({
      spreadsheetId: sheetId,
      preferredRanges: [
        process.env.SUBMISSION_RANGE,
        "Submission!A:Z",
        "'Submission'!A:Z",
        "Submissions!A:Z",
        "'Submissions'!A:Z",
        "'Submissions Data'!A:Z",
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
      fix: "Check SUBMISSION_SHEET_ID, SUBMISSION_RANGE, GOOGLE_SERVICE_ACCOUNT_JSON and Google Sheet permission.",
    });
  }
});

router.get("/reports", async (req, res) => {
  try {
    const sheetId = process.env.SUBMISSION_SHEET_ID || process.env.GOOGLE_SHEET_ID;

    const result = await getSheetRows({
      spreadsheetId: sheetId,
      preferredRanges: [
        process.env.SUBMISSION_RANGE,
        "Submission!A:Z",
        "'Submission'!A:Z",
        "Submissions!A:Z",
        "'Submissions'!A:Z",
        "'Submissions Data'!A:Z",
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
      fix: "Check SUBMISSION_SHEET_ID, SUBMISSION_RANGE, GOOGLE_SERVICE_ACCOUNT_JSON and Google Sheet permission.",
    });
  }
});

router.get("/internships", async (req, res) => {
  try {
    const sheetId = process.env.INTERNSHIP_SHEET_ID || process.env.GOOGLE_SHEET_ID;

    const result = await getSheetRows({
      spreadsheetId: sheetId,
      preferredRanges: [
        process.env.INTERNSHIP_RANGE,
        "Internship!A:Z",
        "'Internship'!A:Z",
        "Internships!A:Z",
        "'Internships'!A:Z",
        "'Internship Data'!A:Z",
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
      fix: "Check INTERNSHIP_SHEET_ID, INTERNSHIP_RANGE, GOOGLE_SERVICE_ACCOUNT_JSON and Google Sheet permission.",
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
      fix: "Check OFFER_SHEET_ID/OFFERS_SHEET_ID, OFFER_RANGE/OFFERS_RANGE, GOOGLE_SERVICE_ACCOUNT_JSON and Google Sheet permission.",
    });
  }
});

router.get("/all-data", async (req, res) => {
  try {
    const submissions = await getSheetRows({
      spreadsheetId: process.env.SUBMISSION_SHEET_ID || process.env.GOOGLE_SHEET_ID,
      preferredRanges: [
        process.env.SUBMISSION_RANGE,
        "Submission!A:Z",
        "'Submission'!A:Z",
        "Submissions!A:Z",
        "'Submissions'!A:Z",
        "'Submissions Data'!A:Z",
      ],
    });

    const internships = await getSheetRows({
      spreadsheetId: process.env.INTERNSHIP_SHEET_ID || process.env.GOOGLE_SHEET_ID,
      preferredRanges: [
        process.env.INTERNSHIP_RANGE,
        "Internship!A:Z",
        "'Internship'!A:Z",
        "Internships!A:Z",
        "'Internships'!A:Z",
        "'Internship Data'!A:Z",
      ],
    });

    const offers = await getSheetRows({
      spreadsheetId:
        process.env.OFFER_SHEET_ID ||
        process.env.OFFERS_SHEET_ID ||
        process.env.GOOGLE_SHEET_ID,
      preferredRanges: [
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
      fix: "Check all sheet IDs, ranges, GOOGLE_SERVICE_ACCOUNT_JSON and Google Sheet permission.",
    });
  }
});

export default router;