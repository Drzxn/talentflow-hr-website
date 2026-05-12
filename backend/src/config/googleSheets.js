import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

if (!GOOGLE_SHEET_ID) {
  throw new Error("GOOGLE_SHEET_ID is missing in Render Environment Variables");
}

if (!SERVICE_ACCOUNT_JSON) {
  throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is missing in Render Environment Variables");
}

let credentials;

try {
  credentials = JSON.parse(SERVICE_ACCOUNT_JSON);
} catch (error) {
  throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
}

if (!credentials.client_email) {
  throw new Error("client_email is missing in GOOGLE_SERVICE_ACCOUNT_JSON");
}

if (!credentials.private_key) {
  throw new Error("private_key is missing in GOOGLE_SERVICE_ACCOUNT_JSON");
}

credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

export { sheets, GOOGLE_SHEET_ID };