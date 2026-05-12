import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON missing");
}

const credentials = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON
);

credentials.private_key =
  credentials.private_key.replace(/\\n/g, "\n");

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
  ],
});

export const sheets = google.sheets({
  version: "v4",
  auth,
});

export const GOOGLE_SHEET_ID =
  process.env.GOOGLE_SHEET_ID;