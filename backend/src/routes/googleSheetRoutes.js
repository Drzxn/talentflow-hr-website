import express from "express";
import { google } from "googleapis";
import fs from "fs";

const router = express.Router();

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

/* ==============================
   GOOGLE AUTH
============================== */

function getGoogleAuth() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (json && !json.includes("PASTE_")) {
    try {
      const credentials = JSON.parse(json);

      return new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
      });
    } catch {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_JSON is invalid JSON. Paste the full real JSON correctly."
      );
    }
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

/* ==============================
   SHEET HELPERS
============================== */

async function getSheetsClient() {
  const auth = getGoogleAuth();
  const client = await auth.getClient();

  return google.sheets({
    version: "v4",
    auth: client,
  });
}

async function findSheetRange({ sheets, spreadsheetId, preferredRanges }) {
  for (const range of preferredRanges) {
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

  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  const availableTabs =
    meta.data.sheets?.map((s) => s.properties?.title).filter(Boolean) || [];

  throw new Error(
    `No matching sheet tab found. Tried: ${preferredRanges.join(
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
    },
  });
});

router.get("/test-sheets", (req, res) => {
  res.json({
    success: true,
    message: "Google Sheets routes working successfully",
  });
});

/* ==============================
   DASHBOARD
============================== */

router.get("/dashboard", async (req, res) => {
  try {
    const result = await getSheetRows({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      preferredRanges: [
        process.env.NB_DASHBOARD_RANGE,
        process.env.GOOGLE_SHEET_RANGE,
        "Sheet1!A:Z",
      ].filter(Boolean),
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

/* ==============================
   SUBMISSIONS
============================== */

router.get("/submissions", async (req, res) => {
  try {
    const result = await getSheetRows({
      spreadsheetId: process.env.SUBMISSION_SHEET_ID || process.env.GOOGLE_SHEET_ID,
      preferredRanges: [
        process.env.SUBMISSION_RANGE,
        "Submission!A:Z",
        "'Submission'!A:Z",
        "Submissions!A:Z",
        "'Submissions'!A:Z",
        "'Submissions Data'!A:Z",
      ].filter(Boolean),
    });

    res.json({
      success: true,
      type: "submissions",
      sheetId: process.env.SUBMISSION_SHEET_ID || process.env.GOOGLE_SHEET_ID,
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

/* Old reports URL returns submissions data */
router.get("/reports", async (req, res) => {
  try {
    const result = await getSheetRows({
      spreadsheetId: process.env.SUBMISSION_SHEET_ID || process.env.GOOGLE_SHEET_ID,
      preferredRanges: [
        process.env.SUBMISSION_RANGE,
        "Submission!A:Z",
        "'Submission'!A:Z",
        "Submissions!A:Z",
        "'Submissions'!A:Z",
        "'Submissions Data'!A:Z",
      ].filter(Boolean),
    });

    res.json({
      success: true,
      type: "submissions",
      sheetId: process.env.SUBMISSION_SHEET_ID || process.env.GOOGLE_SHEET_ID,
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

/* ==============================
   INTERNSHIPS
============================== */

router.get("/internships", async (req, res) => {
  try {
    const result = await getSheetRows({
      spreadsheetId: process.env.INTERNSHIP_SHEET_ID || process.env.GOOGLE_SHEET_ID,
      preferredRanges: [
        process.env.INTERNSHIP_RANGE,
        "Internship!A:Z",
        "'Internship'!A:Z",
        "Internships!A:Z",
        "'Internships'!A:Z",
        "'Internship Data'!A:Z",
      ].filter(Boolean),
    });

    res.json({
      success: true,
      type: "internships",
      sheetId: process.env.INTERNSHIP_SHEET_ID || process.env.GOOGLE_SHEET_ID,
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

/* ==============================
   OFFERS
============================== */

router.get("/offers", async (req, res) => {
  try {
    const result = await getSheetRows({
      spreadsheetId: process.env.OFFER_SHEET_ID || process.env.GOOGLE_SHEET_ID,
      preferredRanges: [
        process.env.OFFER_RANGE,
        "Offer!A:Z",
        "'Offer'!A:Z",
        "Offers!A:Z",
        "'Offers'!A:Z",
        "'Offers Data'!A:Z",
      ].filter(Boolean),
    });

    res.json({
      success: true,
      type: "offers",
      sheetId: process.env.OFFER_SHEET_ID || process.env.GOOGLE_SHEET_ID,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: "/api/sheets/offers",
      error: error.message,
      fix: "Check OFFER_SHEET_ID, OFFER_RANGE, GOOGLE_SERVICE_ACCOUNT_JSON and Google Sheet permission.",
    });
  }
});

/* ==============================
   ALL DATA
============================== */

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
      ].filter(Boolean),
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
      ].filter(Boolean),
    });

    const offers = await getSheetRows({
      spreadsheetId: process.env.OFFER_SHEET_ID || process.env.GOOGLE_SHEET_ID,
      preferredRanges: [
        process.env.OFFER_RANGE,
        "Offer!A:Z",
        "'Offer'!A:Z",
        "Offers!A:Z",
        "'Offers'!A:Z",
        "'Offers Data'!A:Z",
      ].filter(Boolean),
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